#!/usr/bin/env node

/**
 * Post-installation script for MCP Diagnoser
 * Runs after npm install completes
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const platform = os.platform();
const isRoot = process.getuid && process.getuid() === 0;

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║     MCP Diagnoser - Post-Installation Check             ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Check Node.js version
const nodeVersion = process.version;
const minVersion = 'v18.0.0';

console.log(`✓ Node.js version: ${nodeVersion}`);
console.log(`✓ Platform: ${platform}`);
console.log(`✓ Architecture: ${os.arch()}`);

if (isRoot) {
    console.log('\n⚠ Warning: Running as root. Consider using a regular user account.\n');
}

// Check if build is needed
const distPath = path.join(__dirname, '..', 'dist', 'index.js');
if (!fs.existsSync(distPath)) {
    console.log('\n📦 Build output not found. Building...\n');
    try {
        execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log('\n✓ Build completed\n');
    } catch (error) {
        console.error('\n✗ Build failed. Please run: npm run build\n');
        process.exit(1);
    }
} else {
    console.log('\n✓ Build output found\n');
}

// Platform-specific checks
if (platform === 'linux') {
    console.log('🐧 Linux detected\n');
    console.log('Installation options:');
    console.log('  1. Global install: npm install -g .');
    console.log('  2. Use script: bash scripts/install.sh');
    console.log('  3. Run directly: npm start\n');
} else if (platform === 'darwin') {
    console.log('🍎 macOS detected\n');
    console.log('Installation options:');
    console.log('  1. Global install: npm install -g .');
    console.log('  2. Use script: bash scripts/install.sh');
    console.log('  3. Run directly: npm start\n');
} else if (platform === 'win32') {
    console.log('🪟 Windows detected\n');
    console.log('Installation options:');
    console.log('  1. Global install: npm install -g .');
    console.log('  2. Run directly: npm start\n');
}

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║              Post-Installation Complete                  ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

console.log('Next steps:');
console.log('  mcp-diagnoser --help     # Show all commands');
console.log('  mcp-diagnoser check      # Run diagnosis');
console.log('  mcp-diagnoser packages   # Check packages\n');
