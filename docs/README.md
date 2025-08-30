# Documentation Organization Guide

## 📁 Directory Structure

```
docs/
├── architecture/     # System design, architecture decisions
├── development/      # Development guides, GitHub issues, processes
├── user-guides/      # User documentation, tutorials
├── api/             # API documentation
└── deprecated/      # Outdated documentation

archive/
├── epics/           # Completed project epics
├── investigations/  # Technical analysis documents
└── prototypes/      # Development prototypes and tests
```

## 📝 File Naming Conventions

- Use kebab-case for filenames: `ai-integration-guide.md`
- Prefix with category: `ARCHITECTURE-ai-sdk-design.md`
- Use dates for time-sensitive docs: `2025-01-15-epic-progress.md`

## 🏷️ Document Categories

### Architecture Documents

- System design decisions
- Component architecture
- Data flow diagrams
- Integration patterns

### Development Documents

- Setup guides
- Contributing guidelines
- Testing strategies
- CI/CD processes

### User Guides

- Feature documentation
- Tutorials
- FAQ
- Troubleshooting

## 🗂️ Maintenance Guidelines

1. **Regular Cleanup**: Review root level files quarterly
2. **Archive Old Docs**: Move completed epics to archive/
3. **Update README**: Keep main README focused on essentials
4. **Version Control**: Use semantic versioning for docs when needed

## 📋 Quick Actions

- Move development artifacts to `archive/prototypes/`
- Keep only essential docs at root level
- Use consistent naming patterns
- Regular documentation audits
