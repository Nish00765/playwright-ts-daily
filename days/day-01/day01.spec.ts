import { test, expect } from '@playwright/test';

// Day 1 — 5 practice programs
// Folder pattern: days/day-NN/dayNN.spec.ts

test('1. page has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('2. get started link navigates correctly', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page).toHaveURL(/.*intro/);
});

test('3. search button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Search' }),
  ).toBeVisible();
});

test('4. typescript type check example', async () => {
  const add = (a: number, b: number): number => a + b;
  expect(add(2, 3)).toBe(5);
});

test('5. navigation menu has expected items', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation').first();
  await expect(nav).toContainText('Docs');
});