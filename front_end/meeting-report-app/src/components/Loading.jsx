import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Loading Skeleton Component
 */
function Skeleton({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div className={`${width} ${height} bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse ${className}`} />
  );
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {text && <p className="text-slate-600 text-sm">{text}</p>}
    </div>
  );
}

export { Skeleton, LoadingSpinner };
