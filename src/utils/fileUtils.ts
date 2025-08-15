/**
 * Utility functions for file handling and validation
 */

import { UploadFile, UploadOptions } from '../types/upload.js';

/**
 * Determines if a file should be treated as binary based on its extension
 */
export function isBinaryFile(filePath: string): boolean {
  const binaryExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.webp',
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.avi', '.mov',
    '.exe', '.dmg', '.deb', '.rpm'
  ];
  
  const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  return binaryExtensions.includes(extension);
}

/**
 * Converts file content to appropriate encoding for GitHub API
 */
export function encodeFileContent(content: string | Uint8Array, filePath: string): { content: string; encoding: 'utf-8' | 'base64' } {
  if (typeof content === 'string') {
    if (isBinaryFile(filePath)) {
      // Convert string to base64 if it's supposed to be binary
      return {
        content: btoa(content),
        encoding: 'base64'
      };
    }
    return {
      content: content,
      encoding: 'utf-8'
    };
  }
  
  // Uint8Array - convert to base64
  const binary = Array.from(content, byte => String.fromCharCode(byte)).join('');
  return {
    content: btoa(binary),
    encoding: 'base64'
  };
}

/**
 * Validates file against upload options
 */
export function validateFile(file: UploadFile, options: UploadOptions): { valid: boolean; error?: string } {
  // Check file size
  if (options.maxFileSize && file.size && file.size > options.maxFileSize) {
    return {
      valid: false,
      error: `File size ${file.size} exceeds maximum allowed size ${options.maxFileSize}`
    };
  }
  
  // Check file extension
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const extension = file.path.toLowerCase().substring(file.path.lastIndexOf('.'));
    if (!options.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension ${extension} is not allowed`
      };
    }
  }
  
  // Check path validity
  if (!file.path || file.path.includes('..') || file.path.startsWith('/')) {
    return {
      valid: false,
      error: 'Invalid file path'
    };
  }
  
  return { valid: true };
}

/**
 * Calculate total size of files in bytes
 */
export function calculateTotalSize(files: UploadFile[]): number {
  return files.reduce((total, file) => {
    if (file.size) {
      return total + file.size;
    }
    // Estimate size if not provided
    if (typeof file.content === 'string') {
      return total + new Blob([file.content]).size;
    }
    return total + file.content.length;
  }, 0);
}

/**
 * Generate a commit message for the upload
 */
export function generateCommitMessage(files: UploadFile[], customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }
  
  if (files.length === 1) {
    return `Add ${files[0].path}`;
  }
  
  return `Add ${files.length} files`;
}

/**
 * Split files into batches for upload
 */
export function createBatches(files: UploadFile[], batchSize: number = 50): UploadFile[][] {
  const batches: UploadFile[][] = [];
  
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Delay function for retry logic
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}