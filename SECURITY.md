Security and CSP Guidance

- OAuth tokens are stored in sessionStorage to limit persistence and exposure. On tab close, tokens are cleared.
- Do not persist tokens to localStorage or cookies. If you fork this app and add a backend, store tokens server-side.
- Content Security Policy (CSP): When deploying behind a strict CSP, allow the following sources:
  - connect-src: https://api.github.com https://github.com https://raw.githubusercontent.com
  - img-src: https://avatars.githubusercontent.com data:
  - script-src: 'self'
  - frame-src: 'self'
  - style-src: 'self' 'unsafe-inline' (Prism/Markdown may emit inline styles; consider hashing if you remove 'unsafe-inline').
- The LivePreview iframe uses a blob URL and sandbox="allow-scripts allow-forms". It is intentionally not same-origin to avoid DOM escapes.
- Never log raw tokens. Debug helpers mask sensitive values.

Revoking permissions

- Users can fully revoke the OAuth app from GitHub → Settings → Applications → Authorized OAuth Apps.
- The in-app "Sign Out" only clears the token for the current tab/session.
