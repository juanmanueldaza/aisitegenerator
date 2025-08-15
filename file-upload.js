// File Upload Module
class FileUpload {
    constructor() {
        this.selectedFiles = new Map();
        this.repositoryName = '';
    }

    // Initialize file upload functionality
    init() {
        this.attachEventListeners();
    }

    // Attach event listeners
    attachEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');

        // Click to select files
        uploadArea.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // Upload button
        uploadBtn.addEventListener('click', () => this.uploadFiles());
    }

    // Handle file selection
    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            // Validate file type
            if (this.isValidFile(file)) {
                this.selectedFiles.set(file.name, file);
            } else {
                alert(`File type not supported: ${file.name}`);
            }
        });

        this.updateFileList();
        this.updateUploadButton();
    }

    // Validate file type
    isValidFile(file) {
        const allowedTypes = [
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
            'text/markdown',
            'text/plain',
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/svg+xml'
        ];

        const allowedExtensions = ['.html', '.css', '.js', '.md', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.svg'];
        
        return allowedTypes.includes(file.type) || 
               allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    // Update file list display
    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.selectedFiles.forEach((file, fileName) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${fileName} (${this.formatFileSize(file.size)})</span>
                <button class="remove-btn" onclick="fileUpload.removeFile('${fileName}')">Remove</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    // Remove file from selection
    removeFile(fileName) {
        this.selectedFiles.delete(fileName);
        this.updateFileList();
        this.updateUploadButton();
    }

    // Update upload button state
    updateUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = this.selectedFiles.size === 0;
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Upload files to GitHub repository
    async uploadFiles() {
        if (!window.githubAuth.isAuthenticated()) {
            alert('Please authenticate with GitHub first.');
            return;
        }

        if (this.selectedFiles.size === 0) {
            alert('Please select files to upload.');
            return;
        }

        try {
            // Show loading state
            const uploadBtn = document.getElementById('uploadBtn');
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';

            // Create or get repository
            const repoName = await this.getRepositoryName();
            const repo = await this.ensureRepository(repoName);

            // Upload files
            const uploadPromises = Array.from(this.selectedFiles.entries()).map(([fileName, file]) => 
                this.uploadFileToRepo(repo.owner.login, repo.name, fileName, file)
            );

            await Promise.all(uploadPromises);

            // Show success message
            alert('Files uploaded successfully!');

            // Show pages section and trigger automatic deployment
            document.getElementById('pagesSection').classList.remove('hidden');
            
            // Trigger custom event for GitHub Pages automation
            window.dispatchEvent(new CustomEvent('filesUploaded', {
                detail: { 
                    repository: repo,
                    files: Array.from(this.selectedFiles.keys())
                }
            }));

        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            // Reset button state
            const uploadBtn = document.getElementById('uploadBtn');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Files';
        }
    }

    // Get repository name from user
    async getRepositoryName() {
        if (!this.repositoryName) {
            this.repositoryName = prompt('Enter repository name:', 'my-ai-site') || 'my-ai-site';
        }
        return this.repositoryName;
    }

    // Ensure repository exists (create if necessary)
    async ensureRepository(repoName) {
        try {
            // Try to get existing repository
            const repo = await window.githubAuth.apiRequest(`/repos/${window.githubAuth.getUser().login}/${repoName}`);
            return repo;
        } catch (error) {
            if (error.message.includes('404')) {
                // Repository doesn't exist, create it
                return await this.createRepository(repoName);
            }
            throw error;
        }
    }

    // Create new repository
    async createRepository(repoName) {
        const repo = await window.githubAuth.apiRequest('/user/repos', {
            method: 'POST',
            body: JSON.stringify({
                name: repoName,
                description: 'Website generated by AI Site Generator',
                private: false,
                auto_init: true
            })
        });

        return repo;
    }

    // Upload single file to repository
    async uploadFileToRepo(owner, repo, fileName, file) {
        // Read file content
        const content = await this.readFileAsBase64(file);
        
        // Check if file already exists
        let sha = null;
        try {
            const existingFile = await window.githubAuth.apiRequest(`/repos/${owner}/${repo}/contents/${fileName}`);
            sha = existingFile.sha;
        } catch (error) {
            // File doesn't exist, that's fine
        }

        // Upload/update file
        const fileData = {
            message: `Upload ${fileName}`,
            content: content,
            branch: 'main'
        };

        if (sha) {
            fileData.sha = sha;
        }

        const response = await window.githubAuth.apiRequest(`/repos/${owner}/${repo}/contents/${fileName}`, {
            method: 'PUT',
            body: JSON.stringify(fileData)
        });

        return response;
    }

    // Read file as base64
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Get current repository name
    getCurrentRepository() {
        return this.repositoryName;
    }
}

// Initialize File Upload when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileUpload = new FileUpload();
    window.fileUpload.init();
});