const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    // Visit reference site
    console.log('Capturing reference site: wristbandsng.com...');
    await page.goto('https://alex-and-alyssa.wristbandsng.com/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Try to find login form
    const loginInput = await page.$('input[type="password"], input[type="email"], input[name*="pass"], input[name*="email"]');
    if (loginInput) {
      console.log('Found login form, attempting to login...');
      const passwordInputs = await page.$$('input[type="password"]');
      if (passwordInputs.length > 0) {
        await passwordInputs[0].fill('alexalyssa2026');
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: path.join(screenshotDir, '1-reference-admin.png'), fullPage: true });
    console.log('✓ Captured reference site');

    // Visit accredit.vip
    console.log('Capturing accredit.vip...');
    await page.goto('https://accredit.vip/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Login to accredit.vip
    const emailInputs = await page.$$('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]');
    const passwordInputs = await page.$$('input[type="password"]');

    if (emailInputs.length > 0 && passwordInputs.length > 0) {
      console.log('Found login form, logging in...');
      await emailInputs[0].fill('alex.bday@sora.com');
      await passwordInputs[0].fill('AlexBday2026@');

      // Find and click login button
      const loginBtn = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      if (loginBtn) {
        await loginBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }

      await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: path.join(screenshotDir, '2-accredit-dashboard.png'), fullPage: true });
    console.log('✓ Captured accredit.vip dashboard');

    // Try to navigate to guest management
    const guestLink = await page.$('a:has-text("Guest"), a:has-text("guest"), a[href*="guest"]');
    if (guestLink) {
      await guestLink.click();
      await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotDir, '3-accredit-guests.png'), fullPage: true });
      console.log('✓ Captured accredit.vip guest management');
    }

    console.log(`\nScreenshots saved to: ${screenshotDir}`);
    console.log('Review the PNG files to compare the interfaces');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
