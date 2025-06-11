/**
 * Admin Login Debug Utility
 * 
 * This utility can be run in the browser console to test admin login
 * and verify Redux state updates
 */

window.testAdminLogin = async function() {
  console.log('🔐 Testing Admin Login Flow...');
  
  try {
    // Get store instance (assumes Redux DevTools or store is available)
    const store = window.__REDUX_STORE__ || 
                  (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.store) ||
                  null;
    
    if (!store) {
      console.error('❌ Redux store not found. Make sure Redux DevTools is enabled.');
      return;
    }
    
    console.log('📊 Current user state:', store.getState().user);
    
    // Test admin login API directly
    console.log('📞 Calling admin login API...');
    const response = await fetch('/api/auth/login-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'superadmin@bhavyabazaar.com',
        password: 'SuperAdmin@2024!'
      })
    });
    
    const data = await response.json();
    console.log('🔄 API Response:', data);
    
    if (data.success) {
      console.log('✅ API login successful');
      
      // Check updated user state
      setTimeout(() => {
        console.log('📊 Updated user state:', store.getState().user);
        
        if (store.getState().user.isAuthenticated) {
          console.log('✅ Redux state updated successfully');
          console.log('👤 Logged in as:', store.getState().user.user?.name);
          console.log('🔑 Role:', store.getState().user.user?.role);
        } else {
          console.log('❌ Redux state not updated');
        }
      }, 1000);
      
    } else {
      console.error('❌ API login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Auto-run if store is available
if (typeof window !== 'undefined') {
  console.log('🔧 Admin Login Debug Utility loaded');
  console.log('📝 Run testAdminLogin() in console to test admin login');
}
