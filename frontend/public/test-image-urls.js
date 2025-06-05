/**
 * Test script to verify getImageUrl function is working correctly
 * This can be run in the browser console to test image URL construction
 */

// Test the getImageUrl function
console.log('🧪 Testing getImageUrl function...');

// Test cases
const testCases = [
  'test-image.jpg',
  '/test-image.jpg', // with leading slash
  'uploads/test-image.jpg', // with uploads path
  'Screenshot2025-05-30150431-1748597679849-377515787.png', // real filename
  '',
  null,
  undefined
];

// Import the function (this would be available globally in the app)
// For testing, we'll define it here based on our implementation
const getImageUrl = (filename) => {
  if (!filename) return '';
  
  // Get base URL
  const baseUrl = window.RUNTIME_CONFIG?.BACKEND_URL || 
                  window.RUNTIME_CONFIG?.API_URL?.replace('/api/v2', '') || 
                  window.__RUNTIME_CONFIG__?.BACKEND_URL ||
                  window.__RUNTIME_CONFIG__?.API_URL?.replace('/api/v2', '') ||
                  'https://api.bhavyabazaar.com';
  
  // Clean up the filename (remove leading slash if any)
  const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
  
  // Ensure proper URL construction
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/uploads/${cleanFilename}`;
};

console.log('Runtime Config:', window.RUNTIME_CONFIG || window.__RUNTIME_CONFIG__);
console.log('');

testCases.forEach((testCase, index) => {
  const result = getImageUrl(testCase);
  console.log(`Test ${index + 1}: "${testCase}" → "${result}"`);
});

console.log('');
console.log('✅ All tests completed!');
console.log('Expected pattern: https://api.bhavyabazaar.com/uploads/filename.ext');

// Test a real product image URL that should work
const realImageTest = 'Screenshot2025-05-30150431-1748597679849-377515787.png';
const realImageUrl = getImageUrl(realImageTest);
console.log('');
console.log('🖼️  Real image test:');
console.log(`Filename: ${realImageTest}`);
console.log(`URL: ${realImageUrl}`);

// Create an image element to test loading
const testImg = new Image();
testImg.onload = () => console.log('✅ Image loaded successfully!');
testImg.onerror = () => console.log('❌ Image failed to load (expected if not on server)');
testImg.src = realImageUrl;
