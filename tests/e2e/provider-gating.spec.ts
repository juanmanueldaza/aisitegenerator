import { test, expect } from '@playwright/test';

// These tests focus on UI gating based on local vs proxy modes.
// We only verify local mode here (default dev server). Proxy mode requires server endpoints.

test.describe('Provider gating - local mode', () => {
  test('provider select is disabled and API key input is visible when not using proxy', async ({
    page,
  }) => {
    await page.goto('/');

    // Ensure we are on the chat tab
    await page.getByRole('button', { name: '💬 AI Assistant' }).click();

    // Provider select should be disabled in local mode
    const providerSelect = page.getByRole('combobox', { name: 'Provider' });
    await expect(providerSelect).toBeDisabled();

    // API key input should be visible (password input)
    const apiKeyInput = page.getByPlaceholder('Enter your Gemini API key...');
    await expect(apiKeyInput).toBeVisible();
  });

  test('model validation hint appears when model does not match provider', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '💬 AI Assistant' }).click();

    const modelInput = page.locator('label:has-text("Model") >> input[type="text"]');
    await modelInput.click();
    await modelInput.fill('gpt-4o');

    const hint = page.getByText(/Model may not match gemini/i);
    await expect(hint).toBeVisible();
  });
});
