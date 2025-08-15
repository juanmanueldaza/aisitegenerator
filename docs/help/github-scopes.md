# GitHub Scopes and Permissions Guide

## What are GitHub Scopes?

GitHub scopes are specific permissions that define what actions an OAuth application can perform on your behalf. When you authorize an application like our AI Site Generator, you're granting it access to certain parts of your GitHub account.

## Why Scopes Matter

Scopes are essential for security because they:

- **Limit Access**: Applications can only access what they specifically need
- **Provide Transparency**: You know exactly what permissions you're granting
- **Enable Control**: You can revoke access at any time
- **Follow Principle of Least Privilege**: Apps get minimal necessary permissions

## Scopes Requested by AI Site Generator

### Repository Access (`repo`)

**Why we need it:**
- Create new repositories for your generated websites
- Commit HTML, CSS, and asset files to these repositories
- Configure repository settings for GitHub Pages deployment
- Update your website content when you make changes

**What we DON'T do:**
- Access your existing personal repositories
- Read private code or sensitive information
- Make unauthorized changes to your projects
- Share your repository data with third parties

### User Information (`user`)

**Why we need it:**
- Get your username for personalized experience
- Access your public email for notifications and support
- Read your profile information for proper attribution
- Understand your account type for feature availability

**What we DON'T do:**
- Access private personal information
- Share your data with third parties
- Send spam or unwanted communications
- Store unnecessary personal information

### GitHub Pages (`pages`)

**Why we need it:**
- Enable GitHub Pages on your website repositories
- Configure custom domains if specified
- Manage deployment settings for your sites
- Ensure your generated websites are properly published

## Security Best Practices

### Regular Auditing
- Review connected applications monthly
- Remove unused applications immediately
- Check permission scopes for each app
- Monitor for suspicious activity

### Permission Management
- Only grant necessary permissions
- Understand what each scope allows
- Revoke access when no longer needed
- Use organization settings to control app access

### Safe Authorization
- Always read permission requests carefully
- Verify the application's authenticity
- Check the developer's reputation
- Review the application's privacy policy

## Understanding Permission Levels

### 🟢 Safe Scopes
- `public_repo`: Access to public repositories only
- `user:email`: Access to email addresses
- `read:user`: Read access to profile information

### 🟡 Moderate Scopes
- `repo`: Full repository access (what we use)
- `admin:repo_hook`: Manage repository webhooks
- `write:packages`: Publish packages

### 🔴 High-Risk Scopes
- `admin:org`: Full organization access
- `delete_repo`: Delete repositories
- `admin:enterprise`: Enterprise management

Our application only requests **moderate-level scopes** that are necessary for website creation and deployment.

## Frequently Asked Questions

### Can I revoke access anytime?
Yes! You can revoke access at any time through your GitHub Settings → Applications → Authorized OAuth Apps.

### Will you access my private repositories?
No, we only access repositories we create for your websites. Your existing repositories remain private and untouched.

### What happens to my data if I revoke access?
Your generated websites will continue to work, but you won't be able to make updates through our application.

### Can I see what the app is doing with my account?
Yes! GitHub provides activity logs in your security settings, and you can see all commits made by our application.

## Need Help?

If you have questions about permissions or encounter any issues:

1. Check our [Troubleshooting Guide](troubleshooting.md)
2. Contact our support team
3. Review GitHub's [OAuth documentation](https://docs.github.com/en/apps/oauth-apps)

Remember: Your security is our priority. We only request the minimum permissions necessary to provide our service.