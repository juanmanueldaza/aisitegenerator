# Permission Management Guide

Learn how to effectively manage OAuth application permissions on your GitHub account.

## Viewing Connected Applications

### Step 1: Navigate to GitHub Settings
1. Click your profile picture in the top-right corner of GitHub
2. Select "Settings" from the dropdown menu
3. In the left sidebar, click "Applications"

### Step 2: Review OAuth Applications
1. Click on the "Authorized OAuth Apps" tab
2. You'll see a list of all applications with access to your account
3. Each application shows:
   - Application name and developer
   - Granted permissions (scopes)
   - Last access date
   - Authorization date

### Step 3: Examine Application Details
Click on any application to see:
- Detailed scope information
- Recent activity
- Repository access (if applicable)
- Organization permissions

## Understanding Permission Scopes

### Repository Permissions
- **Public repositories**: Access to your public repositories only
- **All repositories**: Access to both public and private repositories
- **Selected repositories**: Access to specific repositories you choose

### User Permissions
- **Read access**: View your profile information
- **Write access**: Update your profile (rare)
- **Email access**: Access your email addresses

### Organization Permissions
- **Read**: View organization information
- **Write**: Make changes to organization settings
- **Admin**: Full organization management

## Managing Application Access

### Granting Permissions
When authorizing a new application:

1. **Read the permission request carefully**
   - Review each scope being requested
   - Understand why the application needs each permission
   - Check if the permissions seem reasonable for the app's function

2. **Use the principle of least privilege**
   - Only grant permissions the app actually needs
   - Prefer limited scopes over broad access
   - Consider using repository-specific permissions when available

3. **Verify the application**
   - Check the developer's reputation
   - Read reviews or documentation
   - Ensure the app is from a trusted source

### Reviewing Existing Permissions

**Monthly Review Process:**
1. Visit GitHub Settings → Applications
2. Review each connected application
3. Check the last access date
4. Remove unused applications
5. Verify permission scopes are still appropriate

**Red Flags to Watch For:**
- Applications you don't recognize
- Excessive permissions for simple tasks
- Long periods without use
- Applications from unknown developers

### Modifying Permissions

**For most OAuth applications:**
- You cannot modify permissions after granting them
- You must revoke and re-authorize to change scopes
- Some apps may request additional permissions later

**For GitHub Apps:**
- You can often modify repository access
- Organization owners can control app installations
- Permissions can be fine-tuned through settings

## Revoking Application Access

### When to Revoke Access
- You no longer use the application
- The application requests excessive permissions
- You suspect unauthorized activity
- The application is no longer maintained
- Your security requirements have changed

### How to Revoke Access

**Method 1: Through GitHub Settings**
1. Go to Settings → Applications → Authorized OAuth Apps
2. Find the application you want to remove
3. Click the "Revoke" button next to the application
4. Confirm the action in the dialog box

**Method 2: Through Organization Settings (if applicable)**
1. Go to your organization settings
2. Navigate to "Third-party access"
3. Find and revoke organization-level permissions

### What Happens After Revocation
- The application immediately loses access to your account
- Any active sessions are terminated
- The application cannot perform actions on your behalf
- Your existing data in the application may remain
- Repositories or content created by the app remain yours

## Organization-Level Management

### For Organization Owners

**Third-Party Application Policy:**
1. Set organization-wide policies for OAuth applications
2. Require approval for new applications
3. Maintain a whitelist of approved applications
4. Regularly audit organization access

**Member Access Control:**
- Review which members have granted access to applications
- Monitor applications with organization access
- Set up alerts for new application authorizations
- Enforce security policies consistently

### For Organization Members

**Best Practices:**
- Check if your organization has policies about third-party apps
- Get approval before authorizing applications with organization access
- Report suspicious applications to your security team
- Follow your organization's security guidelines

## Security Considerations

### Protecting Your Account

**Use Strong Authentication:**
- Enable two-factor authentication on GitHub
- Use a strong, unique password
- Regularly review security logs

**Monitor Application Activity:**
- Check the activity feed for automated actions
- Review commits made by applications
- Monitor for unexpected repository changes

**Keep Software Updated:**
- Use applications from developers who provide regular updates
- Check for security advisories from application developers
- Remove applications that are no longer maintained

### Incident Response

**If you suspect unauthorized access:**
1. Immediately revoke access for suspicious applications
2. Change your GitHub password
3. Review recent activity in your security log
4. Check for unexpected commits or repository changes
5. Contact GitHub support if necessary

**Recovery Steps:**
1. Secure your account with 2FA
2. Review and clean up application permissions
3. Update any compromised credentials
4. Monitor your account closely for a period

## Advanced Topics

### API Tokens vs OAuth Applications
- **Personal Access Tokens**: Direct API access with specific scopes
- **OAuth Applications**: Third-party app authorization
- **GitHub Apps**: Modern application integration with fine-grained permissions

### Webhook Management
- Review webhook endpoints for your repositories
- Ensure webhook URLs are secure (HTTPS)
- Monitor webhook activity for suspicious patterns
- Remove unused webhooks

### Integration Best Practices
- Use GitHub Apps instead of OAuth when possible
- Implement proper error handling for revoked permissions
- Provide clear documentation about required permissions
- Follow GitHub's security best practices

## Getting Help

### Resources
- [GitHub's OAuth documentation](https://docs.github.com/en/apps/oauth-apps)
- [GitHub security best practices](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure)
- [Third-party application policies](https://docs.github.com/en/organizations/managing-organization-settings)

### Support Channels
- GitHub Support for account-related issues
- Application developers for app-specific problems
- Community forums for general guidance
- Security team for organization-level concerns

Remember: Regular permission management is a crucial part of maintaining account security. Take time monthly to review and clean up your application permissions.