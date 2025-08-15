# AI Site Generator

A modern, frontend-only web app for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## Features

- 🤖 **AI-Powered Generation**: Powered by Google Gemini AI for intelligent website creation
- 🔒 **Secure API Integration**: Built-in security, rate limiting, and error handling
- 📊 **Usage Monitoring**: Real-time tracking of API usage and costs
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- ⚡ **Performance**: Response caching and optimized API calls

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/juanmanueldaza/aisitegenerator.git
   cd aisitegenerator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the Gemini API:
   ```bash
   cp .env.example .env
   # Edit .env and add your VITE_GEMINI_API_KEY
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required: Your Gemini API key
VITE_GEMINI_API_KEY=your_api_key_here

# Optional: Configuration
VITE_APP_ENV=development
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_GEMINI_MAX_REQUESTS_PER_MINUTE=60
VITE_GEMINI_MAX_TOKENS_PER_REQUEST=4096
```

For detailed configuration instructions, see [GEMINI_INTEGRATION.md](./GEMINI_INTEGRATION.md).

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Project Structure

```
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── services/          # API services
├── types/             # TypeScript type definitions
├── config/            # Configuration utilities
├── utils/             # Utility functions
└── __tests__/         # Test files
```

## Security & Best Practices

- ✅ API keys are never exposed in client-side code
- ✅ Input and output sanitization
- ✅ Rate limiting and quota management
- ✅ Comprehensive error handling
- ✅ Production-ready security measures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

- 📖 [Gemini Integration Guide](./GEMINI_INTEGRATION.md)
- 🐛 [Report Issues](https://github.com/juanmanueldaza/aisitegenerator/issues)
- 📧 Contact: [Your Email]
