# Manage Access & Revoke Tokens

You control this app's access at any time.

- Review or revoke access: GitHub → Settings → Applications → Authorized OAuth Apps → select this app → Revoke.
- What "Sign Out" does here: clears the token for this browser tab (stored in sessionStorage). It does not revoke at GitHub level.
- When to re-authorize: if scopes are missing (e.g., public_repo) or you revoked access.

Troubleshooting

- 401/403 errors after revoking: re-authorize from the Sign In button.
- Publishing blocked due to missing scopes: open the Scopes panel and click Re-authorize.
- Multiple accounts: ensure you’re signed into the intended GitHub account before authorizing.
