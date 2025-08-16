import { test, expect } from '@playwright/test';

// Smoke test: stub GitHub OAuth endpoints and verify Device Flow UI path

test('device flow shows code and verification URL with stubbed GitHub', async ({ page }) => {
  const clientId = 'Iv1.stub_client_id';

  // Stub device code endpoint
  await page.route('**/__gh/device/code', async (route) => {
    const body = {
      device_code: 'stub_device_code',
      user_code: 'ABCD-EFGH',
      verification_uri: 'https://github.com/login/device',
      expires_in: 900,
      interval: 5,
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  // Stub token poll endpoint
  await page.route('**/__gh/oauth/access_token', async (route) => {
    const body = {
      access_token: 'stub_access_token',
      token_type: 'bearer',
      scope: 'user:email public_repo',
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.goto(`/?auth_debug=1&gh_client_id=${clientId}`);

  // Click Device Login
  await page.getByRole('button', { name: 'Use Device Login (no redirect)' }).click();

  // Expect instruction text with code appears
  await expect(page.getByText('Visit')).toBeVisible();
  await expect(page.getByText('Enter code:')).toBeVisible();
  await expect(page.getByText('ABCD-EFGH')).toBeVisible();
});
