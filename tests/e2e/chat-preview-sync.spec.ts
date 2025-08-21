import { test, expect } from '@playwright/test';

// E2E: chat → apply → preview sync (uses built-in simulated AI path when no API key)
test('chat generates code that applies to editor and appears in preview', async ({ page }) => {
  await page.goto('/');

  // Ensure we are on the chat tab
  await page.getByRole('button', { name: '💬 AI Assistant' }).click();

  // Type a prompt that triggers code response in simulateAIResponse
  // Deep Chat uses a contenteditable input; target by role=textbox for reliability
  const textbox = page.getByRole('textbox', { name: /Describe the website you want to create/ });
  await textbox.click();
  await textbox.fill('Please provide some HTML code for a basic website');
  await textbox.press('Enter');

  // Wait for the toast indicating auto-apply or the Use in Editor button then click it
  const maybeToast = page.getByText('Applied AI code to editor');
  await Promise.race([
    maybeToast.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {}),
    page.getByRole('button', { name: 'Use in Editor' }).first().waitFor({ state: 'visible' }),
  ]);

  // If Use in Editor is visible, click it to ensure content is applied
  if (
    await page
      .getByRole('button', { name: 'Use in Editor' })
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await page.getByRole('button', { name: 'Use in Editor' }).first().click();
  }

  // Switch to Editor tab and verify textarea contains expected snippet marker
  await page.getByRole('button', { name: '✏️ Editor' }).click();
  const editor = page.getByPlaceholder('Enter your website content here...');
  await expect(editor).toBeVisible();
  const val = await editor.inputValue();
  expect(val).toContain('<!DOCTYPE html>');

  // Verify the LivePreview iframe renders a heading from the simulated HTML
  const frame = page.frameLocator('iframe[title="Live Preview"]');
  await expect(frame.locator('h1')).toHaveText(/Welcome to Your Website/i);
});
