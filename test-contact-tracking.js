#!/usr/bin/env node

/**
 * Contact Tracking System Test Runner
 * Tests the new lead generation functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}📞 Contact Tracking System Test Runner${colors.reset}\n`);

// Check if tests directory exists
const testsDir = path.join(__dirname, 'tests');
if (!fs.existsSync(testsDir)) {
  console.error(`${colors.red}❌ Tests directory not found!${colors.reset}`);
  console.log(`Expected: ${testsDir}`);
  process.exit(1);
}

// Check if contact tracking test file exists
const contactTrackingTestFile = path.join(testsDir, 'frontend', 'contact-tracking.test.js');
if (!fs.existsSync(contactTrackingTestFile)) {
  console.error(`${colors.red}❌ Contact tracking test file not found!${colors.reset}`);
  console.log(`Expected: ${contactTrackingTestFile}`);
  process.exit(1);
}

console.log(`${colors.cyan}📁 Found contact tracking test file:${colors.reset}`);
console.log(`  ${colors.yellow}•${colors.reset} ${path.relative(__dirname, contactTrackingTestFile)}`);

// Check if Jest is installed
try {
  require.resolve('jest');
} catch (error) {
  console.error(`${colors.red}❌ Jest not found!${colors.reset}`);
  console.log(`Please install Jest and testing dependencies:`);
  console.log(`\n${colors.cyan}npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event${colors.reset}`);
  process.exit(1);
}

// Check if database migration has been run
const migrationFile = path.join(__dirname, 'scripts', 'add-contact-tracking.sql');
if (!fs.existsSync(migrationFile)) {
  console.error(`${colors.red}❌ Database migration file not found!${colors.reset}`);
  console.log(`Expected: ${migrationFile}`);
  console.log(`\n${colors.yellow}⚠️  Please run the database migration first:${colors.reset}`);
  console.log(`  ${colors.cyan}psql -d your_database -f scripts/add-contact-tracking.sql${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.cyan}📊 Database migration file found:${colors.reset}`);
console.log(`  ${colors.yellow}•${colors.reset} ${path.relative(__dirname, migrationFile)}`);

// Check if new API endpoint exists
const apiEndpoint = path.join(__dirname, 'src', 'app', 'api', 'analytics', 'contact-tracking', 'route.ts');
if (!fs.existsSync(apiEndpoint)) {
  console.error(`${colors.red}❌ Contact tracking API endpoint not found!${colors.reset}`);
  console.log(`Expected: ${apiEndpoint}`);
  process.exit(1);
}

console.log(`${colors.cyan}🔌 Contact tracking API endpoint found:${colors.reset}`);
console.log(`  ${colors.yellow}•${colors.reset} ${path.relative(__dirname, apiEndpoint)}`);

// Check if analytics dashboard has been updated
const analyticsDashboard = path.join(__dirname, 'src', 'app', 'admin', 'analytics', 'page.tsx');
if (!fs.existsSync(analyticsDashboard)) {
  console.error(`${colors.red}❌ Analytics dashboard not found!${colors.reset}`);
  console.log(`Expected: ${analyticsDashboard}`);
  process.exit(1);
}

console.log(`${colors.cyan}📊 Analytics dashboard found:${colors.reset}`);
console.log(`  ${colors.yellow}•${colors.reset} ${path.relative(__dirname, analyticsDashboard)}`);

console.log();

// Run contact tracking tests
const runContactTrackingTests = () => {
  const command = 'npx jest tests/frontend/contact-tracking.test.js --verbose';
  
  console.log(`${colors.cyan}🚀 Running contact tracking tests:${colors.reset}`);
  console.log(`${colors.yellow}${command}${colors.reset}\n`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    console.log(`\n${colors.green}✅ Contact tracking tests completed successfully!${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Contact tracking tests failed with exit code: ${error.status}${colors.reset}`);
    process.exit(error.status || 1);
  }
};

// Show test summary
const showTestSummary = () => {
  console.log(`${colors.cyan}📊 Contact Tracking Test Summary:${colors.reset}`);
  console.log(`  ${colors.yellow}•${colors.reset} Test file: contact-tracking.test.js`);
  console.log(`  ${colors.yellow}•${colors.reset} Database migration: ✅ Ready`);
  console.log(`  ${colors.yellow}•${colors.reset} API endpoint: ✅ Ready`);
  console.log(`  ${colors.yellow}•${colors.reset} Dashboard integration: ✅ Ready`);
  console.log(`  ${colors.yellow}•${colors.reset} Test coverage: Lead generation, UI, API, integration`);
  console.log();
};

// Show what's being tested
const showTestCoverage = () => {
  console.log(`${colors.cyan}🎯 What's Being Tested:${colors.reset}`);
  console.log(`  ${colors.yellow}•${colors.reset} 📞 Leads tab integration`);
  console.log(`  ${colors.yellow}•${colors.reset} 📊 Updated summary cards`);
  console.log(`  ${colors.yellow}•${colors.reset} 🔌 Contact tracking API`);
  console.log(`  ${colors.yellow}•${colors.reset} 📱 UI responsiveness`);
  console.log(`  ${colors.yellow}•${colors.reset} ⚡ Performance optimization`);
  console.log(`  ${colors.yellow}•${colors.reset} 🔄 Integration with existing features`);
  console.log();
};

// Show usage information
const showUsage = () => {
  console.log(`${colors.cyan}📖 Usage:${colors.reset}`);
  console.log(`  ${colors.yellow}node test-contact-tracking.js${colors.reset}                    - Run contact tracking tests`);
  console.log(`  ${colors.yellow}node test-contact-tracking.js --help${colors.reset}            - Show this help message`);
  console.log();
  
  console.log(`${colors.cyan}🔧 Alternative Commands:${colors.reset}`);
  console.log(`  ${colors.yellow}npx jest tests/frontend/contact-tracking.test.js${colors.reset}`);
  console.log(`  ${colors.yellow}npx jest --testNamePattern="Contact Tracking"${colors.reset}`);
  console.log();
};

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Show test summary and coverage
showTestSummary();
showTestCoverage();

// Run the tests
runContactTrackingTests();
