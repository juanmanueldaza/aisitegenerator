# Branch protection and labels

## Recommended protection rules (main)

- Require pull request reviews: 1 approval
- Require status checks to pass before merging:
  - CI (typecheck, lint, test, build)
  - semantic-pr (PR title)
- Dismiss stale approvals on new commits
- Require conversation resolution
- Restrict force pushes and deletions

## Labels

Seed default labels using `.github/docs/LABELS.json` via the GitHub API or a CLI.

Example (manual via GitHub REST API v3):

- Endpoint: `POST /repos/:owner/:repo/labels`
- Body fields: `name`, `color`, `description`

Notes:

- Keep labels small and clear (type/scope/impact).
- Use semantic commit messages to map `type:*` automatically.
