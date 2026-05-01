import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

async function completeQuiz(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /診断をはじめる/ }).click();
  // Answer 20 questions with option 3 (neutral) → all axes score 0.
  // Button text is "{i+1}{optionText}", so option 3 starts with "3".
  for (let i = 0; i < 20; i++) {
    await page.getByRole('button', { name: /^3/ }).first().click();
  }
  // Wait for results screen to mount.
  await expect(page.getByTestId('results-band-hero')).toBeVisible();
}

test('results screen renders all four color bands', async ({ page }) => {
  await completeQuiz(page);
  await expect(page.getByTestId('results-band-hero')).toBeVisible();
  await expect(page.getByTestId('results-band-traits')).toBeVisible();
  await expect(page.getByTestId('results-band-match')).toBeVisible();
  await expect(page.getByTestId('results-band-actions')).toBeVisible();
});

test('results bands stack in order: hero → traits → match → actions', async ({ page }) => {
  await completeQuiz(page);
  const hero = await page.getByTestId('results-band-hero').boundingBox();
  const traits = await page.getByTestId('results-band-traits').boundingBox();
  const match = await page.getByTestId('results-band-match').boundingBox();
  const actions = await page.getByTestId('results-band-actions').boundingBox();
  if (!hero || !traits || !match || !actions) {
    throw new Error('a results band did not render');
  }
  expect(hero.y).toBeLessThan(traits.y);
  expect(traits.y).toBeLessThan(match.y);
  expect(match.y).toBeLessThan(actions.y);
});

test('results hero band has a non-default background (per-archetype palette applied)', async ({ page }) => {
  await completeQuiz(page);
  const hero = page.getByTestId('results-band-hero');
  const bg = await hero.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('linear-gradient');
});
