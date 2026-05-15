import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('hero: title, lede, CTA all visible above fold', async ({ page }) => {
  await page.goto('/');
  const heroH1 = page.locator('aside h1').first();
  await expect(heroH1).toContainText('横須賀市役所');
  await expect(heroH1).toContainText('部署タイプ診断');
  const cta = page.getByRole('button', { name: /診断をはじめる/ });
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  if (!box) throw new Error('CTA not found');
  expect(box.y + box.height).toBeLessThan(900);
});

test('right panel: clicking empty area advances carousel', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('carousel-slide-1')).toHaveAttribute('data-active', 'true');
  await page.getByTestId('welcome-right').click({ position: { x: 10, y: 10 } });
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
});

test('keyboard arrows navigate carousel slides', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('carousel-slide-1')).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('carousel-slide-1')).toHaveAttribute('data-active', 'true');
});

test('explainer head: chevrons navigate slides', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('explainer-head')).toBeVisible();
  await expect(page.getByTestId('carousel-slide-1')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('explainer-prev')).toBeDisabled();
  await page.getByTestId('explainer-next').click();
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('explainer-prev')).toBeEnabled();
  await page.getByTestId('explainer-prev').click();
  await expect(page.getByTestId('carousel-slide-1')).toHaveAttribute('data-active', 'true');
});

test('slide 1 option click advances to slide 2', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('carousel-slide-1')).toHaveAttribute('data-active', 'true');
  await page.getByTestId('carousel-slide-1').getByRole('radio').first().click();
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
});

test('layout: page does not scroll vertically at 1440x900', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

