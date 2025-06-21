import React from 'react';

const RewardsSection = () => {
  const rewards = [
    { name: 'Quarterly Dividends', amount: '$1,200', status: 'Claimable' },
    { name: 'Token Appreciation', amount: '$850', status: 'Pending' },
    { name: 'Referral Bonus', amount: '$300', status: 'Claimable' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Rewards & Claims</h3>
      <div className="space-y-4">
        {rewards.map((reward, index) => (
          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium">{reward.name}</p>
              <p className="text-sm text-gray-500">{reward.status}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{reward.amount}</p>
              {reward.status === 'Claimable' && (
                <button className="mt-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                  Claim Now
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="pt-4 border-t flex justify-between items-center">
          <p className="text-gray-500">Total Available</p>
          <p className="text-2xl font-bold text-green-600">$1,500</p>
        </div>
      </div>
    </div>
  );
};

export default RewardsSection;