// Playwright Browser Test - Uses globally installed Playwright
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

async function testBrowser(browserType, browserName) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing ${browserName}...`);
  console.log('='.repeat(50));
  
  let browser;
  try {
    console.log(`Launching ${browserName}...`);
    browser = await browserType.launch({ 
      headless: true,
      timeout: 30000 
    });
    console.log(`✓ ${browserName} launched successfully`);
    
    const context = await browser.newContext();
    console.log(`✓ Browser context created`);
    
    const page = await context.newPage();
    console.log(`✓ New page created`);
    
    console.log(`Navigating to https://example.com...`);
    await page.goto('https://example.com', { timeout: 30000, waitUntil: 'domcontentloaded' });
    console.log(`✓ Navigation successful`);
    
    const title = await page.title();
    console.log(`✓ Page title: "${title}"`);
    
    const screenshotPath = path.join(logsDir, `${browserName}-test.png`);
    console.log(`Taking screenshot...`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved to ${screenshotPath}`);
    
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`✓ User Agent: ${userAgent.substring(0, 80)}...`);
    
    await browser.close();
    console.log(`✓ ${browserName} closed`);
    
    return { name: browserName, status: 'PASS', title, screenshot: screenshotPath };
    
  } catch (error) {
    console.error(`✗ ${browserName} test FAILED:`, error.message);
    if (browser) await browser.close().catch(() => {});
    return { name: browserName, status: 'FAIL', error: error.message };
  }
}

(async () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Playwright Browser Functionality Test Suite        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const results = [];
  
  console.log('Testing Chromium...\n');
  results.push(await testBrowser(playwright.chromium, 'Chromium'));
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('\nTesting Firefox...\n');
  results.push(await testBrowser(playwright.firefox, 'Firefox'));
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('\nTesting WebKit...\n');
  results.push(await testBrowser(playwright.webkit, 'WebKit'));
  
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${result.name}: ${result.status}`);
    if (result.status === 'PASS') {
      console.log(`  Title: ${result.title}`);
      console.log(`  Screenshot: ${result.screenshot}`);
    } else {
      console.log(`  Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '-'.repeat(50));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
})();
