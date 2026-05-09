import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('defaults to dark theme', async ({ page }) => {
  const theme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  expect(theme).toBe('dark');
});

test('toggle switches to light theme', async ({ page }) => {
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  const theme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  expect(theme).toBe('light');
});

test('toggle switches back to dark theme', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Toggle theme' });
  await btn.click();
  await btn.click();
  const theme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  expect(theme).toBe('dark');
});

test('theme persists across page reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.reload();
  const theme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  expect(theme).toBe('light');
});

test('theme stored in localStorage', async ({ page }) => {
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  const stored = await page.evaluate(() => localStorage.getItem('theme'));
  expect(stored).toBe('light');
});
