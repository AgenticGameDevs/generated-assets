import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
test('starter packs expose both travellers and rig/action search', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.starter-pack')).toHaveCount(4);
  await page.getByRole('button', { name: 'Characters', exact: true }).click();
  await expect(page.locator('.card')).toHaveCount(5);
  await page.getByRole('searchbox').fill('traveller rigged walking');
  await expect(page.locator('.card h3')).toContainText(['Traveller 1', 'Traveller 2']);
  await page.getByRole('button', { name: 'Preview Traveller 1', exact: true }).last().click();
  await expect(page.locator('#detail-name')).toHaveText('Traveller 1');
  await expect(page.locator('#related a')).toHaveCount(14);
  expect(errors).toEqual([]);
});
test('selection persists, share link restores it, ZIP includes verified files and credits', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.starter-pack').first().getByRole('button', { name: 'Select pack' }).click();
  await expect(page.locator('#selection-count')).toContainText('2 selected');
  await page.reload();
  await expect(page.locator('#selection-count')).toContainText('2 selected');
  await page.getByRole('button', { name: 'Copy share link' }).click();
  const url = await page.locator('#share-link').inputValue();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.goto(url);
  await expect(page.locator('.card')).toHaveCount(2);
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download ZIP + credits' }).click();
  const download = await waiting;
  const data = unzipSync(await fs.readFile(await download.path()));
  const lock = JSON.parse(strFromU8(data['assets.lock.json']));
  expect(lock.assets).toHaveLength(2);
  expect(strFromU8(data['CREDITS.txt'])).toContain('Traveller 2');
  const crypto = await import('node:crypto');
  for (const a of lock.assets) {
    expect(data[a.file].length).toBe(a.bytes);
    expect(crypto.createHash('sha256').update(data[a.file]).digest('hex')).toBe(a.sha256);
  }
});
test('character preview supports clips, pause, scrub, speed and skeleton', async ({ page }) => {
  await page.goto('/viewer.html?asset=assets/fjordfall/models/traveller.glb');
  await page.waitForFunction(() => window.previewReady || window.previewError);
  expect(await page.evaluate(() => window.previewError)).toBeUndefined();
  await expect(page.getByLabel('Animation clip').locator('option')).toHaveCount(9);
  await page.getByLabel('Animation clip').selectOption('Fjordfall_Walk');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
  await page.getByLabel('Playback speed').selectOption('0.5');
  await page.getByLabel('Animation time').fill('0.2');
  await page.getByRole('button', { name: 'Show skeleton' }).click();
  await expect(page.getByRole('button', { name: 'Hide skeleton' })).toBeVisible();
});
test('mesh-free rig and animation load, and motion preferences are respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const file of ['rigs/humanoid-24', 'animations/walk']) {
    await page.goto(`/viewer.html?asset=assets/fjordfall/${file}.glb`);
    await page.waitForFunction(() => window.previewReady || window.previewError);
    expect(await page.evaluate(() => window.previewError)).toBeUndefined();
    await expect(page.getByRole('button', { name: 'Hide skeleton' })).toBeVisible();
  }
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
});
test('mobile gallery, shared selection, detail and docs have no horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of [
    '/?pick=fjordfall/models/traveller&selection=1',
    '/?asset=fjordfall/models/female-rider',
    '/guide.html',
    '/catalog-api.html',
  ]) {
    await page.goto(url);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
test('runnable Three.js example creates independently controlled skinned instances', async ({
  page,
}) => {
  await page.goto('/examples/three-character.html');
  await page.waitForFunction(() => window.exampleReady || window.exampleError);
  expect(await page.evaluate(() => window.exampleError)).toBeUndefined();
  await expect(page.getByLabel('Left animation').locator('option')).toHaveCount(9);
  await page.getByLabel('Left animation').selectOption('Fjordfall_Jog');
  await expect(page.getByLabel('Right animation')).toHaveValue('Fjordfall_Walk');
});
