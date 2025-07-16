'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface WelcomeHeaderProps {
  className?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ className = '' }) => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalBalance, setTotalBalance] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate fetching user balance - replace with real API call
    const fetchBalance = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTotalBalance(24750.50);
    };

    if (session) {
      fetchBalance();
    }
  }, [session]);

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!session) {
    return (
      <div className={`bg-gradient-to-r from-[#695936] to-[#7a6a42] rounded-xl p-6 text-white ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-2" style={{ width: '200px' }} />
          <div className="h-4 bg-white/20 rounded" style={{ width: '150px' }} />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`bg-gradient-to-r from-[#695936] to-[#7a6a42] rounded-xl p-6 text-white ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <motion.div 
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-white">
                {getInitials(session.user?.name || session.user?.email || 'U')}
              </span>
            )}
          </motion.div>

          {/* Greeting and User Info */}
          <div>
            <motion.h1 
              className="text-2xl font-bold mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getTimeOfDayGreeting()}, {session.user?.name?.split(' ')[0] || 'there'}! 👋
            </motion.h1>
            <motion.p 
              className="text-white/80 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </motion.p>
          </div>
        </div>

        {/* Portfolio Balance */}
        <motion.div 
          className="text-right"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <p className="text-white/80 text-sm mb-1">Total Portfolio</p>
          <div className="flex items-center">
            {totalBalance !== null ? (
              <>
                <motion.p 
                  className="text-3xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {formatBalance(totalBalance)}
                </motion.p>
                <motion.div 
                  className="ml-3 px-2 py-1 bg-green-500/20 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <span className="text-xs font-semibold text-green-200">
                    ↗️ +15.2%
                  </span>
                </motion.div>
              </>
            ) : (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-1" style={{ width: '120px' }} />
                <div className="h-4 bg-white/20 rounded" style={{ width: '80px' }} />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div 
        className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="text-center">
          <p className="text-2xl font-semibold">3</p>
          <p className="text-white/70 text-xs">Active Properties</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">12.8%</p>
          <p className="text-white/70 text-xs">Avg. Monthly ROI</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">45d</p>
          <p className="text-white/70 text-xs">Member Since</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeHeader; 