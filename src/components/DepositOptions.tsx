'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface DepositOptionsProps {
  defaultTab?: 'bank' | 'card' | 'crypto';
}

const DepositOptions = ({ defaultTab = 'bank' }: DepositOptionsProps) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'card' | 'crypto'>(defaultTab);
  
  const methods = [
    { name: 'Bank Transfer', icon: '🏦', fee: '0.5%', min: '$500', tab: 'bank' },
    { name: 'Crypto', icon: '🪙', fee: '0.1%', min: '$50', tab: 'crypto' },
    { name: 'Credit Card (TBC)', icon: '💳', fee: '2.9%', min: '$100', tab: 'card' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map((method, index) => (
          <div key={index} className="border p-4 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <h4 className="font-medium">{method.name}</h4>
                <div className="flex space-x-4 text-sm text-gray-500">
                  <p>Fee: {method.fee}</p>
                  <p>Min: {method.min}</p>
                </div>
              </div>
            </div>
            <Link 
              href={`/deposit?tab=${method.tab}`}
              className="block mt-3 w-full bg-[#695936] text-white py-2 rounded hover:bg-[#7a6a42] text-center"
            >
              Deposit with {method.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepositOptions;