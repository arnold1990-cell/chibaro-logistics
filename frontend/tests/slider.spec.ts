import { test, expect } from '@playwright/test';

test('fleet photographs retain controls, keyboard, swipes and reduced motion', async ({ page }) => {
  await page.goto('/fleet');
  await expect(page).toHaveTitle(/TransChibaro Logistics/);
  const slider = page.getByRole('region', { name: 'Transport photographs' });
  await expect(slider).toBeVisible();
  await expect(slider.locator('img')).toHaveCount(3);
  for (const img of await slider.locator('img').all()) {
    await expect(img).toHaveJSProperty('complete', true);
    expect(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  const selected = (n: number) => slider.getByRole('button', { name: `Show photograph ${n}:`, exact: false });
  await expect(selected(1)).toHaveAttribute('aria-current', 'true');
  await slider.getByRole('button', { name: 'Next photograph', exact: true }).click();
  await expect(selected(2)).toHaveAttribute('aria-current', 'true');
  await selected(3).click();
  await expect(selected(3)).toHaveAttribute('aria-current', 'true');
  await slider.locator('.slider-slide').nth(2).getByRole('button').click();
  await expect(selected(1)).toHaveAttribute('aria-current', 'true');
  await slider.getByRole('button', { name: 'Previous photograph' }).click();
  await expect(selected(3)).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(selected(2)).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('Home');
  await expect(selected(1)).toHaveAttribute('aria-current', 'true');
  const viewport = slider.locator('.slider-viewport');
  await viewport.evaluate((target) => {
    const start = new Touch({ identifier: 1, target, clientX: 250, clientY: 150 });
    const end = new Touch({ identifier: 1, target, clientX: 100, clientY: 155 });
    target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start] }));
    target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [end] }));
  });
  await expect(selected(2)).toHaveAttribute('aria-current', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(slider.locator('.slider-track')).toHaveCSS('transition-duration', '0s');
  await selected(3).click();
  await expect(selected(3)).toHaveAttribute('aria-current', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/fleet-${test.info().project.name}.png`, fullPage: true });
});

test('public routes retain navigation, forms and updated branding', async ({ page }) => {
  for (const route of ['/about', '/services', '/fleet', '/contact', '/request-quote', '/bookings', '/services/removals', '/privacy-policy', '/terms-and-conditions']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/TransChibaro Logistics/);
    await expect(page.getByRole('link', { name: 'TransChibaro Logistics home' })).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(/(?<!Trans)Chibaro Logistics|photograph to be added|awaiting supply/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/bookings');
  await page.getByRole('button', { name: 'Submit booking request' }).click();
  await expect(page.getByText('Enter your full name')).toBeVisible();
  await page.getByLabel('Estimated load weight').fill('3200');
  await expect(page.getByText(/exceeds the truck/)).toBeVisible();
});


test('homepage has three fixed photos, working calls to action and subtle motion', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TransChibaro Logistics/);
  await expect(page.locator('[aria-roledescription="carousel"]')).toHaveCount(0);
  const photos = page.locator('main .transport-photo');
  await expect(photos).toHaveCount(3);
  for (const photo of await photos.all()) {
    await photo.scrollIntoViewIfNeeded();
    const img = photo.locator('img');
    await expect(img).toBeVisible();
    await expect(img).toHaveJSProperty('complete', true);
    expect(await img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const source = await img.getAttribute('src');
    const bounds = await photo.boundingBox();
    await photo.click({ position: { x: bounds!.width / 2, y: bounds!.height * 0.8 } });
    await expect(img).toHaveAttribute('src', source!);
    await expect(img).toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await photos.last().focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => photos.last().evaluate(el => el.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: `test-results/home-${test.info().project.name}.png`, fullPage: true });
  await page.locator('.photo-hero').getByRole('link', { name: 'Request a Quote' }).click();
  await expect(page).toHaveURL(/request-quote$/);
  await expect(page.getByLabel('Full name')).toBeVisible();
  await page.goto('/');
  await page.locator('.photo-hero').getByRole('link', { name: 'Our Services' }).click();
  await expect(page).toHaveURL(/services$/);
  await expect(page.getByRole('heading', { name: 'General Cargo Transport' })).toBeVisible();
});
