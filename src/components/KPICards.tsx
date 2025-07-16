'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType, icon, trend = 'stable' }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#695936]/10 rounded-lg">
            <span className="text-xl">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getChangeColor()}`}>
          <span className="mr-1">{getTrendIcon()}</span>
          {change}
        </div>
      </div>
    </motion.div>
  );
};

const KPICards: React.FC = () => {
  const { data: session } = useSession();
  
  // Mock data - replace with real data from your API
  const kpiData = [
    {
      title: 'Portfolio Value',
      value: '$24,750',
      change: '+15.2%',
      changeType: 'positive' as const,
      icon: '💰',
      trend: 'up' as const
    },
    {
      title: 'Total Invested',
      value: '$21,500',
      change: '+$2,500',
      changeType: 'positive' as const,
      icon: '📈',
      trend: 'up' as const
    },
    {
      title: 'Active Properties',
      value: '3',
      change: '+1 this month',
      changeType: 'positive' as const,
      icon: '🏢',
      trend: 'up' as const
    },
    {
      title: 'Monthly ROI',
      value: '12.8%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: '📊',
      trend: 'up' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpiData.map((kpi, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <KPICard {...kpi} />
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards; 