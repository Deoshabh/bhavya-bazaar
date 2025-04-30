import React, { useState, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const GlobalNavButtons = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    // Check if we can go back or forward in history
    setCanGoBack(window.history.length > 1);
    setCanGoForward(window.history.length > 1 && window.history.state !== null);
    
    // Update buttons when history changes
    const handlePopState = () => {
      setCanGoBack(window.history.length > 1);
      setCanGoForward(window.history.length > 1 && window.history.state !== null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      window.history.back();
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      window.history.forward();
    }
  };

  return (
    <div className="fixed top-2 left-2 z-50 flex items-center space-x-2 md:top-4 md:left-4">
      <button
        onClick={handleBack}
        disabled={!canGoBack}
        aria-label="Go back"
        className={`p-2 rounded-full bg-white shadow-md focus:outline-none transition-all duration-300 ${
          canGoBack ? 'hover:bg-gray-100 active:bg-gray-200' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <IoIosArrowBack size={20} color={canGoBack ? "#333" : "#999"} />
      </button>
      
      <button
        onClick={handleForward}
        disabled={!canGoForward}
        aria-label="Go forward"
        className={`p-2 rounded-full bg-white shadow-md focus:outline-none transition-all duration-300 ${
          canGoForward ? 'hover:bg-gray-100 active:bg-gray-200' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <IoIosArrowForward size={20} color={canGoForward ? "#333" : "#999"} />
      </button>
    </div>
  );
};

export default GlobalNavButtons;
