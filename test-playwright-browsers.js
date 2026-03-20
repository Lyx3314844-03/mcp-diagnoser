/**
 * Playwright Browser Functionality Test
 * Tests all installed browsers (Chromium, Firefox, WebKit)
 */

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
    
    // Test navigation
    console.log(`Navigating to https://example.com...`);
    await page.goto('https://example.com', { timeout: 30000, waitUntil: 'domcontentloaded' });
    console.log(`✓ Navigation successful`);
    
    // Get page title
    const title = await page.title();
    console.log(`✓ Page title: "${title}"`);
    
    // Test screenshot
    console.log(`Taking screenshot...`);
    await page.screenshot({ 
      path: `./logs/${browserName}-test.png`,
      fullPage: false 
    });
    console.log(`✓ Screenshot saved to logs/${browserName}-test.png`);
    
    // Test JavaScript execution
    console.log(`Executing JavaScript...`);
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`✓ User Agent: ${userAgent.substring(0, 80)}...`);
    
    // Get page content
    const content = await page.content();
    console.log(`✓ Page content length: ${content.length} characters`);
    
    await browser.close();
    console.log(`✓ ${browserName} closed`);
    
    return { 
      name: browserName, 
      status: 'PASS', 
      title,
      screenshot: `./logs/${browserName}-test.png` 
    };
    
  } catch (error) {
    console.error(`✗ ${browserName} test FAILED:`, error.message);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return { 
      name: browserName, 
      status: 'FAIL', 
      error: error.message 
    };
  }
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Playwright Browser Functionality Test Suite        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  // Dynamic import playwright
  const playwright = await import('playwright');
  const { chromium, firefox, webkit } = playwright;
  
  const results = [];
  
  // Test Chromium
  results.push(await testBrowser(chromium, 'Chromium'));
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test Firefox
  results.push(await testBrowser(firefox, 'Firefox'));
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test WebKit
  results.push(await testBrowser(webkit, 'WebKit'));
  
  // Print summary
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
  
  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
