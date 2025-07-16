'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PortfolioData {
  month: string;
  value: number;
  change: number;
}

const PortfolioChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
  
  // Mock data - replace with real API data
  const portfolioData: PortfolioData[] = [
    { month: 'Jan', value: 15000, change: 5.2 },
    { month: 'Feb', value: 16200, change: 8.0 },
    { month: 'Mar', value: 17800, change: 9.9 },
    { month: 'Apr', value: 19200, change: 7.9 },
    { month: 'May', value: 21500, change: 12.0 },
    { month: 'Jun', value: 22100, change: 2.8 },
    { month: 'Jul', value: 24750, change: 12.0 },
  ];

  const maxValue = Math.max(...portfolioData.map(d => d.value));
  const minValue = Math.min(...portfolioData.map(d => d.value));
  const chartHeight = 200;

  const getDataPointY = (value: number) => {
    const range = maxValue - minValue;
    const normalizedValue = (value - minValue) / range;
    return chartHeight - (normalizedValue * chartHeight * 0.8) - 20;
  };

  const timeRanges = ['1M', '3M', '6M', '1Y'] as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Portfolio Performance</h2>
          <p className="text-sm text-gray-500 mt-1">Track your investment growth over time</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeRanges.map((range) => (
            <motion.button
              key={range}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white text-[#695936] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setTimeRange(range)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg 
          width="100%" 
          height="100%" 
          className="overflow-visible"
          viewBox={`0 0 800 ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="100" height="40" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#695936" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#695936" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart Line and Area */}
          <motion.path
            d={`M ${portfolioData.map((d, i) => 
              `${(i / (portfolioData.length - 1)) * 700 + 50} ${getDataPointY(d.value)}`
            ).join(' L ')}`}
            fill="none"
            stroke="#695936"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          <motion.path
            d={`M ${portfolioData.map((d, i) => 
              `${(i / (portfolioData.length - 1)) * 700 + 50} ${getDataPointY(d.value)}`
            ).join(' L ')} L 750 ${chartHeight} L 50 ${chartHeight} Z`}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          
          {/* Data Points */}
          {portfolioData.map((d, i) => (
            <motion.g key={i}>
              <motion.circle
                cx={(i / (portfolioData.length - 1)) * 700 + 50}
                cy={getDataPointY(d.value)}
                r="4"
                fill="#695936"
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: (i * 0.1) + 1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.5 }}
                className="cursor-pointer"
              />
              
              {/* Tooltip on hover */}
              <motion.g
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <rect
                  x={(i / (portfolioData.length - 1)) * 700 + 25}
                  y={getDataPointY(d.value) - 45}
                  width="50"
                  height="30"
                  fill="#2d3748"
                  rx="4"
                  opacity="0.9"
                />
                <text
                  x={(i / (portfolioData.length - 1)) * 700 + 50}
                  y={getDataPointY(d.value) - 30}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="semibold"
                >
                  ${(d.value / 1000).toFixed(0)}k
                </text>
                <text
                  x={(i / (portfolioData.length - 1)) * 700 + 50}
                  y={getDataPointY(d.value) - 20}
                  textAnchor="middle"
                  fill="#68d391"
                  fontSize="9"
                >
                  +{d.change}%
                </text>
              </motion.g>
            </motion.g>
          ))}
          
          {/* Month Labels */}
          {portfolioData.map((d, i) => (
            <text
              key={i}
              x={(i / (portfolioData.length - 1)) * 700 + 50}
              y={chartHeight - 5}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
              fontWeight="medium"
            >
              {d.month}
            </text>
          ))}
        </svg>
      </div>

      {/* Summary Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">$24.7k</p>
          <p className="text-sm text-gray-500">Current Value</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">+65%</p>
          <p className="text-sm text-gray-500">Total Return</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">$9.7k</p>
          <p className="text-sm text-gray-500">Total Gain</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">12.8%</p>
          <p className="text-sm text-gray-500">Avg Monthly</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PortfolioChart;