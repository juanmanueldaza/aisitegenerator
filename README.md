# AI Site Generator

A modern, frontend-only web application for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## 🚀 Features

- **AI-Powered Website Generation**: Create websites through natural language conversations with AI
- **GitHub Integration**: Seamless OAuth authentication and repository management
- **Live Preview**: Real-time preview of your website as you build it
- **GitHub Pages Deployment**: Automatic deployment to GitHub Pages
- **Responsive Design**: Mobile-first, responsive website templates
- **No Backend Required**: Fully client-side application

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Testing**: Jest + React Testing Library + Playwright
- **Code Quality**: ESLint + Prettier + Husky
- **APIs**: GitHub REST API + Google Gemini AI
- **Deployment**: GitHub Pages

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- GitHub account for authentication
- Google Gemini API key for AI features

## 🏃‍♂️ Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/juanmanueldaza/aisitegenerator.git
cd aisitegenerator
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
REACT_APP_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

### 3. GitHub OAuth App Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: `AI Site Generator`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/callback`
3. Copy the Client ID to your `.env.local` file

### 4. Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key to your `.env.local` file

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   ├── LoginButton.tsx
│   └── UserProfile.tsx
├── hooks/              # Custom React hooks
│   ├── __tests__/      # Hook tests
│   └── useAuth.ts
├── services/           # API services
│   ├── __tests__/      # Service tests
│   ├── GitHubService.ts
│   └── GeminiService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
├── mocks/              # Mock data for testing
│   └── handlers.ts
└── test/               # Test configuration
    └── setup.ts
tests/
├── unit/               # Additional unit tests
└── e2e/                # End-to-end tests
docs/                   # Documentation
├── api.md             # API documentation
├── development.md     # Development guide
├── testing.md         # Testing guide
└── deployment.md      # Deployment guide
```

## 🤝 Contributing

Please read our [Development Guide](./docs/development.md) and [Testing Guide](./docs/testing.md) before contributing.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Development Guide](./docs/development.md)
- [Testing Guide](./docs/testing.md)
- [Deployment Guide](./docs/deployment.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GitHub REST API](https://docs.github.com/en/rest)
- [Google Gemini AI](https://ai.google.dev/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)
