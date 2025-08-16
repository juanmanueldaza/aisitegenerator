## Goal

Bring the app to production readiness with minimal risk.

## Checklist

- Build: ensure `npm run build` succeeds on CI and artifacts are uploaded
- Testing: Vitest unit tests green; Playwright e2e smoke for auth Device Flow
- Auth:
  - PKCE: production OAuth app with exact redirect URI
  - Device Flow: enable only for dev/docs; feature flag if needed
  - Runtime Client ID: verify masking and no persistence of tokens beyond session
- Security:
  - Subresource Integrity for CDN deps (if any)
  - CSP headers if deploying behind a server/proxy
  - Audit dependencies: `npm audit --production`
- Pages Deploy (if used): verify content SHAs are handled and Pages enabled
- Monitoring: add basic web-vitals and error logging hooks
- Docs: update README with setup, auth flows, and troubleshooting
