/**
 * AI Site Generator - GitHub File Upload Module
 * 
 * This module provides functionality to upload generated website files
 * to GitHub repositories using the Octokit API.
 */

export { GitHubFileUploader } from './services/fileUploader.js';
export type {
  UploadFile,
  UploadBatch,
  UploadProgress,
  UploadResult,
  UploadError,
  RepositoryConfig,
  OctokitConfig,
  UploadOptions,
  ProgressCallback
} from './types/upload.js';
export {
  isBinaryFile,
  encodeFileContent,
  validateFile,
  calculateTotalSize,
  generateCommitMessage,
  createBatches
} from './utils/fileUtils.js';