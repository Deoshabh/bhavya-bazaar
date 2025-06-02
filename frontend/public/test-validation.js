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

// Run tests
testPhoneValidation();
testInputFiltering();

console.log("=== Tests completed ===");
console.log("To test the form:");
console.log("1. Fill in shop name, phone number, address, zip code, password");
console.log("2. Upload an avatar image");
console.log("3. Try submitting with invalid phone numbers");
console.log("4. Verify validation messages appear");
