'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingStates';

interface Reward {
  id: string;
  name: string;
  amount: number;
  status: 'claimable' | 'pending' | 'claimed';
  type: 'dividend' | 'referral' | 'bonus' | 'staking';
  description: string;
  claimDeadline?: string;
  source: string;
  earnedDate: string;
  icon: string;
}

interface RewardCardProps {
  reward: Reward;
  onClaim: (reward: Reward) => void;
  index: number;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, onClaim, index }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'claimable':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '💰',
          text: 'Ready to Claim'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
          text: 'Processing'
        };
      case 'claimed':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '✅',
          text: 'Claimed'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📋',
          text: status
        };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dividend': return 'bg-blue-50 text-blue-700';
      case 'referral': return 'bg-purple-50 text-purple-700';
      case 'bonus': return 'bg-orange-50 text-orange-700';
      case 'staking': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const statusConfig = getStatusConfig(reward.status);
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-[#695936]/10 flex items-center justify-center">
            <span className="text-xl">{reward.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{reward.name}</h3>
            <p className="text-sm text-gray-500">{reward.source}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatAmount(reward.amount)}
          </p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reward.type)}`}>
            {reward.type}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        {reward.description}
      </p>

      {/* Status and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <span className="mr-1">{statusConfig.icon}</span>
            {statusConfig.text}
          </span>
          {reward.claimDeadline && reward.status === 'claimable' && (
            <span className="text-xs text-orange-600 font-medium">
              Expires {reward.claimDeadline}
            </span>
          )}
        </div>

        {reward.status === 'claimable' && (
          <motion.button
            className="bg-[#695936] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a6a42] transition-colors"
            onClick={() => onClaim(reward)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Claim Now
          </motion.button>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-400">
          Earned on {reward.earnedDate}
        </p>
      </div>
    </motion.div>
  );
};

const ClaimModal: React.FC<{
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reward: Reward) => void;
  isLoading: boolean;
}> = ({ reward, isOpen, onClose, onConfirm, isLoading }) => {
  if (!reward) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{reward.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Claim Reward</h3>
              <p className="text-gray-500 mt-1">Confirm your reward claim</p>
            </div>

            {/* Reward Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900">{reward.name}</p>
                  <p className="text-sm text-gray-500">{reward.source}</p>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {formatAmount(reward.amount)}
                </p>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {reward.description}
              </p>
              
              <div className="text-xs text-gray-500">
                <p>Type: {reward.type}</p>
                <p>Earned: {reward.earnedDate}</p>
                {reward.claimDeadline && (
                  <p className="text-orange-600 font-medium">
                    Expires: {reward.claimDeadline}
                  </p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Claimed rewards will be added to your account balance within 24 hours. 
                Transaction fees may apply for certain reward types.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <motion.button
                className="flex-1 bg-[#695936] text-white py-3 rounded-lg font-medium hover:bg-[#7a6a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={() => onConfirm(reward)}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Claiming...</span>
                  </>
                ) : (
                  'Confirm Claim'
                )}
              </motion.button>
              
              <motion.button
                className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={onClose}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RewardsSection: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [filter, setFilter] = useState<'all' | 'claimable' | 'pending' | 'claimed'>('all');

  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockRewards: Reward[] = [
        {
          id: '1',
          name: 'Q4 Property Dividends',
          amount: 1250.00,
          status: 'claimable',
          type: 'dividend',
          description: 'Quarterly dividends from Dubai Elite Property and Palm Jumeirah Villa investments.',
          claimDeadline: 'Dec 31, 2024',
          source: 'Real Estate Portfolio',
          earnedDate: 'Dec 1, 2024',
          icon: '🏢'
        },
        {
          id: '2',
          name: 'Referral Bonus',
          amount: 500.00,
          status: 'claimable',
          type: 'referral',
          description: 'Bonus for referring 3 new investors to the platform this month.',
          claimDeadline: 'Jan 15, 2025',
          source: 'Referral Program',
          earnedDate: 'Dec 15, 2024',
          icon: '👥'
        },
        {
          id: '3',
          name: 'Staking Rewards',
          amount: 320.75,
          status: 'pending',
          type: 'staking',
          description: 'Monthly staking rewards from locked DRT tokens in the liquidity pool.',
          source: 'DeFi Staking',
          earnedDate: 'Dec 20, 2024',
          icon: '🔒'
        },
        {
          id: '4',
          name: 'Early Investor Bonus',
          amount: 800.00,
          status: 'claimed',
          type: 'bonus',
          description: 'Special bonus for being among the first 100 investors on the platform.',
          source: 'Platform Rewards',
          earnedDate: 'Nov 1, 2024',
          icon: '🎉'
        }
      ];
      
      setRewards(mockRewards);
      setLoading(false);
    };

    fetchRewards();
  }, []);

  const handleClaimReward = (reward: Reward) => {
    setSelectedReward(reward);
    setClaimModalOpen(true);
  };

  const handleConfirmClaim = async (reward: Reward) => {
    setIsClaiming(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update reward status
    setRewards(prev => prev.map(r => 
      r.id === reward.id 
        ? { ...r, status: 'claimed' as const }
        : r
    ));
    
    setIsClaiming(false);
    setClaimModalOpen(false);
    setSelectedReward(null);
  };

  const filteredRewards = rewards.filter(reward => 
    filter === 'all' || reward.status === filter
  );

  const totalClaimable = rewards
    .filter(r => r.status === 'claimable')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalEarned = rewards.reduce((sum, r) => sum + r.amount, 0);

  const filterOptions = [
    { value: 'all', label: 'All', count: rewards.length },
    { value: 'claimable', label: 'Claimable', count: rewards.filter(r => r.status === 'claimable').length },
    { value: 'pending', label: 'Pending', count: rewards.filter(r => r.status === 'pending').length },
    { value: 'claimed', label: 'Claimed', count: rewards.filter(r => r.status === 'claimed').length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rewards & Claims</h2>
          <p className="text-gray-500 mt-1">Manage your earnings and claim available rewards</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-green-100 text-sm">Available to Claim</p>
              <p className="text-2xl font-bold">
                ${totalClaimable.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Rewards</p>
              <p className="text-2xl font-bold text-gray-900">
                {rewards.filter(r => r.status !== 'claimed').length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div 
        className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filterOptions.map((option) => (
          <motion.button
            key={option.value}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              filter === option.value
                ? 'bg-white text-[#695936] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setFilter(option.value as any)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {option.label} ({option.count})
          </motion.button>
        ))}
      </motion.div>

      {/* Rewards Grid */}
      {filteredRewards.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredRewards.map((reward, index) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onClaim={handleClaimReward}
              index={index}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎁</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You don't have any rewards yet. Start investing to earn rewards!"
              : `No ${filter} rewards at the moment.`
            }
          </p>
        </motion.div>
      )}

      {/* Claim Modal */}
      <ClaimModal
        reward={selectedReward}
        isOpen={claimModalOpen}
        onClose={() => {
          setClaimModalOpen(false);
          setSelectedReward(null);
        }}
        onConfirm={handleConfirmClaim}
        isLoading={isClaiming}
      />
    </div>
  );
};

export default RewardsSection;