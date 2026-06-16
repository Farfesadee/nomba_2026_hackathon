const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

(async () => {
  console.log('Starting verification of GuestsTabContent and InvitesTabContent...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    // Navigate to event details page
    console.log('📄 Opening event details page...');
    await page.goto('http://localhost:3000/dashboard/events/1', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(2000);

    // Take screenshot of initial page (Overview tab)
    await page.screenshot({
      path: path.join(screenshotDir, '01-overview-tab.png'),
      fullPage: true
    });
    console.log('✓ Captured Overview tab\n');

    // Click on Guests tab
    console.log('👥 Clicking Guests tab...');
    const guestsTab = await page.$('button:has-text("Guests"), a:has-text("Guests"), [role="tab"]:has-text("Guests")');

    if (guestsTab) {
      await guestsTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotDir, '02-guests-tab.png'),
        fullPage: true
      });
      console.log('✓ Captured Guests tab');

      // Scroll down to see more content
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotDir, '02b-guests-tab-scrolled.png'),
        fullPage: true
      });
      console.log('✓ Captured Guests tab (scrolled)\n');
    } else {
      console.log('⚠ Guests tab not found\n');
    }

    // Click on Invites/Send Invites tab
    console.log('📨 Clicking Send Invites tab...');
    const invitesTab = await page.$('button:has-text("Send Invites"), button:has-text("Invites"), [role="tab"]:has-text("Send Invites")');

    if (invitesTab) {
      await invitesTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotDir, '03-invites-tab.png'),
        fullPage: true
      });
      console.log('✓ Captured Invites tab');

      // Scroll down to see more content
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotDir, '03b-invites-tab-scrolled.png'),
        fullPage: true
      });
      console.log('✓ Captured Invites tab (scrolled)\n');
    } else {
      console.log('⚠ Invites tab not found\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📁 Screenshots saved to: ${screenshotDir}`);
    console.log('\n📋 Files captured:');
    console.log('  • 01-overview-tab.png - Overview tab (default state)');
    console.log('  • 02-guests-tab.png - Guests tab');
    console.log('  • 02b-guests-tab-scrolled.png - Guests tab (scrolled)');
    console.log('  • 03-invites-tab.png - Invites/Send Invites tab');
    console.log('  • 03b-invites-tab-scrolled.png - Invites tab (scrolled)');
    console.log('\n✨ Check screenshots to verify:');
    console.log('  ✓ Professional styling with slate colors');
    console.log('  ✓ Proper icons from lucide-react');
    console.log('  ✓ Clean layout and spacing');
    console.log('  ✓ Form inputs with focus states');
    console.log('  ✓ Guest cards with badges');
    console.log('  ✓ Alert boxes for warnings/info');
    console.log('  ✓ Action buttons with proper states');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Dev server is running on http://localhost:3000');
    console.error('  2. Event with ID 1 exists');
    console.error('  3. You are logged in');
  } finally {
    await browser.close();
  }
})();
