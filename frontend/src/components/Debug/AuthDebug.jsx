import React from 'react';
import { useSelector } from 'react-redux';

const AuthDebug = () => {
  const userState = useSelector((state) => state.user);
  const sellerState = useSelector((state) => state.seller);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="mb-2 font-bold text-yellow-400">🔍 Auth Debug</div>
      
      <div className="mb-2">
        <div className="text-blue-400">User State:</div>
        <div>• isAuthenticated: {String(userState.isAuthenticated)}</div>
        <div>• loading: {String(userState.loading)}</div>
        <div>• user: {userState.user?.name || 'null'}</div>
        <div>• role: {userState.user?.role || 'null'}</div>
      </div>
      
      <div className="mb-2">
        <div className="text-green-400">Seller State:</div>
        <div>• isSeller: {String(sellerState.isSeller)}</div>
        <div>• isLoading: {String(sellerState.isLoading)}</div>
        <div>• seller: {sellerState.seller?.name || 'null'}</div>
        <div>• seller._id: {sellerState.seller?._id || 'null'}</div>
      </div>
      
      <div>
        <div className="text-purple-400">Current URL:</div>
        <div>{window.location.href}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
