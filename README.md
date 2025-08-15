# AI Site Generator

A modern, frontend-only web application for creating beautiful websites with AI guidance and GitHub integration.

## Features

- 🤖 AI-powered website creation guidance
- 🔐 GitHub OAuth authentication
- 📦 Automatic repository creation
- 🚀 GitHub Pages deployment
- 📱 Responsive design
- ⚡ Fast and lightweight

## Getting Started

1. Open the application in your browser
2. Login with your GitHub account
3. Create a new repository for your website
4. Follow the AI guidance to build your site
5. Deploy automatically to GitHub Pages

## Repository Creation

The application provides comprehensive repository creation functionality:

- **Custom repository names** with validation
- **Public/private repository options**
- **Automatic GitHub Pages setup** for public repos
- **Initial file creation** (README, .gitignore, index.html)
- **Error handling** for naming conflicts and API issues
- **User-friendly feedback** throughout the process

## Technical Features

### Authentication
- GitHub OAuth integration via personal access tokens
- Secure token management
- Session persistence

### Repository Management
- Repository name validation following GitHub rules
- Conflict detection and resolution suggestions
- Automatic initialization with project files
- GitHub Pages configuration

### Error Handling
- Network error management
- Rate limiting awareness
- Permission error handling
- User-friendly error messages

## Deployment

This is a frontend-only application that can be deployed to any static hosting service, including GitHub Pages.

### For GitHub Pages:
1. Push the code to a repository
2. Enable GitHub Pages in repository settings
3. Select source as main branch
4. Access via `https://yourusername.github.io/repositoryname`

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers supported

## Development

To run locally:
```bash
npm install
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.
