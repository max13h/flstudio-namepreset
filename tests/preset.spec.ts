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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Opens the Quick Start dialog, writes text to clipboard, and clicks Paste. */
async function pasteText(page: Parameters<typeof test>[1], text: string) {
  await page.evaluate((t) => navigator.clipboard.writeText(t), text);
  await page.getByRole('button', { name: 'Quick Start' }).click();
  const dialog = page.getByRole('dialog', { name: 'Quick Start' });
  await dialog.getByRole('button', { name: 'Paste NamePreset content' }).click();
}

/** Opens the Quick Start dialog and clicks a default preset button by label. */
async function loadDefault(page: Parameters<typeof test>[1], label: string) {
  await page.getByRole('button', { name: 'Quick Start' }).click();
  const dialog = page.getByRole('dialog', { name: 'Quick Start' });
  await dialog.getByRole('button', { name: new RegExp(label) }).click();
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

test('shows empty state on load', async ({ page }) => {
  await expect(page.getByText('No presets loaded')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Quick Start dialog — open / close
// ---------------------------------------------------------------------------

test('Quick Start button opens the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).toBeVisible();
});

test('Cancel button closes the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).not.toBeVisible();
});

test('Close (✕) button closes the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).not.toBeVisible();
});

test('Escape closes the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).not.toBeVisible();
});

test('dialog lists all five FL Studio default categories', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick Start' }).click();
  const dialog = page.getByRole('dialog', { name: 'Quick Start' });
  for (const label of ['Channel', 'Mixer Slot', 'Mixer Track', 'Playlist Track', 'Pattern']) {
    await expect(dialog.getByRole('button', { name: new RegExp(label) })).toBeVisible();
  }
});

// ---------------------------------------------------------------------------
// Paste from clipboard
// ---------------------------------------------------------------------------

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
  await page.evaluate(() => navigator.clipboard.writeText('this is not a preset file at all!!!'));
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Paste NamePreset content' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  // Dialog stays open so the user can try again
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).toBeVisible();
  await expect(page.getByTestId('preset-row')).toHaveCount(0);
});

test('paste closes the dialog on success', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// Load FL Studio defaults
// ---------------------------------------------------------------------------

test('loads Channel default preset list', async ({ page }) => {
  await loadDefault(page, 'Channel');
  await expect(page.getByTestId('preset-row')).toHaveCount(30);
  await expect(page.getByTestId('preset-row').nth(0).getByLabel('Preset name')).toHaveValue('Drums');
});

test('loads Mixer Slot default preset list', async ({ page }) => {
  await loadDefault(page, 'Mixer Slot');
  await expect(page.getByTestId('preset-row')).toHaveCount(30);
  await expect(page.getByTestId('preset-row').nth(0).getByLabel('Preset name')).toHaveValue('EQ');
});

test('loads Mixer Track default preset list', async ({ page }) => {
  await loadDefault(page, 'Mixer Track');
  await expect(page.getByTestId('preset-row')).toHaveCount(50);
});

test('loads Playlist Track default preset list', async ({ page }) => {
  await loadDefault(page, 'Playlist Track');
  await expect(page.getByTestId('preset-row')).toHaveCount(40);
});

test('loads Pattern default preset list', async ({ page }) => {
  await loadDefault(page, 'Pattern');
  await expect(page.getByTestId('preset-row')).toHaveCount(40);
  // Pattern-specific entries start after the common 30
  await expect(page.getByTestId('preset-row').nth(30).getByLabel('Preset name')).toHaveValue('Intro');
});

test('loading a default closes the dialog', async ({ page }) => {
  await loadDefault(page, 'Channel');
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// Overwrite confirmation
// ---------------------------------------------------------------------------

test('loading a default when presets exist shows overwrite confirmation', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  // Load a second default — should trigger confirm
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: /Channel/ }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.getByRole('alertdialog')).toContainText('replace');
});

test('confirming overwrite replaces the presets', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: /Channel/ }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Replace' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(30);
  await expect(page.getByTestId('preset-row').nth(0).getByLabel('Preset name')).toHaveValue('Drums');
});

test('cancelling overwrite keeps existing presets', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: /Channel/ }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
  // Quick Start dialog should still be open, presets unchanged
  await expect(page.getByRole('dialog', { name: 'Quick Start' })).toBeVisible();
  await expect(page.getByTestId('preset-row')).toHaveCount(3);
});

test('pasting when presets exist shows overwrite confirmation', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  // Paste again — should trigger confirm
  await page.evaluate(() => navigator.clipboard.writeText('Bell,$62AB9F,78'));
  await page.getByRole('button', { name: 'Quick Start' }).click();
  await page.getByRole('dialog', { name: 'Quick Start' }).getByRole('button', { name: 'Paste NamePreset content' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Replace' }).click();
  await expect(page.getByTestId('preset-row')).toHaveCount(1);
  await expect(page.getByTestId('preset-row').nth(0).getByLabel('Preset name')).toHaveValue('Bell');
});

// ---------------------------------------------------------------------------
// Row editing (unchanged from before)
// ---------------------------------------------------------------------------

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
  await expect(page.getByRole('dialog', { name: 'Icon picker' })).not.toBeVisible();
  await expect(firstRow.getByRole('button', { name: 'Icon 4' })).toBeVisible();
});

test('drag: drop before target row', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await pasteText(page, SAMPLE);
  const rows = page.getByTestId('preset-row');
  const handles = page.getByTestId('drag-handle');
  const targetBox = await rows.nth(0).boundingBox();
  await handles.nth(2).dragTo(rows.nth(0), {
    targetPosition: { x: targetBox!.width / 2, y: 2 },
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
  const targetBox = await rows.nth(1).boundingBox();
  await handles.nth(0).dragTo(rows.nth(1), {
    targetPosition: { x: targetBox!.width / 2, y: targetBox!.height - 2 },
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
