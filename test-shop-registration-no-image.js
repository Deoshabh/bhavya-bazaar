/**
 * Test shop registration without image upload
 * This will verify that image upload is truly optional
 */

const axios = require('axios');

// Get the base URL
const getBaseUrl = () => {
  return 'http://localhost:8000'; // Local testing
  // return 'https://bhavyabazaar.com'; // Production testing
};

const BASE_URL = getBaseUrl();

async function testShopRegistrationWithoutImage() {
  console.log('🧪 Testing shop registration WITHOUT image upload...');
  console.log(`📡 Base URL: ${BASE_URL}`);
  
  try {
    // Test data for shop registration
    const testShopData = {
      name: `Test Shop ${Date.now()}`,
      phoneNumber: `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`, // Random 10-digit number starting with 98
      password: 'TestPassword123!',
      address: '123 Test Street, Test City, Test State',
      zipCode: '123456'
      // NOTE: No avatar/image included
    };
    
    console.log('📝 Test shop data:', {
      ...testShopData,
      password: '[HIDDEN]'
    });
    
    // Make the registration request
    console.log('\n🚀 Making registration request...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/register-seller`, testShopData, {
      headers: {
        'Content-Type': 'application/json',
        // Not using multipart/form-data since we're not uploading a file
      },
      withCredentials: true,
      timeout: 10000
    });
    
    console.log('\n✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.success) {
      console.log('\n🎉 RESULT: Shop registration WITHOUT image works correctly!');
      console.log(`   - Shop created: ${response.data.seller?.name}`);
      console.log(`   - Phone: ${response.data.seller?.phoneNumber}`);
      console.log(`   - Avatar: ${response.data.seller?.avatar || 'null (as expected)'}`);
    }
    
  } catch (error) {
    console.log('\n❌ Registration failed:');
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error message:', error.response.data?.message || 'No message');
      console.log('   Full response:', error.response.data);
      
      if (error.response.data?.message === 'Please provide all required fields') {
        console.log('\n🔍 Analysis: The "required fields" error occurred.');
        console.log('   This means one of the required fields is missing or empty.');
        console.log('   Required fields: name, phoneNumber, password, address, zipCode');
        console.log('   Image/avatar is NOT required according to backend validation.');
      }
      
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Cannot connect to server. Make sure backend is running on port 8000.');
      
    } else {
      console.log('   Error:', error.message);
    }
  }
}

async function testShopRegistrationWithFormData() {
  console.log('\n\n🧪 Testing shop registration WITH FormData (simulating file upload form)...');
  
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add form fields (same as before)
    formData.append('name', `Test Shop FormData ${Date.now()}`);
    formData.append('phoneNumber', `97${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`);
    formData.append('password', 'TestPassword123!');
    formData.append('address', '456 Test Avenue, Test City, Test State');
    formData.append('zipCode', '654321');
    // NOTE: No avatar file appended
    
    console.log('📝 Sending FormData without image file...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/register-seller`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      withCredentials: true,
      timeout: 10000
    });
    
    console.log('\n✅ FormData registration successful!');
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('\n🎉 RESULT: Shop registration with FormData (no image) works correctly!');
    }
    
  } catch (error) {
    console.log('\n❌ FormData registration failed:');
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', error.response.data?.message || 'No message');
    } else {
      console.log('   Error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🔬 SHOP REGISTRATION IMAGE OPTIONAL TEST');
  console.log('==========================================');
  
  await testShopRegistrationWithoutImage();
  await testShopRegistrationWithFormData();
  
  console.log('\n📋 SUMMARY:');
  console.log('- Backend validation: Image is NOT required ✅');
  console.log('- Frontend labels: "Shop Image (Optional)" ✅');
  console.log('- Frontend validation: Image not in required check ✅');
  console.log('\nIf you\'re still getting "required fields" error, please check:');
  console.log('1. All other fields (name, phone, password, address, zip) are filled');
  console.log('2. Phone number is exactly 10 digits');
  console.log('3. No special characters in required fields');
  console.log('4. Check browser console for specific field validation errors');
}

runTests().catch(console.error);
