// Test script to verify shop creation endpoint functionality
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'https://api.bhavyabazaar.com/api/v2';
const SHOP_CREATE_URL = `${API_BASE_URL}/shop/create-shop`;

console.log('🔍 Testing Shop Creation Endpoint...');
console.log('API URL:', SHOP_CREATE_URL);

// Test data
const testShopData = {
  name: 'Test Shop ' + Date.now(),
  phoneNumber: '9876543210',
  password: 'testpass123',
  address: 'Test Address, Test City',
  zipCode: '123456'
};

async function testShopCreation() {
  try {
    console.log('\n1. Testing basic endpoint connectivity...');
    
    // First, test if the endpoint exists with a simple GET request
    try {
      const response = await axios.get(`${API_BASE_URL}/shop/admin-all-sellers`, {
        timeout: 10000
      });
      console.log('✅ Backend is reachable - Shop endpoints exist');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Backend is reachable - Shop endpoints exist (401 expected for admin route)');
      } else {
        console.log('❌ Backend connectivity issue:', error.message);
        return;
      }
    }

    console.log('\n2. Testing shop creation with form data...');

    // Create form data
    const formData = new FormData();
    formData.append('name', testShopData.name);
    formData.append('phoneNumber', testShopData.phoneNumber);
    formData.append('password', testShopData.password);
    formData.append('address', testShopData.address);
    formData.append('zipCode', testShopData.zipCode);

    // Create a dummy image file for testing
    const dummyImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(dummyImagePath)) {
      // Create a minimal test image buffer
      const testImageBuffer = Buffer.from('dummy image data');
      fs.writeFileSync(dummyImagePath, testImageBuffer);
    }
    
    formData.append('file', fs.createReadStream(dummyImagePath), {
      filename: 'test-shop-logo.jpg',
      contentType: 'image/jpeg'
    });

    // Make the request
    const response = await axios.post(SHOP_CREATE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000,
      maxRedirects: 5
    });

    console.log('✅ Shop creation successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Shop creation failed:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.message);
      console.log('Request details:', {
        method: error.config?.method,
        url: error.config?.url,
        timeout: error.config?.timeout
      });
    } else {
      console.log('Request setup error:', error.message);
    }
  }

  // Cleanup
  const dummyImagePath = path.join(__dirname, 'test-image.jpg');
  if (fs.existsSync(dummyImagePath)) {
    fs.unlinkSync(dummyImagePath);
  }
}

console.log('\n📝 Test Shop Data:');
console.log(JSON.stringify(testShopData, null, 2));
console.log('\n🚀 Starting test...\n');

testShopCreation().then(() => {
  console.log('\n✅ Test completed.');
}).catch((error) => {
  console.error('\n❌ Test failed with error:', error.message);
});
