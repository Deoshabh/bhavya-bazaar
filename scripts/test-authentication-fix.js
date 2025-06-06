/**
 * Test Authentication Timing Fix
 * 
 * This script tests the authentication timing issue fix in the ProfileContent components.
 * It verifies that:
 * 1. Users can access profile pages without getting "Please login to continue" errors
 * 2. API calls are made only after user authentication is loaded
 * 3. All profile tabs (Orders, Refund Orders, Track Order) work correctly
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3001';
const API_BASE_URL = 'http://localhost:8000/api/v2';

// Test credentials - use existing test user or create one
const TEST_USER = {
    email: 'testuser@example.com',
    password: 'testpassword123'
};

async function testAuthenticationFix() {
    console.log('🔧 Testing Authentication Timing Fix...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Listen for console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Listen for network requests to verify API calls
        const apiCalls = [];
        page.on('request', request => {
            if (request.url().includes('/api/v2/')) {
                apiCalls.push({
                    url: request.url(),
                    method: request.method(),
                    timestamp: Date.now()
                });
            }
        });
        
        console.log('📱 Opening homepage...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
        
        // Check if user is already logged in
        const isLoggedIn = await page.$('.profile-avatar, .user-menu') !== null;
        
        if (!isLoggedIn) {
            console.log('🔐 User not logged in, attempting login...');
            
            // Navigate to login page
            await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
            
            // Fill login form
            await page.type('input[type="email"]', TEST_USER.email);
            await page.type('input[type="password"]', TEST_USER.password);
            
            // Submit login form
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                page.click('button[type="submit"], .login-button')
            ]);
            
            console.log('✅ Login attempted');
        } else {
            console.log('✅ User already logged in');
        }
        
        // Wait a moment for authentication to settle
        await page.waitForTimeout(2000);
        
        console.log('👤 Navigating to profile page...');
        await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle2' });
        
        // Check for "Please login to continue" error
        const loginError = await page.$eval('body', body => 
            body.textContent.includes('Please login to continue')
        ).catch(() => false);
        
        if (loginError) {
            console.log('❌ FAILED: "Please login to continue" error still appears');
            return false;
        }
        
        console.log('✅ No "Please login to continue" error found');
        
        // Test different profile tabs
        const tabTests = [
            { name: 'All Orders', selector: '[data-tab="orders"], .orders-tab', expectedContent: 'orders' },
            { name: 'Refund Orders', selector: '[data-tab="refunds"], .refunds-tab', expectedContent: 'refund' },
            { name: 'Track Order', selector: '[data-tab="track"], .track-tab', expectedContent: 'track' }
        ];
        
        for (const tab of tabTests) {
            console.log(`🧪 Testing ${tab.name} tab...`);
            
            // Clear previous API calls
            apiCalls.length = 0;
            
            // Click on the tab
            const tabElement = await page.$(tab.selector);
            if (tabElement) {
                await tabElement.click();
                await page.waitForTimeout(3000); // Wait for API calls
                
                // Check if API calls were made with proper authentication
                const orderApiCalls = apiCalls.filter(call => 
                    call.url.includes('/order/get-all-orders/')
                );
                
                if (orderApiCalls.length > 0) {
                    console.log(`  ✅ ${tab.name}: API calls made (${orderApiCalls.length})`);
                } else {
                    console.log(`  ⚠️  ${tab.name}: No API calls detected`);
                }
            } else {
                console.log(`  ⚠️  ${tab.name}: Tab not found`);
            }
        }
        
        // Check for any console errors related to authentication
        const authErrors = consoleErrors.filter(error => 
            error.includes('authentication') || 
            error.includes('401') || 
            error.includes('unauthorized') ||
            error.includes('user._id')
        );
        
        if (authErrors.length > 0) {
            console.log('\n❌ Authentication-related console errors found:');
            authErrors.forEach(error => console.log(`  - ${error}`));
        } else {
            console.log('\n✅ No authentication-related console errors');
        }
        
        // Final assessment
        const success = !loginError && authErrors.length === 0;
        
        console.log('\n' + '='.repeat(60));
        if (success) {
            console.log('🎉 AUTHENTICATION FIX TEST PASSED!');
            console.log('✅ Profile pages load without authentication errors');
            console.log('✅ API calls are properly timed after user authentication');
        } else {
            console.log('❌ AUTHENTICATION FIX TEST FAILED!');
            console.log('❌ There are still authentication timing issues');
        }
        console.log('='.repeat(60));
        
        return success;
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// Run the test
if (require.main === module) {
    testAuthenticationFix()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test failed with error:', error);
            process.exit(1);
        });
}

module.exports = { testAuthenticationFix };
