import React from 'react';

const TokenBalances = () => {
  const tokens = [
    { symbol: 'DRT', name: 'DubaiRealToken', balance: '15,000', value: '$15,000' },
    { symbol: 'USDT', name: 'Tether', balance: '5,000', value: '$5,000' },
    { symbol: 'BTC', name: 'Bitcoin', balance: '0.15', value: '$4,500' },
    { symbol: 'ETH', name: 'Ethereum', balance: '2.5', value: '$4,000' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Token Balances</h3>
      <div className="space-y-3">
        {tokens.map((token, index) => (
          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold">{token.symbol}</span>
              </div>
              <div>
                <p className="font-medium">{token.name}</p>
                <p className="text-sm text-gray-500">{token.balance} {token.symbol}</p>
              </div>
            </div>
            <p className="font-semibold">{token.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenBalances;