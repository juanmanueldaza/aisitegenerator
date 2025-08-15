/**
 * GitHub file upload service using Octokit
 */

import { Octokit } from '@octokit/rest';
import { 
  UploadFile, 
  UploadBatch, 
  UploadProgress, 
  UploadResult, 
  UploadError, 
  RepositoryConfig, 
  OctokitConfig, 
  UploadOptions, 
  ProgressCallback 
} from '../types/upload.js';
import {
  encodeFileContent,
  validateFile,
  calculateTotalSize,
  generateCommitMessage,
  createBatches,
  delay
} from '../utils/fileUtils.js';

export class GitHubFileUploader {
  private octokit: Octokit;
  private config: RepositoryConfig;
  private options: Required<UploadOptions>;

  constructor(octokitConfig: OctokitConfig, repoConfig: RepositoryConfig, options: UploadOptions = {}) {
    this.octokit = new Octokit({
      auth: octokitConfig.auth,
      userAgent: octokitConfig.userAgent || 'AI Site Generator v1.0.0',
      baseUrl: octokitConfig.baseUrl
    });

    this.config = repoConfig;
    
    // Set default options
    this.options = {
      batchSize: options.batchSize || 50,
      maxFileSize: options.maxFileSize || 25 * 1024 * 1024, // 25MB GitHub limit
      allowedExtensions: options.allowedExtensions || [],
      onProgress: options.onProgress || (() => {}),
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000
    };
  }

  /**
   * Upload multiple files in batches
   */
  async uploadFiles(files: UploadFile[], commitMessage?: string): Promise<UploadResult> {
    const totalBytes = calculateTotalSize(files);
    let uploadedBytes = 0;
    let uploadedFiles: string[] = [];
    const errors: UploadError[] = [];

    try {
      // Validate all files first
      for (const file of files) {
        const validation = validateFile(file, this.options);
        if (!validation.valid) {
          errors.push({
            file: file.path,
            error: validation.error!,
            recoverable: false
          });
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          uploadedFiles,
          errors
        };
      }

      // Get the current commit SHA
      const branch = this.config.branch || this.config.defaultBranch || 'main';
      const { data: refData } = await this.octokit.rest.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branch}`
      });

      const baseSha = refData.object.sha;

      // Create batches
      const batches = createBatches(files, this.options.batchSize);
      let commitSha = baseSha;

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchMessage = batches.length > 1 
          ? `${commitMessage || generateCommitMessage(files)} (batch ${batchIndex + 1}/${batches.length})`
          : commitMessage || generateCommitMessage(files);

        try {
          const result = await this.uploadBatch({
            files: batch,
            commitMessage: batchMessage,
            branch
          }, commitSha);

          if (result.success && result.commitSha) {
            commitSha = result.commitSha;
            uploadedFiles.push(...result.uploadedFiles);
            
            // Update progress
            uploadedBytes += batch.reduce((sum, file) => sum + (file.size || 0), 0);
            this.options.onProgress({
              totalFiles: files.length,
              uploadedFiles: uploadedFiles.length,
              currentFile: batch[batch.length - 1].path,
              percentComplete: Math.round((uploadedFiles.length / files.length) * 100),
              bytesUploaded: uploadedBytes,
              totalBytes
            });
          } else {
            errors.push(...result.errors);
          }
        } catch (error) {
          // Handle batch upload error
          const batchError: UploadError = {
            file: `batch_${batchIndex + 1}`,
            error: error instanceof Error ? error.message : 'Unknown error',
            recoverable: true
          };
          errors.push(batchError);
        }
      }

      return {
        success: errors.length === 0,
        commitSha: commitSha !== baseSha ? commitSha : undefined,
        uploadedFiles,
        errors
      };

    } catch (error) {
      return {
        success: false,
        uploadedFiles,
        errors: [{
          file: 'general',
          error: error instanceof Error ? error.message : 'Unknown error',
          recoverable: true
        }]
      };
    }
  }

  /**
   * Upload a single batch of files as one commit
   */
  private async uploadBatch(batch: UploadBatch, parentSha: string): Promise<UploadResult> {
    const uploadedFiles: string[] = [];
    const errors: UploadError[] = [];

    try {
      // Create tree entries for all files in the batch
      const tree = await Promise.all(
        batch.files.map(async (file) => {
          try {
            const { content, encoding } = encodeFileContent(file.content, file.path);
            
            // Create blob
            const { data: blob } = await this.octokit.rest.git.createBlob({
              owner: this.config.owner,
              repo: this.config.repo,
              content,
              encoding
            });

            return {
              path: file.path,
              mode: '100644' as const,
              type: 'blob' as const,
              sha: blob.sha
            };
          } catch (error) {
            errors.push({
              file: file.path,
              error: error instanceof Error ? error.message : 'Failed to create blob',
              recoverable: true
            });
            return null;
          }
        })
      );

      // Filter out failed files
      const validTreeEntries = tree.filter(entry => entry !== null);
      
      if (validTreeEntries.length === 0) {
        return { success: false, uploadedFiles, errors };
      }

      // Create tree
      const { data: newTree } = await this.octokit.rest.git.createTree({
        owner: this.config.owner,
        repo: this.config.repo,
        tree: validTreeEntries,
        base_tree: parentSha
      });

      // Create commit
      const { data: commit } = await this.octokit.rest.git.createCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        message: batch.commitMessage,
        tree: newTree.sha,
        parents: [parentSha]
      });

      // Update reference
      await this.octokit.rest.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${batch.branch || 'main'}`,
        sha: commit.sha
      });

      // Mark successful files
      validTreeEntries.forEach(entry => {
        if (entry) {
          uploadedFiles.push(entry.path);
        }
      });

      return {
        success: true,
        commitSha: commit.sha,
        uploadedFiles,
        errors
      };

    } catch (error) {
      errors.push({
        file: 'batch',
        error: error instanceof Error ? error.message : 'Failed to upload batch',
        recoverable: true
      });
      
      return { success: false, uploadedFiles, errors };
    }
  }

  /**
   * Upload a single file with retry logic
   */
  async uploadSingleFile(file: UploadFile, commitMessage?: string): Promise<UploadResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
      try {
        const result = await this.uploadFiles([file], commitMessage);
        if (result.success) {
          return result;
        }
        
        // If not successful but no recoverable errors, don't retry
        const hasRecoverableErrors = result.errors.some(error => error.recoverable);
        if (!hasRecoverableErrors) {
          return result;
        }
        
        lastError = new Error(result.errors.map(e => e.error).join(', '));
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }

      if (attempt < this.options.retryAttempts) {
        await delay(this.options.retryDelay * attempt);
      }
    }

    return {
      success: false,
      uploadedFiles: [],
      errors: [{
        file: file.path,
        error: lastError?.message || 'Failed after all retry attempts',
        recoverable: false
      }]
    };
  }

  /**
   * Check if repository exists and is accessible
   */
  async validateRepository(): Promise<{ valid: boolean; error?: string }> {
    try {
      await this.octokit.rest.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Repository validation failed'
      };
    }
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<{ limit: number; remaining: number; reset: Date }> {
    const { data } = await this.octokit.rest.rateLimit.get();
    return {
      limit: data.resources.core.limit,
      remaining: data.resources.core.remaining,
      reset: new Date(data.resources.core.reset * 1000)
    };
  }
}