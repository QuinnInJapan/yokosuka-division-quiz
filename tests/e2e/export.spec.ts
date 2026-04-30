import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

async function completeQuiz(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /診断をはじめる/ }).click();
  // 20 questions — pick option 3 (neutral) for each.
  for (let i = 0; i < 20; i++) {
    const neutral = page.getByRole('button', { name: /^3\b/ }).first();
    await neutral.click();
  }
}

test('export modal: opens, shows canvas, saves PNG', async ({ page }) => {
  await completeQuiz(page);

  const exportBtn = page.getByTestId('export-button');
  await expect(exportBtn).toBeVisible();
  await exportBtn.click();

  const modal = page.getByTestId('export-modal');
  await expect(modal).toBeVisible();

  const canvas = page.getByTestId('export-canvas');
  await expect(canvas).toBeVisible();
  const dims = await canvas.evaluate((el: HTMLCanvasElement) => ({ w: el.width, h: el.height }));
  expect(dims.w).toBe(794 * 2);
  expect(dims.h).toBe(1123 * 2);

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-save').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^yokosuka-quiz-.+-\d{4}-\d{2}-\d{2}\.png$/);
});

test('export modal: ESC closes', async ({ page }) => {
  await completeQuiz(page);
  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('export-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('export-modal')).toHaveCount(0);
});
