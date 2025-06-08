import React, { memo } from 'react';

const OptimizedLoader = memo(({ 
    size = 'medium', 
    color = 'blue', 
    text = 'Loading...', 
    fullScreen = false,
    className = '' 
}) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xlarge: 'w-16 h-16'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        green: 'border-green-600',
        red: 'border-red-600',
        purple: 'border-purple-600',
        gray: 'border-gray-600'
    };

    const containerClass = fullScreen 
        ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50' 
        : 'flex items-center justify-center p-4';

    return (
        <div className={`${containerClass} ${className}`}>
            <div className="flex flex-col items-center space-y-3">
                <div className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-t-transparent rounded-full animate-spin`} />
                {text && (
                    <p className="text-sm font-medium text-gray-600 animate-pulse">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
});

OptimizedLoader.displayName = 'OptimizedLoader';

export default OptimizedLoader;
