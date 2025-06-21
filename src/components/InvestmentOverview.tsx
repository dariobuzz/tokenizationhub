import React from 'react';
import { motion } from 'framer-motion'; // Assuming you use framer-motion here too

// Sample data - replace with your actual data source
const overviewData = {
  totalInvested: 12500,
  currentValue: 16250,
  roiPercentage: 30, // Positive ROI
  // For negative ROI example:
  // roiPercentage: -5,
};

const InvestmentOverview = () => {
  const { totalInvested, currentValue, roiPercentage } = overviewData;
  const isPositiveROI = roiPercentage >= 0;

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow"
      // Add any motion props if needed
    >
      <h2 className="text-xl font-semibold text-[#695936] mb-6">Investment Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Invested */}
        <div className="p-4 bg-gray-50 rounded-lg text-center md:text-left">
          <p className="text-sm text-gray-500 mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-gray-800">
            ${totalInvested.toLocaleString()}
          </p>
        </div>
        
        {/* Current Value */}
        <div className="p-4 bg-gray-50 rounded-lg text-center md:text-left">
          <p className="text-sm text-gray-500 mb-1">Current Value</p>
          <p className="text-2xl font-bold text-gray-800">
            ${currentValue.toLocaleString()}
          </p>
        </div>
        
        {/* ROI Percentage */}
        <div className="p-4 bg-gray-50 rounded-lg text-center md:text-left">
          <p className="text-sm text-gray-500 mb-1">Return on Investment</p>
          <div className="flex items-center justify-center md:justify-start">
            <p className={`text-2xl font-bold ${isPositiveROI ? 'text-green-600' : 'text-red-600'}`}>
              {roiPercentage.toFixed(1)}%
            </p>
            <span 
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex items-center
                          ${isPositiveROI ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {isPositiveROI ? '↗︎' : '↘︎'}
              <span className="ml-1">{isPositiveROI ? '+' : ''}{roiPercentage.toFixed(1)}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* You can add more details or charts below if needed */}
      {/* e.g., <div className="mt-6"> ... portfolio chart ... </div> */}
    </motion.div>
  );
};

export default InvestmentOverview;