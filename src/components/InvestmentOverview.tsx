'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner, CardSkeleton } from './LoadingStates';

interface InvestmentData {
  totalInvested: number;
  currentValue: number;
  roiPercentage: number;
  totalGain: number;
  monthlyGain: number;
  weeklyChange: number;
  topPerformer: {
    name: string;
    gain: number;
    percentage: number;
  };
  breakdown: {
    properties: number;
    tokens: number;
    staking: number;
    other: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  description?: string;
  index: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description,
  index 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return '↗️';
      case 'negative': return '↘️';
      default: return '→';
    }
  };

  return (
    <motion.div
      className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#695936]/10 rounded-lg">
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {description && (
              <p className="text-sm text-gray-400">{description}</p>
            )}
          </div>
        </div>
        
        {change && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getChangeColor()}`}>
            <span className="mr-1">{getChangeIcon()}</span>
            {change}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const BreakdownChart: React.FC<{ breakdown: InvestmentData['breakdown'] }> = ({ breakdown }) => {
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  
  const categories = [
    { name: 'Properties', value: breakdown.properties, color: '#695936', icon: '🏢' },
    { name: 'Tokens', value: breakdown.tokens, color: '#3B82F6', icon: '🪙' },
    { name: 'Staking', value: breakdown.staking, color: '#10B981', icon: '🔒' },
    { name: 'Other', value: breakdown.other, color: '#8B5CF6', icon: '📊' }
  ];

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Breakdown</h3>
      
      {/* Donut Chart Visualization */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="3"
            />
            {categories.map((category, index) => {
              const percentage = (category.value / total) * 100;
              const offset = categories.slice(0, index).reduce((sum, cat) => sum + (cat.value / total) * 100, 0);
              const circumference = 2 * Math.PI * 15.915;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((offset / 100) * circumference);
              
              return (
                <motion.circle
                  key={category.name}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke={category.color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-bold text-gray-900">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-3">
        {categories.map((category, index) => {
          const percentage = ((category.value / total) * 100).toFixed(1);
          return (
            <motion.div
              key={category.name}
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{category.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ${category.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const InvestmentOverview: React.FC = () => {
  const [data, setData] = useState<InvestmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: InvestmentData = {
        totalInvested: 21500,
        currentValue: 24750,
        roiPercentage: 15.2,
        totalGain: 3250,
        monthlyGain: 425,
        weeklyChange: 2.8,
        topPerformer: {
          name: 'Dubai Elite Property',
          gain: 1250,
          percentage: 18.5
        },
        breakdown: {
          properties: 18500,
          tokens: 4200,
          staking: 1800,
          other: 250
        }
      };
      
      setData(mockData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isPositiveROI = data.roiPercentage >= 0;
  const isPositiveWeekly = data.weeklyChange >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Investment Overview</h2>
        <p className="text-gray-500 mt-1">Track your investment performance and portfolio allocation</p>
      </motion.div>

      {/* Key Metrics Grid - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(data.currentValue)}
          change={`${isPositiveWeekly ? '+' : ''}${data.weeklyChange}% this week`}
          changeType={isPositiveWeekly ? 'positive' : 'negative'}
          icon="💰"
          description="Current market value"
          index={0}
        />
        
        <MetricCard
          title="Total Invested"
          value={formatCurrency(data.totalInvested)}
          icon="📈"
          description="Your total investment"
          index={1}
        />
        
        <MetricCard
          title="Total Return"
          value={`${isPositiveROI ? '+' : ''}${data.roiPercentage.toFixed(1)}%`}
          change={formatCurrency(data.totalGain)}
          changeType={isPositiveROI ? 'positive' : 'negative'}
          icon="📊"
          description="Overall performance"
          index={2}
        />
        
        <MetricCard
          title="Top Performer"
          value={data.topPerformer.name}
          change={`+${data.topPerformer.percentage}%`}
          changeType="positive"
          icon="🏆"
          description={formatCurrency(data.topPerformer.gain)}
          index={3}
        />
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownChart breakdown={data.breakdown} />
        
        {/* Quick Actions */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <motion.button
              className="w-full flex items-center justify-between p-4 bg-[#695936] text-white rounded-lg hover:bg-[#7a6a42] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">🏢</span>
                <span className="font-medium">Explore New Properties</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
            
            <motion.button
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">💳</span>
                <span className="font-medium text-gray-700">Add Funds</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
            
            <motion.button
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">📊</span>
                <span className="font-medium text-gray-700">View Detailed Report</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
          
          {/* Performance Indicator */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-600">🎯</span>
              <span className="text-sm font-medium text-green-800">Performance Goal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Target ROI: 12%</span>
              <span className="text-sm font-semibold text-green-800">
                Current: {data.roiPercentage.toFixed(1)}%
                {isPositiveROI && data.roiPercentage > 12 && ' 🚀'}
              </span>
            </div>
            <div className="mt-2 w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((data.roiPercentage / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestmentOverview;