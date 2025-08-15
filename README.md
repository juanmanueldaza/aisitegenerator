# AI Site Generator

A modern, frontend-only web app for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## 🎓 Educational Content System

This repository includes a comprehensive educational system to help users understand GitHub permissions, OAuth scopes, and security best practices when using the AI Site Generator.

### Features

#### 📚 Educational Content Areas
- **GitHub Scopes Education**: Understanding OAuth permissions and why they matter
- **Permission Management**: How to review, grant, and revoke application access
- **Security Best Practices**: Keeping your GitHub account secure
- **Troubleshooting**: Common issues and solutions

#### 🎯 Interactive Learning
- **Step-by-step Tutorials**: Progressive disclosure of complex topics
- **Visual Guides**: Icons and diagrams to explain concepts
- **Interactive Modals**: Guided walkthroughs with navigation
- **Contextual Help**: Just-in-time assistance

#### ♿ Accessibility Features
- **Screen Reader Support**: Full ARIA labels and semantic HTML
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast Mode**: Support for visual accessibility
- **Responsive Design**: Mobile-first approach for all devices

#### 🔍 Help System
- **Search Functionality**: Find specific topics quickly
- **Context-Aware Help**: Relevant assistance based on user actions
- **Progressive Enhancement**: Works without JavaScript
- **Multilingual Structure**: Ready for localization

### File Structure

```
├── index.html              # Main application entry point
├── styles.css              # Comprehensive styling with CSS variables
├── script.js               # Interactive help system and education manager
├── help-config.json        # Configuration for help system
└── docs/                   # Educational content
    ├── help/               # Help documentation
    │   ├── github-scopes.md
    │   ├── permission-management.md
    │   └── troubleshooting.md
    ├── tutorials/          # Step-by-step guides
    │   └── first-website.md
    └── faq/                # Frequently asked questions
        └── index.md
```

### Educational Content

#### GitHub Scopes Guide (`docs/help/github-scopes.md`)
- What are GitHub scopes and why they matter
- Explanation of each scope requested by the app
- Visual representation of permission levels
- Security implications and best practices

#### Permission Management (`docs/help/permission-management.md`)
- How to review granted permissions
- Steps to revoke permissions when needed
- Managing multiple OAuth applications
- Security auditing of connected apps

#### Troubleshooting (`docs/help/troubleshooting.md`)
- Common authentication issues and solutions
- Permission error resolution
- Network and browser troubleshooting
- Emergency security procedures

#### Interactive Tutorial (`docs/tutorials/first-website.md`)
- Complete walkthrough from authentication to deployment
- Understanding GitHub permissions in context
- Step-by-step website creation process
- Best practices for ongoing management

### Technology Stack

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No dependencies for maximum compatibility
- **Markdown**: Content management system
- **JSON**: Configuration and structured data

### Design Principles

#### Security First
- Clear explanation of all requested permissions
- Transparent about data usage and access
- Easy revocation process documentation
- Security best practices education

#### User-Centered Design
- Progressive disclosure of complex information
- Multiple learning modalities (visual, text, interactive)
- Contextual help when users need it most
- Respectful of user time and attention

#### Accessibility
- WCAG 2.1 AA compliance
- Screen reader optimization
- Keyboard navigation support
- High contrast and reduced motion support

#### Performance
- Minimal dependencies
- Efficient CSS and JavaScript
- Lazy loading of content
- Fast initial page load

### Usage

#### Running Locally

1. Clone the repository
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   # or
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser

#### Key Features to Test

1. **Help Panel**: Click the help button (❓) to open the side panel
2. **Interactive Modals**: Click "Learn More" on any education card
3. **Step Navigation**: Use Previous/Next buttons in modals
4. **Search**: Type in the help search box to filter topics
5. **Mobile**: Resize browser to test responsive design
6. **Keyboard**: Use Tab, Enter, Escape for navigation

### Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Contributing

When adding educational content:

1. Follow the established Markdown structure
2. Include visual aids and examples
3. Test accessibility with screen readers
4. Ensure mobile responsiveness
5. Update the help-config.json if needed

### Future Enhancements

- [ ] Multilingual support
- [ ] Video tutorial integration
- [ ] Advanced search with filters
- [ ] User feedback system
- [ ] Analytics for content effectiveness
- [ ] Offline content caching

---

This educational system serves as a comprehensive resource for users to understand GitHub permissions and use the AI Site Generator securely and effectively.
