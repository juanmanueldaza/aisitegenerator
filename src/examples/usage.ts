/**
 * Example usage of the GitHub file upload functionality
 */

import { GitHubFileUploader, UploadFile, UploadProgress } from '../index.js';

// Example: Upload a simple website
async function exampleUpload() {
  // Configuration (in a real app, these would come from user authentication)
  const octokitConfig = {
    auth: 'your-github-token', // This would come from OAuth
    userAgent: 'AI Site Generator v1.0.0'
  };

  const repoConfig = {
    owner: 'username',
    repo: 'my-website',
    branch: 'main'
  };

  // Create uploader instance
  const uploader = new GitHubFileUploader(octokitConfig, repoConfig, {
    batchSize: 10,
    maxFileSize: 25 * 1024 * 1024, // 25MB
    onProgress: (progress: UploadProgress) => {
      console.log(`Progress: ${progress.percentComplete}% (${progress.uploadedFiles}/${progress.totalFiles} files)`);
      console.log(`Currently uploading: ${progress.currentFile}`);
    }
  });

  // Example files to upload
  const files: UploadFile[] = [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My AI Generated Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This website was generated using AI!</p>
    <script src="script.js"></script>
</body>
</html>`,
      encoding: 'utf-8'
    },
    {
      path: 'styles.css',
      content: `body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    line-height: 1.6;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    color: #666;
    font-size: 18px;
}`,
      encoding: 'utf-8'
    },
    {
      path: 'script.js',
      content: `console.log('AI Generated Website Loaded!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
});`,
      encoding: 'utf-8'
    },
    {
      path: 'README.md',
      content: `# My AI Generated Website

This website was created using the AI Site Generator tool.

## Features
- Modern HTML5 structure
- Responsive CSS styling
- Interactive JavaScript
- Deployed via GitHub Pages

## Deployment
This site is automatically deployed to GitHub Pages.
`,
      encoding: 'utf-8'
    }
  ];

  try {
    // Validate repository access
    console.log('Validating repository access...');
    const validation = await uploader.validateRepository();
    if (!validation.valid) {
      console.error('Repository validation failed:', validation.error);
      return;
    }

    // Check rate limits
    console.log('Checking rate limits...');
    const rateLimit = await uploader.getRateLimit();
    console.log(`Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`);

    if (rateLimit.remaining < 10) {
      console.warn('Rate limit is low, consider waiting until:', rateLimit.reset);
    }

    // Upload files
    console.log('Starting file upload...');
    const result = await uploader.uploadFiles(files, 'Initial website deployment');

    if (result.success) {
      console.log('✅ Upload successful!');
      console.log(`Commit SHA: ${result.commitSha}`);
      console.log(`Uploaded files: ${result.uploadedFiles.join(', ')}`);
    } else {
      console.error('❌ Upload failed');
      result.errors.forEach(error => {
        console.error(`  ${error.file}: ${error.error} (recoverable: ${error.recoverable})`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example: Upload a single file with retry
async function exampleSingleFileUpload() {
  const octokitConfig = {
    auth: 'your-github-token',
    userAgent: 'AI Site Generator v1.0.0'
  };

  const repoConfig = {
    owner: 'username',
    repo: 'my-website'
  };

  const uploader = new GitHubFileUploader(octokitConfig, repoConfig, {
    retryAttempts: 3,
    retryDelay: 2000
  });

  const file: UploadFile = {
    path: 'robots.txt',
    content: `User-agent: *
Allow: /

Sitemap: https://username.github.io/my-website/sitemap.xml`,
    encoding: 'utf-8'
  };

  const result = await uploader.uploadSingleFile(file, 'Add robots.txt for SEO');
  
  if (result.success) {
    console.log('✅ robots.txt uploaded successfully');
  } else {
    console.error('❌ Failed to upload robots.txt');
  }
}

// Export examples for use in other modules
export { exampleUpload, exampleSingleFileUpload };