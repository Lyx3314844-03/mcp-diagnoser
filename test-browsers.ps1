# Playwright Browser Functionality Test
# Tests all installed browsers using Playwright CLI

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Playwright Browser Functionality Test Suite        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$results = @()

# Test function
function Test-Browser {
    param(
        [string]$BrowserName,
        [string]$TestFile
    )
    
    Write-Host "`n$('='.Repeat(50))" -ForegroundColor Gray
    Write-Host "Testing $BrowserName..." -ForegroundColor White
    Write-Host $('='.Repeat(50)) -ForegroundColor Gray
    
    $testScript = @"
const { $BrowserName } = require('playwright');

(async () => {
  let browser;
  try {
    console.log("Launching $BrowserName...");
    browser = await $BrowserName.launch({ headless: true, timeout: 30000 });
    console.log("✓ $BrowserName launched successfully");
    
    const context = await browser.newContext();
    console.log("✓ Browser context created");
    
    const page = await context.newPage();
    console.log("✓ New page created");
    
    console.log("Navigating to https://example.com...");
    await page.goto('https://example.com', { timeout: 30000, waitUntil: 'domcontentloaded' });
    console.log("✓ Navigation successful");
    
    const title = await page.title();
    console.log("✓ Page title: `"${title}`"");
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: '$TestFile', fullPage: false });
    console.log("✓ Screenshot saved to $TestFile");
    
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log("✓ User Agent: " + userAgent.substring(0, 80) + "...");
    
    await browser.close();
    console.log("✓ $BrowserName closed");
    
    console.log("RESULT:PASS:" + title);
  } catch (error) {
    console.error("✗ Test FAILED:", error.message);
    if (browser) await browser.close().catch(() => {});
    console.log("RESULT:FAIL:" + error.message);
  }
})();
"@
    
    $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
    Set-Content -Path $tempFile -Value $testScript -Encoding UTF8
    
    $output = & npx playwright test $tempFile 2>&1 | Out-String
    Remove-Item $tempFile -Force
    
    if ($output -match "RESULT:(PASS|FAIL):(.+)") {
        $status = $matches[1]
        $data = $matches[2]
        
        if ($status -eq "PASS") {
            Write-Host "✓ $BrowserName : PASS" -ForegroundColor Green
            Write-Host "  Title: $data" -ForegroundColor Gray
            return @{ Name = $BrowserName; Status = "PASS"; Title = $data }
        } else {
            Write-Host "✗ $BrowserName : FAIL" -ForegroundColor Red
            Write-Host "  Error: $data" -ForegroundColor Gray
            return @{ Name = $BrowserName; Status = "FAIL"; Error = $data }
        }
    } else {
        Write-Host "✗ $BrowserName : UNKNOWN" -ForegroundColor Yellow
        Write-Host $output -ForegroundColor Gray
        return @{ Name = $BrowserName; Status = "UNKNOWN" }
    }
}

# Ensure logs directory exists
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Run tests
$chromiumResult = Test-Browser -BrowserName "chromium" -TestFile "logs/chromium-test.png"
Start-Sleep -Seconds 1

$firefoxResult = Test-Browser -BrowserName "firefox" -TestFile "logs/firefox-test.png"
Start-Sleep -Seconds 1

$webkitResult = Test-Browser -BrowserName "webkit" -TestFile "logs/webkit-test.png"

$results = @($chromiumResult, $firefoxResult, $webkitResult)

# Print summary
Write-Host "`n$('='.Repeat(50))" -ForegroundColor Gray
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host $('='.Repeat(50)) -ForegroundColor Gray

$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$unknown = ($results | Where-Object { $_.Status -eq "UNKNOWN" }).Count

foreach ($result in $results) {
    if ($result.Status -eq "PASS") {
        Write-Host "✓ $($result.Name): $($result.Status)" -ForegroundColor Green
        Write-Host "  Title: $($result.Title)" -ForegroundColor Gray
    } elseif ($result.Status -eq "FAIL") {
        Write-Host "✗ $($result.Name): $($result.Status)" -ForegroundColor Red
        Write-Host "  Error: $($result.Error)" -ForegroundColor Gray
    } else {
        Write-Host "? $($result.Name): $($result.Status)" -ForegroundColor Yellow
    }
}

Write-Host "`n$('='.Repeat(50))" -ForegroundColor Gray
Write-Host "Total: $($results.Count) | Passed: $passed | Failed: $failed | Unknown: $unknown" -ForegroundColor Cyan
Write-Host $('='.Repeat(50)) -ForegroundColor Gray

if ($failed -gt 0) {
    exit 1
}
