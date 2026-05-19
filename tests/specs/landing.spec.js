import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carga y muestra el título principal', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RAdAR/i);
  });

  test('botón de login a Spotify visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.p-btn-spotify')).toBeVisible();
  });

  test('botón de login a Last.fm visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.p-btn-lastfm')).toBeVisible();
  });
});
