'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeHeader from './WelcomeHeader';
import KPICards from './KPICards';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import PortfolioChart from './PortfolioChart';
import KYCStatus from './KYCStatus';
import TokenBalances from './TokenBalances';
import PropertiesSection from './PropertiesSection';

type DashboardTab = 'overview' | 'portfolio' | 'activity' | 'properties';

const Dashboard = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  
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

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'portfolio', label: 'Portfolio', icon: '📊' },
    { id: 'activity', label: 'Activity', icon: '⚡' },
    { id: 'properties', label: 'Properties', icon: '🏢' }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
            {/* KPI Cards */}
            <motion.div variants={itemVariants}>
              <KPICards />
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <QuickActions />
            </motion.div>

            {/* KYC Status */}
            <motion.div variants={itemVariants}>
              <KYCStatus session={session} />
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <RecentActivity />
            </motion.div>
          </motion.div>
        );

      case 'portfolio':
        return (
          <motion.div
            key="portfolio"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioChart />
              <TokenBalances />
            </div>
          </motion.div>
        );

      case 'activity':
        return (
          <motion.div
            key="activity"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <RecentActivity />
          </motion.div>
        );

      case 'properties':
        return (
          <motion.div
            key="properties"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <PropertiesSection />
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <WelcomeHeader />
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm border border-gray-100 overflow-x-auto"
        variants={itemVariants}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#695936] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {renderTabContent()}
      </AnimatePresence>

      {/* Footer spacing */}
      <div className="h-8"></div>
    </motion.div>
  );
};

export default Dashboard;