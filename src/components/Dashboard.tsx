'use client';  // Add this directive at the top of the file

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSession } from 'next-auth/react';
import InvestmentOverview from './InvestmentOverview';
import TokenBalances from './TokenBalances';
import DepositOptions from './DepositOptions';
import RewardsSection from './RewardsSection';
import KYCStatus from './KYCStatus';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { data: session } = useSession();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="flex">
      
        <motion.main 
          className="flex-1 p-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          
          
          {/* Portfolio Chart and Investment Overview Side by Side */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
            variants={itemVariants}
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <InvestmentOverview />
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Pass the user session to KYCStatus component */}
              <KYCStatus session={session} />
            </motion.div>
          </motion.div>
          
          {/* Rest of the component remains unchanged */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <DepositOptions />
          </motion.div>
   
          {/* Add KYC Status section after NewDeals */}
        
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6"
            variants={itemVariants}
          >
            {/* Existing property details section */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="h-64 mb-4 rounded-lg overflow-hidden">
                  <motion.img 
                    src="/properties/palm.jpeg" 
                    alt="Palm Jumeirah Villa"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">Dubai's Elite Realm: Discover the Secrets of Luxury Real Estate</h1>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Open
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Location</span>
                        <span>City Center, Dubai</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Size</span>
                        <span>34,000 sqft</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Apartments</span>
                        <span>8 to 11</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Buildings</span>
                        <span>3 to 5</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4">Investment Details</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Property Value</span>
                        <span>$7.2M</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Tokens Available</span>
                        <span>7,200,000 DRT</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Token Price</span>
                        <span>$1.00</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Projected ROI</span>
                        <span className="text-green-600">14.5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button 
                    className="bg-[#ffffff] text-black px-6 py-3 rounded-lg border border-[#695936] hover:bg-[#7a6a42] hover:text-white hover:border-[#7a6a42]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download
                  </motion.button>
                  <motion.button 
                    className="bg-[#695936] text-white px-6 py-3 rounded-lg hover:bg-[#7a6a42]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Invest Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        
          <motion.div variants={itemVariants}>
            <RewardsSection />
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default Dashboard;