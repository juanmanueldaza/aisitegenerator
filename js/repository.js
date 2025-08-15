// Repository creation and management functionality
class RepositoryManager {
    constructor(githubAuth) {
        this.auth = githubAuth;
    }

    validateRepositoryName(name) {
        const errors = [];
        
        // Check if empty
        if (!name || name.trim() === '') {
            errors.push('Repository name is required');
            return { isValid: false, errors };
        }

        name = name.trim();

        // GitHub repository name rules
        if (name.length > 100) {
            errors.push('Repository name must be 100 characters or less');
        }

        if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
            errors.push('Repository name can only contain alphanumeric characters, periods, hyphens, and underscores');
        }

        if (name.startsWith('.') || name.startsWith('-') || name.startsWith('_')) {
            errors.push('Repository name cannot start with a period, hyphen, or underscore');
        }

        if (name.endsWith('.') || name.endsWith('-') || name.endsWith('_')) {
            errors.push('Repository name cannot end with a period, hyphen, or underscore');
        }

        // Reserved names
        const reservedNames = ['_', '.', '..', 'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
        if (reservedNames.includes(name.toUpperCase())) {
            errors.push('Repository name is reserved and cannot be used');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedName: name
        };
    }

    async checkRepositoryExists(name) {
        if (!this.auth.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const octokit = this.auth.getOctokit();
            const user = await this.auth.getCurrentUser();
            
            await octokit.rest.repos.get({
                owner: user.login,
                repo: name
            });
            
            return true; // Repository exists
        } catch (error) {
            if (error.status === 404) {
                return false; // Repository doesn't exist
            }
            throw error; // Other error
        }
    }

    async createRepository(options) {
        if (!this.auth.isAuthenticated()) {
            throw new Error('Not authenticated with GitHub');
        }

        const { name, description, isPrivate } = options;

        // Validate repository name
        const validation = this.validateRepositoryName(name);
        if (!validation.isValid) {
            throw new Error(validation.errors.join('. '));
        }

        try {
            const octokit = this.auth.getOctokit();
            const user = await this.auth.getCurrentUser();

            // Check if repository already exists
            const exists = await this.checkRepositoryExists(validation.sanitizedName);
            if (exists) {
                throw new Error(`Repository '${validation.sanitizedName}' already exists. Please choose a different name.`);
            }

            // Create the repository
            const { data: repo } = await octokit.rest.repos.create({
                name: validation.sanitizedName,
                description: description || `A website created with AI Site Generator`,
                private: isPrivate || false,
                auto_init: true, // Initialize with README
                gitignore_template: 'Node', // Basic gitignore for web projects
                license_template: 'mit',
                has_issues: true,
                has_projects: false,
                has_wiki: false,
                has_downloads: true,
                allow_squash_merge: true,
                allow_merge_commit: true,
                allow_rebase_merge: true,
                delete_branch_on_merge: true
            });

            // Enable GitHub Pages if repository is public
            if (!isPrivate) {
                try {
                    await this.enableGitHubPages(repo.owner.login, repo.name);
                } catch (pagesError) {
                    console.warn('Could not enable GitHub Pages immediately:', pagesError.message);
                    // Don't fail the entire operation if Pages setup fails
                }
            }

            // Add initial website files
            await this.initializeWebsiteFiles(repo.owner.login, repo.name);

            return {
                success: true,
                repository: repo,
                url: repo.html_url,
                pagesUrl: !isPrivate ? `https://${user.login}.github.io/${repo.name}` : null
            };

        } catch (error) {
            console.error('Repository creation error:', error);
            
            // Provide user-friendly error messages
            if (error.message.includes('name already exists')) {
                throw new Error(`Repository '${validation.sanitizedName}' already exists. Please choose a different name.`);
            } else if (error.status === 422) {
                throw new Error('Repository name is invalid or already exists. Please try a different name.');
            } else if (error.status === 403) {
                throw new Error('You do not have permission to create repositories. Please check your GitHub account settings.');
            } else if (error.status === 401) {
                throw new Error('Your GitHub authentication has expired. Please log in again.');
            } else if (error.message.includes('API rate limit')) {
                throw new Error('GitHub API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(error.message || 'Failed to create repository. Please try again.');
            }
        }
    }

    async enableGitHubPages(owner, repo) {
        try {
            const octokit = this.auth.getOctokit();
            
            await octokit.rest.repos.createPagesSite({
                owner: owner,
                repo: repo,
                source: {
                    branch: 'main',
                    path: '/'
                }
            });
        } catch (error) {
            // GitHub Pages might already be enabled or not available yet
            console.warn('GitHub Pages setup warning:', error.message);
        }
    }

    async initializeWebsiteFiles(owner, repo) {
        try {
            const octokit = this.auth.getOctokit();

            // Create a basic index.html file for the website
            const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${repo}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2d3748;
            text-align: center;
            margin-bottom: 1rem;
        }
        p {
            text-align: center;
            color: #4a5568;
            margin-bottom: 1rem;
        }
        .badge {
            display: inline-block;
            background: #4299e1;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            margin: 0.25rem;
        }
        .center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Welcome to ${repo}!</h1>
        <p>This website was created using <strong>AI Site Generator</strong>.</p>
        <p>Your site is now live and ready to be customized!</p>
        
        <div class="center">
            <span class="badge">🚀 AI Generated</span>
            <span class="badge">📱 Responsive</span>
            <span class="badge">⚡ Fast</span>
        </div>
        
        <p><em>Edit this file to start building your amazing website!</em></p>
    </div>
</body>
</html>`;

            // Create index.html
            await octokit.rest.repos.createOrUpdateFileContents({
                owner: owner,
                repo: repo,
                path: 'index.html',
                message: 'Add initial website files',
                content: this.encodeContent(indexHtml),
                branch: 'main'
            });

            // Update README.md with more information
            const readmeContent = `# ${repo}

A beautiful website created with [AI Site Generator](https://github.com/juanmanueldaza/aisitegenerator).

## 🌟 Features

- AI-powered website generation
- Responsive design
- GitHub Pages hosting
- Easy customization

## 🚀 Getting Started

Your website is automatically deployed to GitHub Pages at:
https://${owner}.github.io/${repo}

## 📝 Customization

Edit the \`index.html\` file to customize your website. Add CSS, JavaScript, and other assets as needed.

## 🛠️ Development

This website is built with pure HTML, CSS, and JavaScript. No build process required!

---

Built with ❤️ using AI Site Generator
`;

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: owner,
                repo: repo,
                path: 'README.md',
                message: 'Update README with project information',
                content: this.encodeContent(readmeContent),
                branch: 'main'
            });

        } catch (error) {
            console.warn('Could not initialize website files:', error.message);
            // Don't fail the repository creation if file initialization fails
        }
    }

    encodeContent(content) {
        // Safe base64 encoding that handles Unicode characters
        try {
            return btoa(unescape(encodeURIComponent(content)));
        } catch (error) {
            console.warn('btoa encoding failed, using fallback');
            // Fallback for demo purposes
            return content;
        }
    }

    generateNameSuggestions(baseName) {
        const suggestions = [];
        const timestamp = Date.now().toString().slice(-6);
        
        suggestions.push(`${baseName}-${timestamp}`);
        suggestions.push(`${baseName}-site`);
        suggestions.push(`${baseName}-web`);
        suggestions.push(`${baseName}-app`);
        suggestions.push(`my-${baseName}`);
        
        return suggestions;
    }
}

// Export for use in other modules
window.RepositoryManager = RepositoryManager;