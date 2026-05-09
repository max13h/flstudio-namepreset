import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'flstudio-namepreset';

const SAMPLE = `Drums,$926555,4
Bass,$555792,14
Hook,$928855,70`;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('presets survive a page reload', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate((t) => navigator.clipboard.writeText(t), SAMPLE);
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Paste NamePreset content' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(3);

  await page.reload();

  const rows = page.getByTestId('preset-row');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0).getByLabel('Preset name')).toHaveValue('Drums');
  await expect(rows.nth(1).getByLabel('Preset name')).toHaveValue('Bass');
  await expect(rows.nth(2).getByLabel('Preset name')).toHaveValue('Hook');
});

test('presets are written to localStorage', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate((t) => navigator.clipboard.writeText(t), SAMPLE);
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Paste NamePreset content' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(3);

  const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  expect(stored).not.toBeNull();
  const parsed = JSON.parse(stored!);
  expect(parsed).toHaveLength(3);
  expect(parsed[0].name).toBe('Drums');
});

test('inline edits are persisted across reload', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate((t) => navigator.clipboard.writeText(t), SAMPLE);
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Paste NamePreset content' }).click();

  const firstInput = page.getByTestId('preset-row').nth(0).getByLabel('Preset name');
  await firstInput.fill('Kick');
  await firstInput.blur();

  await page.reload();

  await expect(page.getByTestId('preset-row').nth(0).getByLabel('Preset name')).toHaveValue('Kick');
});

test('loading a default preset list persists across reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: /Channel/ }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(30);

  await page.reload();

  await expect(page.getByTestId('preset-row')).toHaveCount(30);
  await expect(page.getByTestId('preset-row').nth(0).getByLabel('Preset name')).toHaveValue('Drums');
});

test('empty state is restored when localStorage has no saved presets', async ({ page }) => {
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(page.getByText('No presets loaded')).toBeVisible();
});

test('corrupted localStorage entry is ignored gracefully', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, 'not valid json {{{'), STORAGE_KEY);
  await page.reload();
  await expect(page.getByText('No presets loaded')).toBeVisible();
});
