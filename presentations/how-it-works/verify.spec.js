import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('deck advances through all 5 slides without console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));

  for (let i = 1; i <= 5; i++) {
    await expect(page.locator(`.slide.active[data-slide="${i}"]`)).toBeVisible();
    await page.waitForTimeout(1300);
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', `slide-${i}-rendered.png`),
      fullPage: false,
    });
    if (i < 5) await page.keyboard.press('ArrowRight');
  }

  expect(errors).toEqual([]);
});
