'use client';
import React from 'react';
import Link from 'next/link';

export default function RewardsPage() {
  const rewards = [
    {
      id: 1,
      name: 'Quarterly Dividend',
      amount: '150 DRT',
      value: '$150',
      status: 'Claimable',
      date: '2023-12-15'
    },
    {
      id: 2,
      name: 'Staking Rewards',
      amount: '75 DRT',
      value: '$75',
      status: 'Claimable',
      date: '2023-12-10'
    },
    {
      id: 3,
      name: 'Referral Bonus',
      amount: '50 DRT',
      value: '$50',
      status: 'Claimed',
      date: '2023-11-28'
    },
    {
      id: 4,
      name: 'Loyalty Bonus',
      amount: '100 DRT',
      value: '$100',
      status: 'Pending',
      date: '2024-01-05'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Rewards & Claims</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 p-4 font-medium text-gray-500">
          <div className="col-span-5">Reward</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-right">Value</div>
          <div className="col-span-2 text-right">Status</div>
          <div className="col-span-1"></div>
        </div>
        
        {rewards.map((reward) => (
          <div key={reward.id} className="grid grid-cols-12 p-4 border-b hover:bg-gray-50">
            <div className="col-span-5">
              <p className="font-medium">{reward.name}</p>
              <p className="text-sm text-gray-500">{reward.date}</p>
            </div>
            <div className="col-span-2 text-right">{reward.amount}</div>
            <div className="col-span-2 text-right">{reward.value}</div>
            <div className="col-span-2 text-right">
              <span className={`px-2 py-1 text-xs rounded ${
                reward.status === 'Claimable' ? 'bg-green-100 text-green-800' :
                reward.status === 'Claimed' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {reward.status}
              </span>
            </div>
            <div className="col-span-1 text-right">
              {reward.status === 'Claimable' && (
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Claim
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Total Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Claimable</p>
            <p className="text-2xl font-bold">225 DRT</p>
            <p className="text-gray-500">$225</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Claimed</p>
            <p className="text-2xl font-bold">50 DRT</p>
            <p className="text-gray-500">$50</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold">100 DRT</p>
            <p className="text-gray-500">$100</p>
          </div>
        </div>
      </div>
    </div>
  );
}