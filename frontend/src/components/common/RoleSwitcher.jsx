import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaStore, FaShoppingCart, FaExchangeAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { enableSellerCustomerMode, disableSellerCustomerMode, getCurrentRole } from '../../utils/auth';
import { loadUser, loadSeller } from '../../redux/actions/user';

const RoleSwitcher = ({ className = "" }) => {
  const dispatch = useDispatch();
  const { isSeller } = useSelector((state) => state.seller);
  const { isAuthenticated } = useSelector((state) => state.user);
  
  const [currentRole, setCurrentRole] = useState('seller');
  const [loading, setLoading] = useState(false);
  const [customerModeEnabled, setCustomerModeEnabled] = useState(false);

  useEffect(() => {
    if (isSeller) {
      fetchCurrentRole();
    }
  }, [isSeller]);

  const fetchCurrentRole = async () => {
    try {
      const roleData = await getCurrentRole();
      if (roleData.success) {
        setCurrentRole(roleData.activeRole);
        setCustomerModeEnabled(roleData.customerModeEnabled || false);
      }
    } catch (error) {
      console.error('Error fetching current role:', error);
    }
  };

  const switchToCustomerMode = async () => {
    setLoading(true);
    try {
      await enableSellerCustomerMode();
      setCurrentRole('customer');
      setCustomerModeEnabled(true);
      
      // Refresh both seller and user states
      await dispatch(loadSeller());
      await dispatch(loadUser());
      
      toast.success('Switched to customer mode! You can now shop from other sellers.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to switch to customer mode');
    } finally {
      setLoading(false);
    }
  };

  const switchToSellerMode = async () => {
    setLoading(true);
    try {
      await disableSellerCustomerMode();
      setCurrentRole('seller');
      setCustomerModeEnabled(false);
      
      // Refresh seller state
      await dispatch(loadSeller());
      
      toast.success('Switched back to seller mode!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to switch to seller mode');
    } finally {
      setLoading(false);
    }
  };

  // Only show for authenticated sellers
  if (!isSeller) {
    return null;
  }

  return (
    <div className={`role-switcher ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FaExchangeAlt className="text-blue-500" />
              <span className="font-medium text-gray-700">Current Mode:</span>
            </div>
            
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              currentRole === 'seller' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {currentRole === 'seller' ? <FaStore /> : <FaShoppingCart />}
              <span className="capitalize">{currentRole}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentRole === 'seller' ? (
              <button
                onClick={switchToCustomerMode}
                disabled={loading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <FaShoppingCart className="text-sm" />
                <span>{loading ? 'Switching...' : 'Shop as Customer'}</span>
              </button>
            ) : (
              <button
                onClick={switchToSellerMode}
                disabled={loading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <FaStore className="text-sm" />
                <span>{loading ? 'Switching...' : 'Back to Selling'}</span>
              </button>
            )}
          </div>
        </div>

        {currentRole === 'customer' && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              🛍️ You're now in <strong>Customer Mode</strong>! You can browse and buy products from other sellers. 
              Your seller dashboard is still available - just switch back when you want to manage your shop.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSwitcher;
