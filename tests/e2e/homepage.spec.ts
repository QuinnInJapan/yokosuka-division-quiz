import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('hero: title, lede, axis chips, CTA all visible above fold', async ({ page }) => {
  await page.goto('/');
  const heroH1 = page.locator('h1');
  await expect(heroH1).toContainText('横須賀市役所');
  await expect(heroH1).toContainText('部署タイプ診断');
  for (const ax of ['A', 'B', 'C', 'D', 'E']) {
    await expect(page.getByTestId(`hero-axis-chip-${ax}`)).toBeVisible();
  }
  const cta = page.getByRole('button', { name: /診断をはじめる/ });
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  if (!box) throw new Error('CTA not found');
  expect(box.y + box.height).toBeLessThan(900);
});

test('stepper: 4 segments visible, first filled + active', async ({ page }) => {
  await page.goto('/');
  for (let i = 1; i <= 4; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toBeVisible();
  }
  await expect(page.getByTestId('stepper-step-1')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('stepper-step-1')).toHaveAttribute('data-filled', 'true');
  for (let i = 2; i <= 4; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toHaveAttribute('data-active', 'false');
    await expect(page.getByTestId(`stepper-step-${i}`)).toHaveAttribute('data-filled', 'false');
  }
});

test('stepper: clicking segment fills 1..N and activates clicked', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('stepper-step-3').click();
  await expect(page.getByTestId('stepper-step-3')).toHaveAttribute('data-active', 'true');
  for (let i = 1; i <= 3; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toHaveAttribute('data-filled', 'true');
  }
  await expect(page.getByTestId('stepper-step-4')).toHaveAttribute('data-filled', 'false');
  await expect(page.getByTestId('carousel-slide-3')).toHaveAttribute('data-active', 'true');
});

test('stepper: keyboard arrows update carousel and stepper fill', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('stepper-step-1')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('stepper-step-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('stepper-step-2')).toHaveAttribute('data-filled', 'true');
});

test('stepper: numeral renders only on active segment', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('stepper-step-1')).toContainText('01');
  for (let i = 2; i <= 4; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toHaveText('');
  }
  await page.getByTestId('stepper-step-3').click();
  await expect(page.getByTestId('stepper-step-3')).toContainText('03');
  await expect(page.getByTestId('stepper-step-1')).toHaveText('');
});

test('explainer head: counter updates and chevrons navigate', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('explainer-head')).toBeVisible();
  await expect(page.getByTestId('explainer-count')).toHaveText('1 / 4');
  await expect(page.getByTestId('explainer-prev')).toBeDisabled();
  await page.getByTestId('explainer-next').click();
  await expect(page.getByTestId('explainer-count')).toHaveText('2 / 4');
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('explainer-prev')).toBeEnabled();
  await page.getByTestId('explainer-prev').click();
  await expect(page.getByTestId('explainer-count')).toHaveText('1 / 4');
});

test('layout: page does not scroll vertically at 1440x900', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

