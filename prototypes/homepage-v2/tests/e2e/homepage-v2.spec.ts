import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('hero: title, lede, stats trio, CTA all visible above fold', async ({ page }) => {
  await page.goto('/');
  const heroH1 = page.locator('h1');
  await expect(heroH1).toContainText('横須賀市役所');
  await expect(heroH1).toContainText('部署タイプ診断');
  for (const n of ['20', '5', '102']) {
    await expect(page.getByTestId(`hero-stat-${n}`)).toBeVisible();
  }
  const cta = page.getByRole('button', { name: /診断をはじめる/ });
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  if (!box) throw new Error('CTA not found');
  expect(box.y + box.height).toBeLessThan(900);
});

test('hero: five axis color stripes render at bottom-left', async ({ page }) => {
  await page.goto('/');
  for (const ax of ['A', 'B', 'C', 'D', 'E']) {
    await expect(page.getByTestId(`hero-axis-stripe-${ax}`)).toBeVisible();
  }
});

test('stepper: numerals 01-05 visible, active gets data-active', async ({ page }) => {
  await page.goto('/');
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toBeVisible();
  }
  await expect(page.getByTestId('stepper-step-1')).toHaveAttribute('data-active', 'true');
  for (let i = 2; i <= 5; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toHaveAttribute('data-active', 'false');
  }
});

test('stepper: contextual label shows current step JP label only', async ({ page }) => {
  await page.goto('/');
  const label = page.getByTestId('stepper-current-label');
  await expect(label).toHaveText('入力');
  await page.getByTestId('stepper-step-3').click();
  await expect(label).toHaveText('比較');
  await expect(page.getByTestId('carousel-slide-3')).toHaveAttribute('data-active', 'true');
});

test('stepper: keyboard arrows update both carousel and stepper', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('stepper-step-1')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('stepper-step-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('stepper-current-label')).toHaveText('採点');
});

test('layout: page does not scroll vertically at 1440x900', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
