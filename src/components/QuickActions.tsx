'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  badge?: string;
  disabled?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({ 
  title, 
  description, 
  icon, 
  color, 
  action, 
  badge,
  disabled = false 
}) => {
  return (
    <motion.button
      className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 group ${
        disabled 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
          : `border-transparent bg-white hover:border-${color}-200 hover:shadow-lg shadow-sm`
      }`}
      whileHover={disabled ? {} : { y: -2, scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : action}
      disabled={disabled}
      aria-label={`${title}: ${description}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {badge && (
        <span className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold rounded-full bg-${color}-100 text-${color}-800`}>
          {badge}
        </span>
      )}
      
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
          <span className="text-2xl">{icon}</span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-3">{description}</p>
          
          <div className="flex items-center text-sm font-medium text-[#695936] group-hover:text-[#7a6a42] transition-colors">
            <span>Get started</span>
            <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const QuickActions: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const actions = [
    {
      title: 'Deposit Funds',
      description: 'Add money to your account via bank transfer, card, or crypto',
      icon: '💳',
      color: 'blue',
      action: () => router.push('/deposit'),
      badge: 'Popular'
    },
    {
      title: 'Browse Properties',
      description: 'Explore new real estate investment opportunities',
      icon: '🏢',
      color: 'green',
      action: () => router.push('/tokens'),
    },
    {
      title: 'Complete KYC',
      description: 'Verify your identity to unlock all features',
      icon: '✅',
      color: 'orange',
      action: () => router.push('/kyc'),
      badge: 'Required'
    },
    {
      title: 'View Portfolio',
      description: 'Detailed breakdown of your investments and performance',
      icon: '📊',
      color: 'purple',
      action: () => router.push('/dashboard?tab=portfolio'),
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-500 mt-1">Everything you need to manage your investments</p>
        </div>
        
        <motion.button
          className="text-sm text-[#695936] hover:text-[#7a6a42] font-medium flex items-center"
          whileHover={{ x: 2 }}
        >
          View all
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <QuickAction {...action} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions; 