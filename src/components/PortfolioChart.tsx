'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PortfolioChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Real Estate ROI',
        data: [5000, 7500, 8500, 9200, 11000, 12500],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Token Value',
        data: [3000, 6000, 8000, 9500, 10500, 12000],
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
      }
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <h3 className="text-lg font-semibold mb-2">Investment Performance</h3>
      <div className="h-[280px]"> {/* Reduced chart container height */}
        <Line 
          data={data} 
          options={{
        
            maintainAspectRatio: false, // Allow chart to fit container
            responsive: true
          }} 
        />
      </div>
    </div>
  );
};

export default PortfolioChart;