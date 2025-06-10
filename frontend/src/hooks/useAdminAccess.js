import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = window.RUNTIME_CONFIG?.API_URL?.replace('/api/v2', '') || 'https://api.bhavyabazaar.com';

/**
 * Hook to check if the current user has admin access
 * @returns {Object} { isAdmin, isSuperAdmin, canAccessAdmin, loading, checkAccess }
 */
export const useAdminAccess = () => {
  const [adminAccess, setAdminAccess] = useState({
    isAdmin: false,
    isSuperAdmin: false,
    canAccessAdmin: false,
    loading: true
  });

  const checkAccess = async () => {
    try {
      setAdminAccess(prev => ({ ...prev, loading: true }));
      
      const response = await axios.get(`${BASE_URL}/api/auth/admin/check-access`, {
        withCredentials: true,
        timeout: 5000
      });

      if (response.data.success) {
        setAdminAccess({
          isAdmin: response.data.isAdmin,
          isSuperAdmin: response.data.isSuperAdmin,
          canAccessAdmin: response.data.canAccessAdmin,
          adminRole: response.data.adminRole,
          permissions: response.data.permissions || [],
          loading: false
        });
      } else {
        setAdminAccess({
          isAdmin: false,
          isSuperAdmin: false,
          canAccessAdmin: false,
          loading: false
        });
      }
    } catch (error) {
      console.log('Admin access check failed (user likely not admin):', error.message);
      setAdminAccess({
        isAdmin: false,
        isSuperAdmin: false,
        canAccessAdmin: false,
        loading: false
      });
    }
  };

  useEffect(() => {
    checkAccess();
  }, []);

  return {
    ...adminAccess,
    checkAccess
  };
};

export default useAdminAccess;
