import { test, expect } from '@playwright/test';

test.describe('Landing page — radarpin.me', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('título correcto', async ({ page }) => {
    await expect(page).toHaveTitle(/RAdAR/i);
  });

  test('meta description presente', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc.length).toBeGreaterThan(20);
  });

  test('og:image apunta a og-image.png', async ({ page }) => {
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('og-image.png');
  });

  test('botones de Spotify y Last.fm visibles', async ({ page }) => {
    await expect(page.locator('.p-btn-spotify')).toBeVisible();
    await expect(page.locator('.p-btn-lastfm')).toBeVisible();
  });

  test('sección hero contiene texto principal', async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/spotify|last\.fm/i);
  });

  test('no hay errores de consola críticos', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.reload();
    await page.waitForLoadState('networkidle');
    const critical = errors.filter(e => !e.includes('favicon'));
    expect(critical).toHaveLength(0);
  });
});
