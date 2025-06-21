import React from 'react';

const PaymentOverview = () => {
  // Mock data for payment methods
  const paymentMethods = [
    { type: 'Credit Card', lastFour: '4242', isDefault: true },
    { type: 'Bank Account', lastFour: '1234', isDefault: false }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h2>
      
      <div className="space-y-4">
        {paymentMethods.map((method, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center">
              {method.type === 'Credit Card' ? (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">{method.type}</p>
                <p className="text-sm text-gray-500">Ending in {method.lastFour}</p>
              </div>
            </div>
            {method.isDefault && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Default</span>
            )}
          </div>
        ))}
      </div>
      
      <button className="mt-4 text-blue-600 text-sm font-medium flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Payment Method
      </button>
    </div>
  );
};

export default PaymentOverview;