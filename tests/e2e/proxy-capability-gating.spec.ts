import { test, expect } from '@playwright/test';

// Note: This spec assumes the AI SDK proxy endpoints are reachable at /api/ai-sdk.
// In CI, you'll need to run `npm run proxy` separately and point Vite proxy to it.
// Locally, you can run `npm run dev:all` to start both.
// We'll soft-skip if the capability badge indicates Offline.

test('proxy mode shows proxy health badge and enables provider select when online', async ({
  page,
}) => {
  // Soft-skip when proxy env not configured for this run
  const isProxyConfigured = !!process.env.VITE_AI_PROXY_BASE_URL;
  test.skip(!isProxyConfigured, 'VITE_AI_PROXY_BASE_URL not set; skipping proxy UI test');

  await page.goto('/');

  await page.getByRole('button', { name: '💬 AI Assistant' }).click();

  // The proxy health badge appears when VITE_AI_PROXY_BASE_URL is configured
  // We check presence of the label and accept either Online/Offline values
  const badge = page.getByText(/AI SDK Proxy:/);
  await expect(badge).toBeVisible();

  // If Online, the Provider select should be enabled
  const text = await badge.textContent();
  if (text && /Online/i.test(text)) {
    const providerSelect = page.getByRole('combobox', { name: 'Provider' });
    await expect(providerSelect).toBeEnabled();
  } else {
    test
      .info()
      .annotations.push({ type: 'note', description: 'Proxy offline; skipping enabled assertion' });
  }
});
