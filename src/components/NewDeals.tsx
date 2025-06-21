'use client';
import React from 'react';

const NewDeals = () => {
  const projects = [
    {
      name: 'Palm Jumeirah Villa',
      value: '$1.2M',
      tokens: '1,200,000 DRT',
      roi: '8.5%',
      status: 'Open'
    },
    {
      name: 'Downtown Dubai Apartment',
      value: '$850K',
      tokens: '850,000 DRT',
      roi: '7.2%',
      status: 'Coming Soon'
    },
    {
      name: 'JBR Beachfront',
      value: '$2.1M',
      tokens: '2,100,000 DRT',
      roi: '9.1%',
      status: 'Open'
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">New Investment Opportunities</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Invest
        </button>
      </div>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="border p-4 rounded-lg hover:bg-gray-50">
            <div className="flex justify-between">
              <h4 className="font-medium">{project.name}</h4>
              <span className={`px-2 py-1 text-xs rounded ${
                project.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-500">Property Value</p>
                <p>{project.value}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tokens Available</p>
                <p>{project.tokens}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projected ROI</p>
                <p className="text-green-600">{project.roi}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewDeals;