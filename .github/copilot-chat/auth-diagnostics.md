## OAuth Diagnostics Mode

Use this when sign-in fails.

- Enable `?auth_debug=1` to surface logs
- Check Client ID source: URL param `gh_client_id`, localStorage, or env
- For localhost, prefer Device Flow; for production, ensure redirect URI matches
- Dev proxy `/__gh/oauth/*` and `/__gh/device/*` should only be active in dev
- If token exchange fails, inspect network for POST to `/access_token` and JSON body
- If deployment fails with SHA errors, ensure `uploadFiles` fetches existing SHAs first
