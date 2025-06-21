import React from 'react';

const TokenStatistics = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Token Statistics</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="border-b pb-4">
          <p className="text-sm text-gray-600">Total Supply</p>
          <p className="text-2xl font-bold text-gray-800">1,000,000 TKN</p>
        </div>
        <div className="border-b pb-4">
          <p className="text-sm text-gray-600">Circulating Supply</p>
          <p className="text-2xl font-bold text-gray-800">750,000 TKN</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-2xl font-bold text-gray-800">$0.50 USD</p>
        </div>
      </div>
    </div>
  );
};

export default TokenStatistics;