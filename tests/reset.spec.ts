import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'flstudio-namepreset';

const SAMPLE = `Drums,$926555,4
Bass,$555792,14
Hook,$928855,70`;

// Clear localStorage before every test so leftover presets from other spec
// files don't trigger the overwrite-confirm flow when pasting.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
});

// Selector helper — "reset" is a substring of "presets", so exact: true is
// required to avoid matching the preset-card buttons inside the Quick Start dialog.
const resetBtn = (page: Parameters<typeof test>[1]) =>
  page.getByRole('button', { name: 'Reset', exact: true });

async function pasteText(page: Parameters<typeof test>[1], text: string) {
  await page.evaluate((t) => navigator.clipboard.writeText(t), text);
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Paste NamePreset content' }).click();
}

test('Reset button is disabled when no presets are loaded', async ({ page }) => {
  await expect(resetBtn(page)).toBeDisabled();
});

test('Reset button is enabled once presets are loaded', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await expect(resetBtn(page)).toBeEnabled();
});

test('clicking Reset opens a confirmation dialog', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await resetBtn(page).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.getByRole('alertdialog')).toContainText('clear');
});

test('cancelling Reset keeps all presets', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await resetBtn(page).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(3);
});

test('confirming Reset clears all presets and shows empty state', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await resetBtn(page).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(0);
  await expect(page.getByText('No presets loaded')).toBeVisible();
});

test('Reset button is disabled again after confirming', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await resetBtn(page).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reset' }).click();
  await expect(resetBtn(page)).toBeDisabled();
});

test('Reset clears localStorage so presets do not return on reload', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await resetBtn(page).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reset' }).click();

  const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  expect(JSON.parse(stored!)).toHaveLength(0);

  await page.reload();
  await expect(page.getByText('No presets loaded')).toBeVisible();
});
