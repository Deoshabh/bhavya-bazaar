import React from 'react';
import { useSelector } from 'react-redux';

const AuthDebug = () => {
  const userState = useSelector((state) => state.user);
  const sellerState = useSelector((state) => state.seller);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="mb-2 font-bold text-yellow-400">🔍 Auth Debug (Fixed)</div>
      
      <div className="mb-2">
        <div className="text-blue-400">User State:</div>
        <div>• isAuthenticated: <span className={userState.isAuthenticated ? 'text-green-400' : 'text-red-400'}>{String(userState.isAuthenticated)}</span></div>
        <div>• loading: <span className={userState.loading ? 'text-yellow-400' : 'text-green-400'}>{String(userState.loading)}</span></div>
        <div>• user: {userState.user?.name || 'null'}</div>
      </div>
      
      <div className="mb-2">
        <div className="text-green-400">Seller State:</div>
        <div>• isSeller: <span className={sellerState.isSeller ? 'text-green-400' : 'text-red-400'}>{String(sellerState.isSeller)}</span></div>
        <div>• isLoading: <span className={sellerState.isLoading ? 'text-yellow-400 font-bold' : 'text-green-400'}>{String(sellerState.isLoading)}</span></div>
        <div>• seller: {sellerState.seller?.name || 'null'}</div>
      </div>
      
      {sellerState.isLoading && (
        <div className="bg-red-600 p-2 rounded text-center text-xs mt-2">
          ⚠️ STUCK LOADING - This should be fixed now!
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-2">
        🔄 Refresh page to see the fix
      </div>
    </div>
  );
};

export default AuthDebug;
