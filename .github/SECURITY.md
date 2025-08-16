# Security Policy

## Supported Versions

We support the latest `main` branch. For issues impacting security, please open a private report.

## Reporting a Vulnerability

Please do not open a public issue for security vulnerabilities. Email the maintainer listed in `package.json` or use GitHub Security Advisories.

## Handling Tokens and Secrets

- Never commit tokens/secrets. `.gitignore` covers `.env*` and `token.txt`.
- Local development uses Device Flow to avoid storing secrets.
- Production OAuth should use a registered redirect URI and least-privilege scopes.
