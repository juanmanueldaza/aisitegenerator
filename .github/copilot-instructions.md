# AI Site Generator - Copilot Instructions

AI Site Generator is a modern, frontend-only web application for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Current Repository State

**CRITICAL**: This repository is currently in a greenfield state with only a README.md file. The actual codebase has not been implemented yet. When working on this project, you will be building the foundation of a frontend-only web application.

## Project Architecture

Based on the README description, this will be:
- A frontend-only web application (no backend server)
- Built for GitHub Pages deployment
- Integrated with GitHub authentication
- Focused on AI-guided website creation with live preview
- Step-by-step user interface for site building

## Expected Technology Stack

When the codebase is developed, expect to use:
- **Frontend Framework**: React, Vue.js, or vanilla JavaScript/TypeScript
- **Build Tool**: Vite, Webpack, or Create React App
- **Package Manager**: npm or yarn
- **Deployment**: GitHub Pages
- **Authentication**: GitHub OAuth
- **AI Integration**: OpenAI API, Anthropic, or similar
- **Styling**: CSS modules, Tailwind CSS, or styled-components

## Working Effectively

### Initial Setup (When Codebase Exists)
```bash
# Install Node.js (required for frontend development)
# Download Node.js LTS from https://nodejs.org/
# Or use: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs

# Install dependencies
npm install
# NEVER CANCEL: Initial npm install may take 5-10 minutes. Set timeout to 15+ minutes.

# Install development dependencies
npm run dev:install  # if this script exists
```

### Building the Application
```bash
# Development build
npm run build:dev
# NEVER CANCEL: Development build typically takes 2-5 minutes. Set timeout to 10+ minutes.

# Production build (for GitHub Pages)
npm run build
# NEVER CANCEL: Production build may take 5-15 minutes depending on optimization. Set timeout to 20+ minutes.

# Build with GitHub Pages configuration
npm run build:pages  # if this script exists
```

### Running the Application
```bash
# Start development server
npm run dev
# OR
npm start
# Development server typically starts in 30-60 seconds

# Preview production build locally
npm run preview
# OR
npm run serve
```

### Testing
```bash
# Run unit tests
npm test
# NEVER CANCEL: Test suite may take 5-10 minutes. Set timeout to 15+ minutes.

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
# NEVER CANCEL: E2E tests may take 10-20 minutes. Set timeout to 30+ minutes.

# Run all tests before deployment
npm run test:all
# NEVER CANCEL: Complete test suite may take 15-30 minutes. Set timeout to 45+ minutes.
```

### Linting and Formatting
```bash
# Check code style
npm run lint
# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format
# OR
npm run prettier

# Type checking (if TypeScript)
npm run type-check
```

## Deployment

### GitHub Pages Deployment
```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
# OR
npm run deploy:pages

# Manual deployment (if no script exists)
# 1. Build the project: npm run build
# 2. Push dist/ or build/ folder to gh-pages branch
# 3. Enable GitHub Pages in repository settings
```

## Validation

### Manual Testing Scenarios
**ALWAYS run these validation scenarios after making changes:**

1. **Application Startup**:
   - Run `npm run dev`
   - Verify application loads at localhost (typically port 3000, 5173, or 8080)
   - Take screenshot of the main interface

2. **GitHub Authentication Flow**:
   - Click "Login with GitHub" or similar button
   - Verify OAuth redirect works (may require GitHub App setup)
   - Confirm user authentication state

3. **AI Chat Interface**:
   - Test the AI chat functionality
   - Verify chat messages display correctly
   - Confirm AI responses generate website suggestions

4. **Website Creation Workflow**:
   - Start a new website creation process
   - Follow step-by-step guidance
   - Verify live preview functionality
   - Test website customization options

5. **GitHub Pages Deployment**:
   - Test the deployment workflow
   - Verify generated sites deploy correctly
   - Confirm GitHub Pages integration

### Browser Testing
- Test in Chrome, Firefox, Safari, and Edge
- Verify responsive design on mobile and desktop
- Check console for JavaScript errors

### Pre-commit Validation
**ALWAYS run before committing changes:**
```bash
npm run lint
npm run type-check  # if TypeScript
npm run test
npm run build
```

## Common Development Patterns

### File Structure (Expected)
```
/
├── src/                 # Source code
│   ├── components/      # React/Vue components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks (React)
│   ├── utils/          # Utility functions
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   └── styles/         # CSS/styling files
├── public/             # Static assets
├── dist/ or build/     # Built application
├── tests/              # Test files
├── package.json        # Dependencies and scripts
├── vite.config.js      # Build configuration
└── README.md          # Project documentation
```

### Key Development Areas
- **Authentication**: `src/services/auth.js` or `src/hooks/useAuth.js`
- **AI Integration**: `src/services/ai.js` or `src/api/openai.js`
- **Site Generation**: `src/components/SiteBuilder/` or `src/pages/Create/`
- **GitHub Integration**: `src/services/github.js`
- **Preview System**: `src/components/Preview/` or `src/utils/preview.js`

## Environment Variables
Expected environment variables for configuration:
```bash
# Create .env file with:
REACT_APP_GITHUB_CLIENT_ID=your_github_app_client_id
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_BASE_URL=https://your-username.github.io/aisitegenerator
```

## Troubleshooting

### Common Issues
- **Build failures**: Check Node.js version compatibility (use LTS)
- **GitHub Auth not working**: Verify GitHub App configuration and redirect URLs
- **AI API errors**: Check API key configuration and rate limits
- **GitHub Pages deployment fails**: Verify build output directory and branch settings

### Debug Commands
```bash
# Check Node.js and npm versions
node --version && npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Verbose build output
npm run build -- --verbose
```

## Development Workflow

1. **Always start with**: `npm install` (if not done)
2. **Before making changes**: Run `npm run dev` to ensure current code works
3. **During development**: Use `npm run dev` for hot reloading
4. **Before committing**: Run lint, tests, and build commands
5. **For deployment**: Use production build and test on GitHub Pages

## Performance Considerations

- **Bundle size**: Monitor build output for large dependencies
- **GitHub Pages**: Optimize for static hosting (no server-side processing)
- **AI API calls**: Implement rate limiting and error handling
- **Live preview**: Optimize rendering performance for real-time updates

## Security Notes

- **API keys**: Never commit API keys to the repository
- **GitHub OAuth**: Use environment variables for client secrets
- **User data**: Implement proper data handling for GitHub user information
- **Content generation**: Validate and sanitize AI-generated content

---

**Remember**: This is a frontend-only application designed for GitHub Pages. All functionality must work without a backend server.