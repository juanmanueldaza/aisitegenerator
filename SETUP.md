# AI Site Generator - Setup and Usage Guide

## Overview

AI Site Generator is a frontend-only web application that enables users to create GitHub repositories for websites with AI guidance. The app provides a complete repository creation workflow with GitHub integration.

## Features Implemented

### ✅ Repository Creation
- Custom repository name validation following GitHub rules
- Real-time name validation with error messages
- Repository description support
- Public/private repository options
- Automatic conflict detection

### ✅ GitHub Integration
- GitHub OAuth authentication (with demo mode)
- Repository creation via GitHub API
- Automatic GitHub Pages setup for public repos
- Initial file creation (README, index.html)
- Repository settings configuration

### ✅ Error Handling
- Comprehensive name validation
- Network error management
- Conflict resolution with name suggestions
- User-friendly error messages
- Rate limiting awareness

### ✅ User Interface
- Responsive design
- Modern, clean interface
- Real-time form validation
- Loading states and feedback
- Success/error notifications

## Setup Instructions

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd aisitegenerator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000`

### Production Deployment

#### GitHub Pages Deployment
1. Push the code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source as "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Save settings
6. Access via `https://yourusername.github.io/repositoryname`

#### Other Static Hosting
The application can be deployed to any static hosting service:
- Netlify
- Vercel
- Firebase Hosting
- AWS S3
- Any web server

## Usage Instructions

### 1. Authentication

**Demo Mode (for testing):**
- Click "Login with GitHub"
- Select "OK" for demo mode
- Uses mock authentication for testing

**Real GitHub Authentication:**
- Click "Login with GitHub"
- Select "Cancel" for real mode
- Enter a GitHub Personal Access Token
- Required scopes: `repo`, `user:email`

#### Creating a GitHub Personal Access Token:
1. Go to GitHub → Settings → Developer settings
2. Click "Personal access tokens" → "Tokens (classic)"
3. Click "Generate new token (classic)"
4. Select scopes: `repo` and `user:email`
5. Generate and copy the token

### 2. Repository Creation

1. **Enter repository name:**
   - Must start and end with alphanumeric characters
   - Can contain hyphens and underscores
   - Must be unique in your account

2. **Add description (optional):**
   - Provide a meaningful description for your repository

3. **Choose visibility:**
   - Public: Required for GitHub Pages (free)
   - Private: Cannot use GitHub Pages on free accounts

4. **Create repository:**
   - Click "Create Repository"
   - Wait for completion
   - View success page with links

### 3. Repository Features

Created repositories include:
- **Initial README.md** with project information
- **index.html** with starter website template
- **GitHub Pages setup** (for public repos)
- **Basic .gitignore** for web projects
- **MIT License**

## Validation Rules

### Repository Name Validation
- Length: 1-100 characters
- Characters: Letters, numbers, hyphens, underscores, periods
- Cannot start/end with hyphens, underscores, or periods
- Cannot be reserved names (CON, PRN, AUX, etc.)

### Error Handling
- **Name conflicts:** Provides alternative name suggestions
- **Network errors:** User-friendly error messages
- **Authentication errors:** Clear instructions for token creation
- **Rate limiting:** Guidance for retry timing

## Technical Architecture

### Frontend Stack
- **HTML5** for structure
- **CSS3** with modern features (flexbox, grid)
- **Vanilla JavaScript** (ES6+)
- **Octokit** for GitHub API integration

### Key Components
- **Authentication Manager** (`js/auth.js`)
- **Repository Manager** (`js/repository.js`)
- **Main Application** (`js/main.js`)
- **Responsive Styles** (`styles/main.css`)

### GitHub API Integration
- Uses Octokit REST API
- Handles authentication via personal access tokens
- Creates repositories with full configuration
- Sets up GitHub Pages automatically
- Manages file creation and updates

## Browser Support

- **Chrome** 60+ ✅
- **Firefox** 55+ ✅
- **Safari** 12+ ✅
- **Edge** 79+ ✅
- **Mobile browsers** ✅

## Security Considerations

- Tokens stored in localStorage (development only)
- No server-side storage of credentials
- Frontend-only architecture
- HTTPS required for production

## Development Notes

### Demo Mode
The application includes a demo mode for testing without real GitHub credentials:
- Mock authentication
- Simulated API responses
- All validation and UI flows work
- No actual repositories created

### Production Mode
For production use:
- Replace mock authentication with real OAuth
- Use proper GitHub API endpoints
- Implement token refresh mechanisms
- Add proper error logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

For questions or issues, please create a GitHub issue in the repository.