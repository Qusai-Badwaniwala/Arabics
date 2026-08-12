import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const tokens = readFileSync(
  fileURLToPath(new URL('../Website/src/styles/tokens.css', import.meta.url)),
  'utf8',
);
const dayGround = /--ground:\s*([^;]+);/.exec(tokens)?.[1]?.trim();

/** The word arrives with an animation, and getBoundingClientRect includes a
 *  mid-flight transform. Wait for it or every measurement is of the motion. */
async function wordSettled(page: import('@playwright/test').Page) {
  await page
    .locator('.word-slot')
    .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

test('the app opens on today, not on a menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.day-mark')).toHaveText('إِتْقَان');
  await expect(page.locator('.day-mark')).toHaveAttribute('dir', 'rtl');

  // Every block of the day is on one page, in order.
  await expect(page.locator('.block')).toHaveCount(3);
  await expect(page.getByText('Review', { exact: true })).toBeVisible();
  await expect(page.getByText('New words')).toBeVisible();
  await expect(page.getByText('Quiz', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Conclude the day' }),
  ).toBeVisible();

  // Nothing is scheduled yet, so only the new words are open for business.
  await expect(page.getByText('nothing due')).toBeVisible();
  await expect(page.getByText(/10 waiting/)).toBeVisible();
});

test('a new-word session can be done with the keyboard alone', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: /New words/ }).click();

  await expect(page.locator('.study')).toHaveText('و');
  await expect(page.getByText('10 left')).toBeVisible();

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
  await page.goto('/#new');
  const word = page.locator('.study');
  await wordSettled(page);

  const before = await word.boundingBox();
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect(page.getByText('and')).toBeVisible();
  expect((await word.boundingBox())?.y).toBe(before?.y);
});

test('tapping the card anywhere reveals the answer', async ({ page }) => {
  // A thumb should not have to find a button. The button still exists — it is
  // the keyboard and screen-reader path — so this is a second, larger target
  // for the same action, not a replacement.
  await page.goto('/#new');
  await page.locator('.card').click();
  await expect(page.getByText('and')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Good/ })).toBeVisible();
});

test('finishing a block ticks it, and the day survives a reload', async ({
  page,
}) => {
  await page.goto('/#new');
  for (let i = 0; i < 10; i++) {
    await page.locator('.card').click();
    await page.getByRole('button', { name: /^Good/ }).click();
  }
  await expect(page.getByText('All met.')).toBeVisible();

  await page.goto('/');
  // The block ticked itself rather than waiting to be told.
  await expect(
    page.getByRole('button', { name: 'Mark New words done' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('all met today')).toBeVisible();

  await page.getByRole('button', { name: 'Conclude the day' }).click();
  await page.reload();
  await expect(page.getByText('Day concluded')).toBeVisible();
  await expect(page.getByText(/1 day running/)).toBeVisible();
});

test('a block can be ticked and unticked by hand', async ({ page }) => {
  await page.goto('/');
  const tick = page.getByRole('button', { name: 'Mark Review done' });
  await expect(tick).toHaveAttribute('aria-pressed', 'false');
  await tick.click();
  await expect(tick).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Mark Review done' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Mark Review done' }).click();
  await expect(
    page.getByRole('button', { name: 'Mark Review done' }),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('a corrected gloss replaces the hand-written one', async ({ page }) => {
  await page.goto('/#new');
  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: 'Edit gloss' }).click();
  await page.getByLabel('Gloss').fill('and (wāw)');
  await page.getByLabel('Gloss').press('Enter');

  // The correction outlives the session, not just the card.
  await page.reload();
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect(page.getByText('and (wāw)')).toBeVisible();
});

test('the whole state can be exported from settings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByText('Words met')).toBeVisible();

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
  await expect(page.locator('.day-mark')).toHaveText('إِتْقَان');
  await page.getByRole('link', { name: /New words/ }).click();
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
