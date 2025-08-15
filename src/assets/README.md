# Static Assets

This directory contains static assets used throughout the application.

## Guidelines
- Organize assets by type (images, icons, fonts, etc.)
- Use consistent naming conventions
- Optimize images for web usage
- Use SVGs for icons when possible
- Keep file sizes reasonable

## Example Structure
```
assets/
├── images/
│   ├── logo.svg
│   ├── hero-bg.jpg
│   └── placeholders/
├── icons/
│   ├── chevron-down.svg
│   ├── github.svg
│   └── close.svg
├── fonts/
│   └── custom-font.woff2
└── styles/
    ├── globals.css
    └── variables.css
```

## File Naming Conventions
- Use kebab-case for file names: `hero-background.jpg`
- Be descriptive: `button-primary-icon.svg` instead of `btn.svg`
- Include size information if relevant: `logo-small.svg`, `logo-large.svg`
- Use consistent suffixes for variations: `icon-light.svg`, `icon-dark.svg`