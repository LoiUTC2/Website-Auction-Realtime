import React from 'react';

const LoadingSpinner = ({ size = 'default', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className="flex items-center justify-center mt-20">
      <div className={`animate-spin rounded-full border-t-4 border-b-4 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      <div className="ml-3 text-xl font-semibold animate-pulse">Loading...</div>
    </div>
  );
};

export default LoadingSpinner;