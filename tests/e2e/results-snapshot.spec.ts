import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});

test('results screen shows the SukarinCard for an archetype', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /診断をはじめる/ }).click();
  // Pick the highest option (5) on each question so we land on a stable code.
  for (let i = 0; i < 20; i++) {
    const opt = page.getByRole('button', { name: /^5\b/ }).first();
    await opt.click();
  }

  const card = page.getByTestId('sukarin-card');
  await expect(card).toBeVisible();
  await expect(card.locator('img')).toHaveCount(1);
  await expect(card).toContainText('型');

  // Pixel snapshot for visual regression. Tolerance: ~0.5% pixel diff.
  await expect(card).toHaveScreenshot('sukarin-card.png', { maxDiffPixelRatio: 0.005 });
});
