'use client';
import React from 'react';
import Link from 'next/link';

export default function TokensPage() {
  const tokens = [
    {
      symbol: 'DRT',
      name: 'DubaiRealToken',
      balance: '15,000',
      value: '$15,000',
      price: '$1.00',
      change: '+5.2%'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      balance: '5,000',
      value: '$5,000',
      price: '$1.00',
      change: '0.0%'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: '0.15',
      value: '$4,500',
      price: '$30,000',
      change: '+2.1%'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '2.5',
      value: '$4,000',
      price: '$1,600',
      change: '+1.8%'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Token Portfolio</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 p-4 font-medium text-gray-500">
          <div className="col-span-4">Token</div>
          <div className="col-span-2 text-right">Balance</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h Change</div>
          <div className="col-span-2 text-right">Value</div>
        </div>
        
        {tokens.map((token, index) => (
          <div key={index} className="grid grid-cols-12 p-4 border-b hover:bg-gray-50">
            <div className="col-span-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-xs font-bold">{token.symbol}</span>
              </div>
              <div>
                <p className="font-medium">{token.name}</p>
                <p className="text-sm text-gray-500">{token.symbol}</p>
              </div>
            </div>
            <div className="col-span-2 text-right">{token.balance}</div>
            <div className="col-span-2 text-right">{token.price}</div>
            <div className={`col-span-2 text-right ${
              token.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {token.change}
            </div>
            <div className="col-span-2 text-right font-medium">{token.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Link
          href="/deposit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Deposit Funds
        </Link>
        <Link
          href="/withdraw"
          className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50"
        >
          Withdraw
        </Link>
      </div>
    </div>
  );
}