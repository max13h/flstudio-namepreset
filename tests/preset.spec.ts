import { test, expect } from '@playwright/test';

const SAMPLE = `Drums,$926555,4
Bass,$555792,14
Hook,$928855,70`;

const CATEGORY_SAMPLE = `Drums,$926555,4
DRUMS SECTION,,
Bass,$555792,14`;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('shows empty state on load', async ({ page }) => {
  await expect(page.getByText('No presets loaded')).toBeVisible();
});

// Helper: inject clipboard text and click Paste
async function pasteText(page: Parameters<typeof test>[1], text: string) {
  await page.evaluate((t) => navigator.clipboard.writeText(t), text);
  await page.getByRole('button', { name: 'Paste NamePreset content' }).click();
}

test('parses valid preset content from clipboard', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  const rows = page.getByTestId('preset-row');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0).getByLabel('Preset name')).toHaveValue('Drums');
  await expect(rows.nth(1).getByLabel('Preset name')).toHaveValue('Bass');
  await expect(rows.nth(2).getByLabel('Preset name')).toHaveValue('Hook');
});

test('shows error for invalid clipboard content', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, 'this is not a preset file at all!!!');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByTestId('preset-row')).toHaveCount(0);
});

test('adds a new blank row when clicking + Add line', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await expect(page.getByTestId('preset-row')).toHaveCount(3);
  await page.getByRole('button', { name: '+ Add line' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(4);
});

test('delete: cancel keeps the row', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await page.getByTestId('preset-row').nth(0).getByRole('button', { name: 'Delete preset' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(3);
});

test('delete: confirm removes the row', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await page.getByTestId('preset-row').nth(0).getByRole('button', { name: 'Delete preset' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(2);
  await expect(page.getByTestId('preset-row').nth(0).getByLabel('Preset name')).toHaveValue('Bass');
});

test('toggles category row', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  const firstRow = page.getByTestId('preset-row').nth(0);
  const catBtn = firstRow.getByRole('button', { name: 'Toggle category' });
  await catBtn.click();
  await expect(firstRow).toHaveClass(/category/);
  await expect(firstRow.getByRole('button', { name: /Icon/ })).toBeDisabled();
});

test('icon picker: open, click icon, closes and updates', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  const firstRow = page.getByTestId('preset-row').nth(0);
  await firstRow.getByRole('button', { name: /Icon/ }).click();
  const picker = page.getByRole('dialog', { name: 'Icon picker' });
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: 'Icon 42' }).click();
  await expect(picker).not.toBeVisible();
  await expect(firstRow.getByRole('button', { name: 'Icon 42' })).toBeVisible();
});

test('icon picker: escape dismisses without change', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  const firstRow = page.getByTestId('preset-row').nth(0);
  await firstRow.getByRole('button', { name: /Icon/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(firstRow.getByRole('button', { name: 'Icon 4' })).toBeVisible();
});

test('drag: drop before target row', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  const rows = page.getByTestId('preset-row');
  const handles = page.getByTestId('drag-handle');
  // Drop handle of row 2 (Hook) onto the top half of row 0 (Drums) → Hook lands before Drums
  const targetBox = await rows.nth(0).boundingBox();
  await handles.nth(2).dragTo(rows.nth(0), {
    targetPosition: { x: targetBox!.width / 2, y: 2 }, // top edge = 'before'
  });
  await expect(rows.nth(0).getByLabel('Preset name')).toHaveValue('Hook');
  await expect(rows.nth(1).getByLabel('Preset name')).toHaveValue('Drums');
  await expect(rows.nth(2).getByLabel('Preset name')).toHaveValue('Bass');
});

test('drag: drop after target row', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  const rows = page.getByTestId('preset-row');
  const handles = page.getByTestId('drag-handle');
  // Drop handle of row 0 (Drums) onto the bottom half of row 1 (Bass) → Drums lands after Bass
  const targetBox = await rows.nth(1).boundingBox();
  await handles.nth(0).dragTo(rows.nth(1), {
    targetPosition: { x: targetBox!.width / 2, y: targetBox!.height - 2 }, // bottom edge = 'after'
  });
  await expect(rows.nth(0).getByLabel('Preset name')).toHaveValue('Bass');
  await expect(rows.nth(1).getByLabel('Preset name')).toHaveValue('Drums');
  await expect(rows.nth(2).getByLabel('Preset name')).toHaveValue('Hook');
});

test('copy button serializes presets to clipboard', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await page.getByRole('button', { name: 'Copy output' }).click();
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('Drums,$');
  expect(clipText).toContain('Bass,$');
  expect(clipText).toContain('Hook,$');
});

test('category rows serialize as Name,,', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, CATEGORY_SAMPLE);
  await page.getByRole('button', { name: 'Copy output' }).click();
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('DRUMS SECTION,,');
});
