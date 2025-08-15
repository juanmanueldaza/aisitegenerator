# AI Site Generator

A modern, frontend-only web app for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## Features

### ✅ GitHub Pages Automation (Issue #26)
- **Automatic GitHub Pages activation** after file upload
- **Real-time deployment monitoring** with status updates
- **Live site URL provision** to users immediately
- **Comprehensive error handling** with troubleshooting guidance
- **Flexible configuration options** for deployment settings

### Core Functionality
- 🔐 **GitHub Authentication** - Secure OAuth integration
- 📁 **File Upload System** - Drag & drop or click to upload
- 🚀 **Automatic Deployment** - One-click GitHub Pages setup
- 📊 **Deployment Monitoring** - Real-time status tracking
- ⚙️ **Configuration Options** - Source branch, build method, HTTPS enforcement
- 🛠️ **Error Handling** - Detailed troubleshooting for common issues

## Getting Started

1. **Open the Application**
   - Open `index.html` in your web browser
   - Or deploy to any static hosting service

2. **Authenticate with GitHub**
   - Click "Login with GitHub"
   - You'll need a GitHub Personal Access Token with `repo` permissions
   - [Create a token here](https://github.com/settings/tokens)

3. **Upload Your Site Files**
   - Drag and drop files or click to select
   - Supported: HTML, CSS, JS, MD, images
   - Files are uploaded to a new GitHub repository

4. **Automatic GitHub Pages Deployment**
   - GitHub Pages is automatically enabled after upload
   - Monitor deployment status in real-time
   - Get your live site URL immediately

## GitHub Pages Configuration

### Supported Options
- **Source Branch**: `main` (recommended) or `gh-pages`
- **Build Method**: GitHub Actions workflow or classic deployment
- **HTTPS Enforcement**: Enabled by default for security
- **Custom Domain**: Optional advanced configuration

### Deployment Process
1. Files uploaded to GitHub repository
2. GitHub Pages automatically enabled via API
3. Deployment status monitored in real-time
4. Live site URL provided when ready
5. Error handling with troubleshooting guidance

## Error Handling

The application provides comprehensive error handling for:

- **Repository Issues**: Missing permissions, private repo limitations
- **Deployment Failures**: Build errors, invalid configurations
- **API Limitations**: Rate limiting, authentication issues
- **Network Problems**: Connectivity issues, timeouts

Each error includes specific troubleshooting tips to help resolve issues quickly.

## File Structure

```
aisitegenerator/
├── index.html          # Main application interface
├── styles.css          # Application styling
├── app.js             # Main application controller
├── github-auth.js     # GitHub authentication module
├── file-upload.js     # File upload functionality
├── github-pages.js    # GitHub Pages automation (Issue #26)
├── sw.js              # Service worker for offline support
├── demo-site.html     # Sample website for testing
└── README.md          # This documentation
```

## Technical Implementation

### GitHub Pages Automation Module (`github-pages.js`)

The core GitHub Pages automation includes:

- **Automatic Enablement**: Pages enabled immediately after file upload
- **Configuration Management**: Flexible settings for different deployment needs
- **Status Monitoring**: Real-time polling of deployment API
- **Error Recovery**: Graceful handling of common deployment issues
- **User Feedback**: Clear status indicators and progress updates

### API Integration

- GitHub REST API v3 for repository and Pages management
- OAuth authentication flow for secure access
- Rate limiting awareness and error handling
- Comprehensive error response parsing

### Browser Support

- Modern browsers with ES6+ support
- FileReader API for file processing
- Fetch API for HTTP requests
- LocalStorage for configuration persistence

## Development

### Testing GitHub Pages Automation

1. Create test files (HTML, CSS, JS)
2. Use the file upload feature
3. Monitor automatic Pages enablement
4. Verify deployment status updates
5. Check error handling scenarios

### Local Development

Simply open `index.html` in a modern web browser. No build process required.

## Deployment

Deploy the entire application to GitHub Pages:

1. Push code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to `main` branch / root
4. Access via `https://username.github.io/repository-name`

## Dependencies

- **Issue #25**: File upload functionality (implemented)
- GitHub Personal Access Token with `repo` permissions
- Modern web browser with ES6+ support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

Open source - see repository for details.
