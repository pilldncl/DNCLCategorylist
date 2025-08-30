// Test Email Functionality
// This script tests the email configuration and functionality

const { CONTACT_CONFIG } = require('./src/config/contact.ts');

console.log('🧪 Testing Email Functionality');
console.log('==============================');

// Test 1: Check email configuration
console.log('\n1️⃣ Email Configuration:');
console.log(`   Email: ${CONTACT_CONFIG.contact.email}`);
console.log(`   Expected: info@dncltechzone.com`);
console.log(`   Status: ${CONTACT_CONFIG.contact.email === 'info@dncltechzone.com' ? '✅ Correct' : '❌ Incorrect'}`);

// Test 2: Check website configuration
console.log('\n2️⃣ Website Configuration:');
console.log(`   Website: ${CONTACT_CONFIG.contact.website}`);
console.log(`   Expected: https://dncltechzone.com`);
console.log(`   Status: ${CONTACT_CONFIG.contact.website === 'https://dncltechzone.com' ? '✅ Correct' : '❌ Incorrect'}`);

// Test 3: Test mailto URL generation
console.log('\n3️⃣ Mailto URL Test:');
const testSubject = 'Test Inquiry';
const testBody = 'This is a test email body';
const mailtoUrl = `mailto:${CONTACT_CONFIG.contact.email}?subject=${encodeURIComponent(testSubject)}&body=${encodeURIComponent(testBody)}`;
console.log(`   Mailto URL: ${mailtoUrl}`);
console.log(`   Status: ✅ Generated successfully`);

// Test 4: Check social media links
console.log('\n4️⃣ Social Media Links:');
console.log(`   Facebook: ${CONTACT_CONFIG.social.facebook}`);
console.log(`   Instagram: ${CONTACT_CONFIG.social.instagram}`);
console.log(`   Twitter: ${CONTACT_CONFIG.social.twitter}`);
console.log(`   LinkedIn: ${CONTACT_CONFIG.social.linkedin}`);

// Test 5: Verify no hyphenated references remain
console.log('\n5️⃣ Checking for old hyphenated references:');
const configString = JSON.stringify(CONTACT_CONFIG, null, 2);
const hasHyphenated = configString.includes('dncl-techzone');
console.log(`   Contains old hyphenated references: ${hasHyphenated ? '❌ Yes' : '✅ No'}`);

console.log('\n🎉 Email functionality test completed!');
console.log('\n📧 To test the actual email functionality:');
console.log('   1. Start the development server: npm run dev');
console.log('   2. Open the catalog page');
console.log('   3. Click on any product row to expand it');
console.log('   4. Click the "Email Inquiry" button');
console.log('   5. Verify that your email client opens with info@dncltechzone.com');
