/**
 * Types for file upload functionality
 */

export interface UploadFile {
  path: string;
  content: string | Uint8Array;
  encoding?: 'utf-8' | 'base64';
  size?: number;
}

export interface UploadBatch {
  files: UploadFile[];
  commitMessage: string;
  branch?: string;
}

export interface UploadProgress {
  totalFiles: number;
  uploadedFiles: number;
  currentFile: string;
  percentComplete: number;
  bytesUploaded: number;
  totalBytes: number;
}

export interface UploadResult {
  success: boolean;
  commitSha?: string;
  uploadedFiles: string[];
  errors: UploadError[];
}

export interface UploadError {
  file: string;
  error: string;
  recoverable: boolean;
}

export interface RepositoryConfig {
  owner: string;
  repo: string;
  branch?: string;
  defaultBranch?: string;
}

export interface OctokitConfig {
  auth: string;
  userAgent?: string;
  baseUrl?: string;
}

export type ProgressCallback = (progress: UploadProgress) => void;

export interface UploadOptions {
  batchSize?: number;
  maxFileSize?: number;
  allowedExtensions?: string[];
  onProgress?: ProgressCallback;
  retryAttempts?: number;
  retryDelay?: number;
}