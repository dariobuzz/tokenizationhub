'use client';
import React from 'react';
import { motion } from 'framer-motion';

// Generic Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({ 
  size = 'md', 
  color = '#695936' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-[${color}] rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      aria-label="Loading"
      role="status"
    />
  );
};

// Card Skeleton Loader
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

// KPI Card Skeleton
export const KPISkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16 ml-auto"></div>
        </div>
      </div>
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-60"></div>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-12 bg-gray-200 rounded-md mx-1"></div>
          ))}
        </div>
      </div>
      
      <div className="h-48 bg-gray-100 rounded-lg mb-6 flex items-end justify-around p-4">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="bg-gray-200 rounded-t"
            style={{ 
              width: '40px', 
              height: `${Math.random() * 120 + 40}px` 
            }}
          ></div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-8 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Quick Actions Skeleton
export const QuickActionsSkeleton: React.FC = () => (
  <div className="mb-8">
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Page Loading Component
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading your dashboard...' 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LoadingSpinner size="lg" />
      <motion.p 
        className="mt-4 text-gray-600 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
      <motion.div 
        className="mt-2 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Please wait while we load your data
      </motion.div>
    </motion.div>
  </div>
);

// Error State Component
export const ErrorState: React.FC<{ 
  title?: string; 
  message?: string; 
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ 
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data. Please try again.',
  onRetry,
  showRetry = true
}) => (
  <motion.div 
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
    
    {showRetry && onRetry && (
      <motion.button
        className="bg-[#695936] text-white px-6 py-2 rounded-lg hover:bg-[#7a6a42] transition-colors"
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Try Again
      </motion.button>
    )}
  </motion.div>
);

// Empty State Component
export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ 
  icon = '📋',
  title,
  message,
  actionLabel,
  onAction
}) => (
  <motion.div 
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <span className="text-2xl">{icon}</span>
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
    
    {actionLabel && onAction && (
      <motion.button
        className="bg-[#695936] text-white px-6 py-2 rounded-lg hover:bg-[#7a6a42] transition-colors"
        onClick={onAction}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
); 