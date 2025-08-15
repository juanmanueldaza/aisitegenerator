# GitHub File Upload Module

This module provides functionality to upload generated website files to GitHub repositories using the Octokit API.

## Features

- ✅ Upload multiple files in a single commit
- ✅ Handle binary assets (images, fonts) properly with base64 encoding
- ✅ Batch file uploads for optimal performance
- ✅ Progress feedback for large uploads
- ✅ Proper commit messages and metadata
- ✅ Comprehensive error handling and recovery
- ✅ Rate limiting compliance
- ✅ File validation and size checking
- ✅ Retry logic for failed uploads

## Installation

```bash
npm install @octokit/rest
```

## Basic Usage

```typescript
import { GitHubFileUploader, UploadFile } from './src/index.js';

// Configure Octokit (auth token would come from OAuth)
const octokitConfig = {
  auth: 'your-github-token',
  userAgent: 'AI Site Generator v1.0.0'
};

// Configure repository
const repoConfig = {
  owner: 'username',
  repo: 'my-website',
  branch: 'main' // optional, defaults to 'main'
};

// Create uploader instance
const uploader = new GitHubFileUploader(octokitConfig, repoConfig, {
  batchSize: 50, // files per commit
  maxFileSize: 25 * 1024 * 1024, // 25MB
  onProgress: (progress) => {
    console.log(`${progress.percentComplete}% complete`);
  }
});

// Prepare files to upload
const files: UploadFile[] = [
  {
    path: 'index.html',
    content: '<!DOCTYPE html>...',
    encoding: 'utf-8'
  },
  {
    path: 'styles.css',
    content: 'body { margin: 0; }',
    encoding: 'utf-8'
  }
];

// Upload files
const result = await uploader.uploadFiles(files, 'Initial website deployment');

if (result.success) {
  console.log('Upload successful!', result.commitSha);
} else {
  console.error('Upload failed:', result.errors);
}
```

## API Reference

### GitHubFileUploader

#### Constructor

```typescript
new GitHubFileUploader(octokitConfig, repoConfig, options?)
```

- `octokitConfig`: Configuration for Octokit client
- `repoConfig`: Repository information
- `options`: Upload options (optional)

#### Methods

##### uploadFiles(files, commitMessage?)

Upload multiple files in batches.

- `files`: Array of UploadFile objects
- `commitMessage`: Optional custom commit message
- Returns: Promise<UploadResult>

##### uploadSingleFile(file, commitMessage?)

Upload a single file with retry logic.

- `file`: UploadFile object
- `commitMessage`: Optional custom commit message
- Returns: Promise<UploadResult>

##### validateRepository()

Check if repository exists and is accessible.

- Returns: Promise<{valid: boolean, error?: string}>

##### getRateLimit()

Get current GitHub API rate limit status.

- Returns: Promise<{limit: number, remaining: number, reset: Date}>

### Types

#### UploadFile

```typescript
interface UploadFile {
  path: string;              // File path in repository
  content: string | Uint8Array; // File content
  encoding?: 'utf-8' | 'base64'; // Encoding (auto-detected)
  size?: number;             // File size in bytes
}
```

#### UploadOptions

```typescript
interface UploadOptions {
  batchSize?: number;        // Files per commit (default: 50)
  maxFileSize?: number;      // Max file size in bytes (default: 25MB)
  allowedExtensions?: string[]; // Allowed file extensions
  onProgress?: ProgressCallback; // Progress callback
  retryAttempts?: number;    // Retry attempts (default: 3)
  retryDelay?: number;       // Retry delay in ms (default: 1000)
}
```

#### UploadResult

```typescript
interface UploadResult {
  success: boolean;          // Whether upload succeeded
  commitSha?: string;        // SHA of created commit
  uploadedFiles: string[];   // Successfully uploaded files
  errors: UploadError[];     // Any errors that occurred
}
```

## File Type Support

The module automatically handles different file types:

### Text Files (UTF-8 encoding)
- HTML files (`.html`, `.htm`)
- CSS stylesheets (`.css`)
- JavaScript files (`.js`, `.ts`)
- Markdown files (`.md`)
- JSON files (`.json`)
- XML files (`.xml`)
- Text files (`.txt`)

### Binary Files (Base64 encoding)
- Images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`, `.webp`)
- Fonts (`.woff`, `.woff2`, `.ttf`, `.otf`, `.eot`)
- Documents (`.pdf`)
- Archives (`.zip`, `.tar`, `.gz`)

## Error Handling

The module provides comprehensive error handling:

- **File validation errors**: File size, extension, path validation
- **Network errors**: Connection issues, timeouts
- **GitHub API errors**: Rate limiting, permissions, repository issues
- **Recoverable vs non-recoverable errors**: Automatic retry for recoverable errors

## Performance Considerations

- **Batching**: Files are uploaded in batches to minimize API calls
- **Rate limiting**: Automatic rate limit checking and compliance
- **Progress tracking**: Real-time upload progress for user feedback
- **Retry logic**: Automatic retry with exponential backoff
- **File validation**: Pre-upload validation to prevent unnecessary API calls

## GitHub API Limits

- **File size**: Maximum 25MB per file (GitHub limit)
- **Rate limits**: 5000 requests/hour for authenticated users
- **Repository size**: No hard limit, but performance may degrade with very large repositories

## Example: Complete Website Upload

```typescript
import { GitHubFileUploader } from './src/index.js';

async function deployWebsite() {
  const uploader = new GitHubFileUploader(
    { auth: 'github_token' },
    { owner: 'username', repo: 'my-site' },
    {
      onProgress: (progress) => {
        const percent = progress.percentComplete;
        const current = progress.uploadedFiles;
        const total = progress.totalFiles;
        console.log(`Uploading: ${percent}% (${current}/${total} files)`);
      }
    }
  );

  const websiteFiles = [
    { path: 'index.html', content: indexHtml },
    { path: 'css/styles.css', content: cssContent },
    { path: 'js/script.js', content: jsContent },
    { path: 'images/logo.png', content: logoBuffer },
    { path: 'README.md', content: readmeContent }
  ];

  try {
    const result = await uploader.uploadFiles(
      websiteFiles, 
      'Deploy AI-generated website'
    );
    
    if (result.success) {
      console.log('✅ Website deployed successfully!');
      console.log(`Visit: https://${username}.github.io/${repo}`);
    } else {
      console.error('❌ Deployment failed:', result.errors);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}
```

## Related Issues

This module implements the requirements from:
- Issue #25: Upload generated files to repository using Octokit
- Issue #15: Configure Octokit for browser usage with OAuth
- Issue #24: Implement repository creation functionality
- Epic #9: Octokit Integration and GitHub Pages