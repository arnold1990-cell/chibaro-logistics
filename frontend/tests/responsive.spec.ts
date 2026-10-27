import { test, expect } from '@playwright/test';

test('responsive widths, reachable mobile navigation and forms', async ({ page }) => {
  for (const width of [320, 360, 390, 430, 600, 768, 820, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `homepage at ${width}`).toBe(true);
    if (width <= 800) {
      const menu = page.getByRole('button', { name: 'Open navigation menu' });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
      await menu.click();
      await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
      await expect(page).toHaveURL(/contact$/);
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByLabel('Phone number')).toHaveAttribute('type', 'tel');
      await expect(page.getByLabel('Phone number')).toHaveCSS('font-size', '16px');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `contact at ${width}`).toBe(true);
      await page.getByRole('navigation', { name: 'Quick actions' }).getByRole('link', { name: 'Request a Quote' }).click();
      await expect(page).toHaveURL(/request-quote$/);
      await expect(page.getByLabel('Full name')).toHaveAttribute('autocomplete', 'name');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `quote at ${width}`).toBe(true);
    } else {
      await expect(page.getByRole('navigation', { name: 'Quick actions' })).toBeHidden();
      await expect(page.locator('.nav-cta')).toBeVisible();
    }
  }
});

test('touch menu and form submission UI with mocked API', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.route('**/api/v1/auth/csrf', route => route.fulfill({ json: { headerName: 'X-CSRF-TOKEN', token: 'test-token' } }));
  await page.route('**/api/v1/contact', async route => {
    expect(route.request().postDataJSON()).toMatchObject({ fullName: 'Mobile Test', phone: '+263770001234', consent: true });
    await route.fulfill({ json: { message: 'Enquiry received for testing.' } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).tap();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).tap();
  await page.getByLabel('Full name').fill('Mobile Test');
  await page.getByLabel('Phone number').fill('+263770001234');
  await page.getByLabel('How can we help?').fill('Please review my furniture transport enquiry.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).tap();
  await expect(page.getByRole('status')).toHaveText('Enquiry received for testing.');
  await page.goto('/');
  await page.locator('.transport-card .transport-photo').first().tap();
  await expect(page.locator('.transport-card img')).toHaveCount(2);
  await page.getByRole('button', { name: 'Open navigation menu' }).tap();
  await page.screenshot({ path: 'test-results/mobile-menu.png' });
  await page.getByRole('button', { name: 'Close navigation', exact: true }).tap({ position: { x: 10, y: 10 } });
  await page.evaluate(() => { window.scrollTo(0, 0); (document.activeElement as HTMLElement)?.blur(); });
  await page.screenshot({ path: 'test-results/mobile-app-home.png' });
  await context.close();
});
