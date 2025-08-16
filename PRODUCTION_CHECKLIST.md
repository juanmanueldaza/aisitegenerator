# Production Readiness Checklist

This is a pragmatic checklist to take the app to production.

## Quality gates

- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Unit tests pass (`npm test`)
- [ ] E2E smoke test passes (`npm run e2e`)
- [ ] CI green on PRs (see `.github/workflows/ci.yml`)

## Auth

- [ ] GitHub OAuth App configured with exact redirect URI for prod
- [ ] PKCE flow verified on production domain
- [ ] Device Flow used only for local/dev docs
- [ ] Runtime Client ID UI works; masking in logs is enabled

## Deployment

- [ ] Deploy flow includes SHA for updates (fixed in `GitHubAPIService.uploadFiles`)
- [ ] GitHub Pages enabled and serving from main branch
- [ ] Basic smoke of deployed app

## Security

- [ ] .env and tokens ignored by git (see `.gitignore`)
- [ ] No secrets committed; Device Flow for local dev
- [ ] Audit dependencies (`npm audit --production`) and update if needed

## Docs

- [ ] README has clear setup, auth flows, troubleshooting
- [ ] Remove/condense scaffolding docs: `README_VITE.md`, `IMPLEMENTATION_SUMMARY.md`, `WORKFLOW_COMPLETION_SUMMARY.md` as needed

## Observability

- [ ] Basic error logging hooks
- [ ] Web-vitals collection (optional)
