#!/usr/bin/env node

/**
 * Frontend Test Runner
 * Runs all frontend tests with comprehensive reporting
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const testConfig = {
  watch: process.argv.includes('--watch'),
  coverage: process.argv.includes('--coverage'),
  verbose: process.argv.includes('--verbose'),
  specific: process.argv.find(arg => arg.startsWith('--test='))?.split('=')[1]
};

console.log(`${colors.bright}${colors.blue}🧪 Frontend Test Runner${colors.reset}\n`);

// Check if tests directory exists
const testsDir = path.join(__dirname, 'tests');
if (!fs.existsSync(testsDir)) {
  console.error(`${colors.red}❌ Tests directory not found!${colors.reset}`);
  console.log(`Expected: ${testsDir}`);
  process.exit(1);
}

// Find all test files
const findTestFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTestFiles(fullPath));
    } else if (item.endsWith('.test.js') || item.endsWith('.test.ts') || item.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
};

const testFiles = findTestFiles(testsDir);

if (testFiles.length === 0) {
  console.error(`${colors.red}❌ No test files found!${colors.reset}`);
  console.log(`Searched in: ${testsDir}`);
  process.exit(1);
}

console.log(`${colors.cyan}📁 Found ${testFiles.length} test files:${colors.reset}`);
testFiles.forEach(file => {
  const relativePath = path.relative(__dirname, file);
  console.log(`  ${colors.yellow}•${colors.reset} ${relativePath}`);
});

console.log();

// Check if Jest is installed
try {
  require.resolve('jest');
} catch (error) {
  console.error(`${colors.red}❌ Jest not found!${colors.reset}`);
  console.log(`Please install Jest and testing dependencies:`);
  console.log(`\n${colors.cyan}npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event${colors.reset}`);
  console.log(`\n${colors.cyan}npm install --save-dev @babel/preset-env @babel/preset-react @babel/preset-typescript${colors.reset}`);
  console.log(`\n${colors.cyan}npm install --save-dev babel-jest @babel/plugin-transform-runtime${colors.reset}`);
  process.exit(1);
}

// Build Jest command
const buildJestCommand = () => {
  let command = 'npx jest';
  
  if (testConfig.watch) {
    command += ' --watch';
  }
  
  if (testConfig.coverage) {
    command += ' --coverage';
  }
  
  if (testConfig.verbose) {
    command += ' --verbose';
  }
  
  if (testConfig.specific) {
    command += ` --testNamePattern="${testConfig.specific}"`;
  }
  
  return command;
};

// Run tests
const runTests = () => {
  const command = buildJestCommand();
  
  console.log(`${colors.cyan}🚀 Running tests with command:${colors.reset}`);
  console.log(`${colors.yellow}${command}${colors.reset}\n`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    console.log(`\n${colors.green}✅ All tests completed successfully!${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Tests failed with exit code: ${error.status}${colors.reset}`);
    process.exit(error.status || 1);
  }
};

// Show test summary
const showTestSummary = () => {
  console.log(`${colors.cyan}📊 Test Summary:${colors.reset}`);
  console.log(`  ${colors.yellow}•${colors.reset} Total test files: ${testFiles.length}`);
  console.log(`  ${colors.yellow}•${colors.reset} Watch mode: ${testConfig.watch ? 'Enabled' : 'Disabled'}`);
  console.log(`  ${colors.yellow}•${colors.reset} Coverage: ${testConfig.coverage ? 'Enabled' : 'Disabled'}`);
  console.log(`  ${colors.yellow}•${colors.reset} Verbose: ${testConfig.verbose ? 'Enabled' : 'Disabled'}`);
  
  if (testConfig.specific) {
    console.log(`  ${colors.yellow}•${colors.reset} Specific test: ${testConfig.specific}`);
  }
  
  console.log();
};

// Show usage information
const showUsage = () => {
  console.log(`${colors.cyan}📖 Usage:${colors.reset}`);
  console.log(`  ${colors.yellow}node run-tests.js${colors.reset}                    - Run all tests once`);
  console.log(`  ${colors.yellow}node run-tests.js --watch${colors.reset}           - Run tests in watch mode`);
  console.log(`  ${colors.yellow}node run-tests.js --coverage${colors.reset}        - Run tests with coverage report`);
  console.log(`  ${colors.yellow}node run-tests.js --verbose${colors.reset}         - Run tests with verbose output`);
  console.log(`  ${colors.yellow}node run-tests.js --test="pattern"${colors.reset}  - Run tests matching pattern`);
  console.log(`  ${colors.yellow}node run-tests.js --help${colors.reset}            - Show this help message`);
  console.log();
  
  console.log(`${colors.cyan}🔧 Examples:${colors.reset}`);
  console.log(`  ${colors.yellow}node run-tests.js --watch --coverage${colors.reset}`);
  console.log(`  ${colors.yellow}node run-tests.js --test="Analytics"${colors.reset}`);
  console.log(`  ${colors.yellow}node run-tests.js --verbose --coverage${colors.reset}`);
  console.log();
};

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Show test summary
showTestSummary();

// Check for package.json scripts
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.test) {
    console.log(`${colors.cyan}💡 Alternative:${colors.reset} You can also run tests using:`);
    console.log(`  ${colors.yellow}npm test${colors.reset}`);
    console.log();
  }
}

// Run the tests
runTests();
