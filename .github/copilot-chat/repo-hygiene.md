## Repository Hygiene Tasks

- Remove scaffolding files not used in production:
  - `README_VITE.md` (fold essential bits into main README)
  - `public/vite.svg` and `src/assets/react.svg` if not referenced
  - `close-prs.sh` once PR backlog is cleared
  - `IMPLEMENTATION_SUMMARY.md` and `WORKFLOW_COMPLETION_SUMMARY.md` can be condensed
- Ensure `.env.example` reflects current runtime needs (Client ID optional due to runtime input)
- Add CODEOWNERS and ownership of critical dirs (`src/services`, `.github/workflows`)
- Tighten CI to run unit tests, typecheck, lint, and build on PRs
