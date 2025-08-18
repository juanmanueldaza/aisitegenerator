# Production Readiness Checklist

This is a pragmatic checklist to take the app to production.

## Quality gates

- [ ] **Quality Gates Script**: Run `./scripts/quality-gates.sh` successfully
  - [ ] TypeScript type checking passes (`npm run typecheck`)
  - [ ] ESLint code quality passes (`npm run lint`)
  - [ ] Unit & Integration tests pass with 80% coverage (`npm run test:coverage`)
  - [ ] Production build succeeds (`npm run build`)
  - [ ] Security audit passes (`npm audit`)
- [ ] **E2E Tests**: Cross-browser validation (`npx playwright test`)
- [ ] **CI/CD Pipeline**: All GitHub Actions jobs pass on PRs

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
