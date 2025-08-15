/**
 * Tests for file utility functions
 */

import {
  isBinaryFile,
  encodeFileContent,
  validateFile,
  calculateTotalSize,
  generateCommitMessage,
  createBatches
} from '../utils/fileUtils';
import { UploadFile, UploadOptions } from '../types/upload';

describe('fileUtils', () => {
  describe('isBinaryFile', () => {
    it('should identify binary file extensions', () => {
      expect(isBinaryFile('image.png')).toBe(true);
      expect(isBinaryFile('photo.JPG')).toBe(true);
      expect(isBinaryFile('font.woff2')).toBe(true);
      expect(isBinaryFile('document.pdf')).toBe(true);
    });

    it('should identify text file extensions', () => {
      expect(isBinaryFile('index.html')).toBe(false);
      expect(isBinaryFile('style.css')).toBe(false);
      expect(isBinaryFile('script.js')).toBe(false);
      expect(isBinaryFile('README.md')).toBe(false);
    });
  });

  describe('encodeFileContent', () => {
    it('should encode text files as utf-8', () => {
      const result = encodeFileContent('Hello, World!', 'test.txt');
      expect(result.content).toBe('Hello, World!');
      expect(result.encoding).toBe('utf-8');
    });

    it('should encode binary files as base64', () => {
      const binaryData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const result = encodeFileContent(binaryData, 'test.png');
      expect(result.encoding).toBe('base64');
      expect(typeof result.content).toBe('string');
    });

    it('should encode string content for binary files as base64', () => {
      const result = encodeFileContent('binary content', 'image.jpg');
      expect(result.encoding).toBe('base64');
      expect(typeof result.content).toBe('string');
    });
  });

  describe('validateFile', () => {
    const options: UploadOptions = {
      maxFileSize: 1024,
      allowedExtensions: ['.html', '.css', '.js'],
      batchSize: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      onProgress: () => {}
    };

    it('should validate valid files', () => {
      const file: UploadFile = {
        path: 'index.html',
        content: '<html></html>',
        size: 500
      };
      const result = validateFile(file, options);
      expect(result.valid).toBe(true);
    });

    it('should reject files that are too large', () => {
      const file: UploadFile = {
        path: 'large.html',
        content: 'content',
        size: 2048
      };
      const result = validateFile(file, options);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should reject files with disallowed extensions', () => {
      const file: UploadFile = {
        path: 'image.png',
        content: 'data',
        size: 500
      };
      const result = validateFile(file, options);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject files with invalid paths', () => {
      const file: UploadFile = {
        path: '../evil.html',
        content: 'content',
        size: 500
      };
      const result = validateFile(file, options);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file path');
    });
  });

  describe('calculateTotalSize', () => {
    it('should calculate total size of files', () => {
      const files: UploadFile[] = [
        { path: 'file1.txt', content: 'content1', size: 100 },
        { path: 'file2.txt', content: 'content2', size: 200 },
        { path: 'file3.txt', content: 'content3', size: 300 }
      ];
      const totalSize = calculateTotalSize(files);
      expect(totalSize).toBe(600);
    });

    it('should estimate size when not provided', () => {
      const files: UploadFile[] = [
        { path: 'file1.txt', content: 'Hello' }
      ];
      const totalSize = calculateTotalSize(files);
      expect(totalSize).toBeGreaterThan(0);
    });
  });

  describe('generateCommitMessage', () => {
    it('should generate message for single file', () => {
      const files: UploadFile[] = [
        { path: 'index.html', content: 'content' }
      ];
      const message = generateCommitMessage(files);
      expect(message).toBe('Add index.html');
    });

    it('should generate message for multiple files', () => {
      const files: UploadFile[] = [
        { path: 'index.html', content: 'content' },
        { path: 'style.css', content: 'content' }
      ];
      const message = generateCommitMessage(files);
      expect(message).toBe('Add 2 files');
    });

    it('should use custom message when provided', () => {
      const files: UploadFile[] = [
        { path: 'index.html', content: 'content' }
      ];
      const customMessage = 'Initial website deployment';
      const message = generateCommitMessage(files, customMessage);
      expect(message).toBe(customMessage);
    });
  });

  describe('createBatches', () => {
    it('should create batches of specified size', () => {
      const files: UploadFile[] = [
        { path: 'file1.txt', content: 'content' },
        { path: 'file2.txt', content: 'content' },
        { path: 'file3.txt', content: 'content' },
        { path: 'file4.txt', content: 'content' },
        { path: 'file5.txt', content: 'content' }
      ];
      const batches = createBatches(files, 2);
      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(2);
      expect(batches[1]).toHaveLength(2);
      expect(batches[2]).toHaveLength(1);
    });

    it('should handle empty files array', () => {
      const files: UploadFile[] = [];
      const batches = createBatches(files, 10);
      expect(batches).toHaveLength(0);
    });
  });
});