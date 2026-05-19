import { test, expect } from '@playwright/test';

test.describe('App — radarpin.me/app.html', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage para garantizar estado sin sesión
    await page.goto('/app.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  // ── Login screen ──────────────────────────────────────────────
  test('muestra la pantalla de login sin sesión', async ({ page }) => {
    await expect(page.locator('.listen-screen')).toBeVisible();
  });

  test('logo RAdAR visible en la pantalla de login', async ({ page }) => {
    await expect(page.locator('.listen-logo-center')).toBeVisible();
    // innerText adds newlines around <em>, collapse whitespace before asserting
    const text = (await page.locator('.listen-logo-center').innerText()).replace(/\s+/g, '');
    expect(text).toMatch(/radar/i);
  });

  test('botón Spotify visible y con texto correcto', async ({ page }) => {
    const btn = page.locator('#listen-spotify');
    await expect(btn).toBeVisible();
    const text = await btn.innerText();
    expect(text).toMatch(/spotify/i);
  });

  test('botón Last.fm visible y con texto correcto', async ({ page }) => {
    const btn = page.locator('#listen-lastfm');
    await expect(btn).toBeVisible();
    const text = await btn.innerText();
    expect(text).toMatch(/last\.fm/i);
  });

  test('botón "¿cómo funciona?" abre el modal de ayuda', async ({ page }) => {
    await page.locator('#help-btn').click();
    const overlay = page.locator('#help-overlay');
    await expect(overlay).toBeVisible();
    const text = await overlay.innerText();
    expect(text).toMatch(/cómo funciona|how it works/i);
  });

  test('modal de ayuda se cierra al pulsar CERRAR', async ({ page }) => {
    await page.locator('#help-btn').click();
    await expect(page.locator('#help-overlay')).toBeVisible();
    await page.locator('#help-close').click();
    await expect(page.locator('#help-overlay')).not.toHaveClass(/show/);
  });

  // ── OAuth redirect ─────────────────────────────────────────────
  test('clic en Spotify inicia redirect a accounts.spotify.com', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'commit', timeout: 10000 }),
      page.locator('#listen-spotify').click(),
    ]);
    expect(page.url()).toMatch(/spotify\.com|radarpin\.me/);
  });

  test('clic en Last.fm inicia redirect a last.fm o al backend', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'commit', timeout: 10000 }),
      page.locator('#listen-lastfm').click(),
    ]);
    expect(page.url()).toMatch(/last\.fm|radarpin\.me|onrender\.com/);
  });

  // ── PWA / meta ─────────────────────────────────────────────────
  test('manifest.json referenciado en el head', async ({ page }) => {
    const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifest).toBeTruthy();
  });

  test('theme-color configurado', async ({ page }) => {
    const color = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(color).toBeTruthy();
  });

  test('service worker se registra sin errores', async ({ page }) => {
    const swErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('service')) swErrors.push(msg.text());
    });
    await page.waitForTimeout(2000);
    expect(swErrors).toHaveLength(0);
  });
});
