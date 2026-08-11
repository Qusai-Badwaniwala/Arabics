import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const tokens = readFileSync(
  fileURLToPath(new URL('../Website/src/styles/tokens.css', import.meta.url)),
  'utf8',
);
const dayGround = /--ground:\s*([^;]+);/.exec(tokens)?.[1]?.trim();

test('the home screen opens on the app name in Arabic', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.title-ar')).toHaveText('إِتْقَان');
  await expect(page.locator('.title-ar')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('10 cards waiting')).toBeVisible();
  await expect(page.getByText('300 words · 172 roots · 0 met')).toBeVisible();
});

test('a review can be done with the keyboard alone', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start review' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('.study')).toHaveText('و');
  await expect(page.getByText('10 left')).toBeVisible();

  // Space reveals, 1-4 grades. Nothing here needs a pointer.
  await page.locator('body').press(' ');
  await expect(page.getByText('and')).toBeVisible();
  await page.locator('body').press('3');

  await expect(page.locator('.study')).toHaveText('ال');
  await expect(page.getByText('9 left')).toBeVisible();
});

test('the Arabic word does not move when the answer appears', async ({
  page,
}) => {
  // Found by looking at the thing, not by a test: revealing the gloss made the
  // panel taller, and a vertically-centred panel slid the word up the screen
  // at the exact moment the eye was on it.
  await page.goto('/#review');
  const word = page.locator('.study');
  const before = await word.boundingBox();
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect(page.getByText('and')).toBeVisible();
  expect((await word.boundingBox())?.y).toBe(before?.y);
});

test('a graded card is still graded after a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start review' }).click();
  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: /^Good/ }).click();
  await expect(page.getByText('9 left')).toBeVisible();

  await page.goto('/');
  await expect(page.getByText('9 cards waiting')).toBeVisible();
  await expect(page.getByText('1 reviewed today')).toBeVisible();
});

test('a corrected gloss replaces the hand-written one', async ({ page }) => {
  await page.goto('/#review');
  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: 'Edit gloss' }).click();
  await page.getByLabel('Gloss').fill('and (wāw)');
  await page.getByLabel('Gloss').press('Enter');

  // The correction outlives the session, not just the card.
  await page.reload();
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect(page.getByText('and (wāw)')).toBeVisible();
});

test('the whole state can be exported to a file', async ({ page }) => {
  await page.goto('/');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export data' }).click();
  expect((await download).suggestedFilename()).toMatch(
    /^arabic-mastery-\d{4}-\d{2}-\d{2}\.json$/,
  );
});

test('the app runs with the network switched off', async ({
  page,
  context,
}) => {
  // The hard constraint of the whole product: no network call at runtime.
  await page.goto('/');
  await page.waitForFunction(
    () => navigator.serviceWorker.controller !== null,
    undefined,
    { timeout: 15_000 },
  );

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.title-ar')).toHaveText('إِتْقَان');
  await page.getByRole('button', { name: 'Start review' }).click();
  await expect(page.locator('.study')).toHaveText('و');
});

test('the installable manifest points at icons that exist', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.locator('link[rel=manifest]')).toHaveCount(1);

  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.name).toBe('Arabic Mastery');
  expect(manifest.display).toBe('standalone');
  // The manifest colour is parsed out of tokens.css at build time; this is the
  // check that the parse actually happened.
  expect(manifest.theme_color).toBe(dayGround);
  expect(manifest.icons.length).toBeGreaterThan(0);

  for (const icon of manifest.icons) {
    const res = await request.get(`/${icon.src.replace(/^\//, '')}`);
    expect(res.status(), icon.src).toBe(200);
  }
  expect(
    manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable'),
    'Android crops a non-maskable icon into a circle',
  ).toBe(true);
});
