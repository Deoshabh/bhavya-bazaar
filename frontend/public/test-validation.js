// Test script to validate shop registration fixes
// Run this in browser console to test phone number validation

console.log("=== Bhavya Bazaar Shop Registration Validation Tests ===");

// Test phone number validation function
function testPhoneValidation() {
    const validPhone = "9876543210";
    const invalidPhone1 = "98765432"; // too short
    const invalidPhone2 = "987654321012"; // too long
    const invalidPhone3 = "98765abcd0"; // contains letters
    
    const phoneRegex = /^\d{10}$/;
    
    console.log("Phone validation tests:");
    console.log(`Valid phone (${validPhone}):`, phoneRegex.test(validPhone)); // Should be true
    console.log(`Invalid phone - short (${invalidPhone1}):`, phoneRegex.test(invalidPhone1)); // Should be false
    console.log(`Invalid phone - long (${invalidPhone2}):`, phoneRegex.test(invalidPhone2)); // Should be false
    console.log(`Invalid phone - letters (${invalidPhone3}):`, phoneRegex.test(invalidPhone3)); // Should be false
}

// Test input filtering function
function testInputFiltering() {
    const testInputs = [
        "123abc456",
        "98-76-54-32-10",
        "+91-9876543210",
        "9876543210",
        "abc123def456"
    ];
    
    console.log("Input filtering tests:");
    testInputs.forEach(input => {
        const filtered = input.replace(/\D/g, '');
        console.log(`Input: "${input}" -> Filtered: "${filtered}"`);
    });
}

// New tests for WebSocket and API configurations
function testRuntimeConfig() {
    console.log("\n=== Runtime Configuration Tests ===");
    
    // Test 1: Check if runtime config is loaded
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG) {
        console.log('✅ Runtime config loaded:', window.RUNTIME_CONFIG);
    } else {
        console.log('❌ Runtime config not found');
    }

    // Test 2: Check environment variables fallback
    const API_URL = window.RUNTIME_CONFIG?.API_URL || process.env.REACT_APP_API_URL;
    const WS_URL = window.RUNTIME_CONFIG?.SOCKET_URL || process.env.REACT_APP_WS_URL;

    console.log('🔗 API URL:', API_URL);
    console.log('🛰️  WebSocket URL:', WS_URL);

    // Test 3: Test WebSocket connection (if in browser)
    if (typeof WebSocket !== 'undefined' && WS_URL) {
        console.log('🧪 Testing WebSocket connection...');
        const testSocket = new WebSocket(WS_URL);
        
        testSocket.onopen = () => {
            console.log('✅ WebSocket test connection successful');
            testSocket.close();
        };
        
        testSocket.onerror = (error) => {
            console.log('❌ WebSocket test connection failed:', error);
        };
        
        testSocket.onclose = () => {
            console.log('🔌 WebSocket test connection closed');
        };
    } else {
        console.log('⚠️  WebSocket test skipped (not in browser environment)');
    }
}

// Run tests
testPhoneValidation();
testInputFiltering();
testRuntimeConfig();

console.log("=== Tests completed ===");
console.log("To test the form:");
console.log("1. Fill in shop name, phone number, address, zip code, password");
console.log("2. Upload an avatar image");
console.log("3. Try submitting with invalid phone numbers");
console.log("4. Verify validation messages appear");
