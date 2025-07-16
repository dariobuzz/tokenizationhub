'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface ActivityItem {
  id: string;
  type: 'deposit' | 'investment' | 'withdrawal' | 'dividend' | 'kyc';
  title: string;
  subtitle: string;
  amount?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  icon: string;
}

const ActivityItem: React.FC<{ activity: ActivityItem; index: number }> = ({ activity, index }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '•';
    }
  };

  return (
    <motion.div
      className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ x: 4 }}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#695936]/10 flex items-center justify-center group-hover:bg-[#695936]/20 transition-colors">
          <span className="text-lg">{activity.icon}</span>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.title}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {activity.subtitle}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                <span className="mr-1">{getStatusIcon(activity.status)}</span>
                {activity.status}
              </span>
              <span className="text-xs text-gray-400">
                {activity.timestamp}
              </span>
            </div>
          </div>
          
          {activity.amount && (
            <div className="flex-shrink-0 ml-4 text-right">
              <p className="text-sm font-semibold text-gray-900">
                {activity.amount}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonLoader: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-start space-x-4 p-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '70%' }} />
          <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '50%' }} />
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '80px' }} />
            <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }} />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }} />
      </div>
    ))}
  </div>
);

const RecentActivity: React.FC = () => {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    // Simulate API call - replace with real API
    const fetchActivities = async () => {
      setLoading(true);
      
      // Mock delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'deposit',
          title: 'USDT Deposit',
          subtitle: 'Crypto deposit via Polygon network',
          amount: '+$5,000',
          timestamp: '2 hours ago',
          status: 'completed',
          icon: '💳'
        },
        {
          id: '2',
          type: 'investment',
          title: 'Dubai Elite Property',
          subtitle: 'Purchased 100 DRT tokens',
          amount: '-$1,000',
          timestamp: '1 day ago',
          status: 'completed',
          icon: '🏢'
        },
        {
          id: '3',
          type: 'dividend',
          title: 'Monthly Dividend',
          subtitle: 'Palm Jumeirah Villa returns',
          amount: '+$125',
          timestamp: '3 days ago',
          status: 'completed',
          icon: '💰'
        },
        {
          id: '4',
          type: 'kyc',
          title: 'KYC Verification',
          subtitle: 'Identity verification completed',
          timestamp: '5 days ago',
          status: 'completed',
          icon: '✅'
        },
        {
          id: '5',
          type: 'deposit',
          title: 'Bank Transfer',
          subtitle: 'Wire transfer pending confirmation',
          amount: '+$2,500',
          timestamp: '1 week ago',
          status: 'pending',
          icon: '🏦'
        }
      ];
      
      setActivities(mockActivities);
      setLoading(false);
    };

    fetchActivities();
  }, [session]);

  const displayActivities = viewAll ? activities : activities.slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest transactions and updates</p>
          </div>
          
          <motion.button
            className="text-sm text-[#695936] hover:text-[#7a6a42] font-medium flex items-center"
            whileHover={{ scale: 1.05 }}
            onClick={() => setViewAll(!viewAll)}
          >
            {viewAll ? 'Show less' : 'View all'}
            <svg 
              className={`ml-1 w-4 h-4 transition-transform ${viewAll ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader />
          </div>
        ) : (
          <AnimatePresence>
            {displayActivities.length > 0 ? (
              displayActivities.map((activity, index) => (
                <ActivityItem key={activity.id} activity={activity} index={index} />
              ))
            ) : (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-500">Your transactions and updates will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default RecentActivity; 