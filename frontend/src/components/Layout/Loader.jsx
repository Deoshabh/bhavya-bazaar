import React from "react";

// Simple CSS-only loader that doesn't depend on external libraries or files
const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="w-12 h-12 border-4 absolute top-2 left-2 border-green-500 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
        <div className="w-8 h-8 border-4 absolute top-4 left-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;