'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner, CardSkeleton, EmptyState } from './LoadingStates';

interface Token {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change24h: number;
  quantity: number;
  status: 'active' | 'pending' | 'locked';
  icon?: string;
  description?: string;
  lastUpdate: string;
}

interface TokenCardProps {
  token: Token;
  onView: (token: Token) => void;
  onTrade: (token: Token) => void;
  index: number;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, onView, onTrade, index }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'locked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={() => onView(token)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-[#695936]/10 flex items-center justify-center">
            <span className="text-xl">{token.icon || '🏢'}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-[#695936] transition-colors">
              {token.name}
            </h3>
            <p className="text-sm text-gray-500">{token.symbol}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(token.status)}`}>
          {token.status}
        </span>
      </div>

      {/* Value and Change */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(token.value)}
          </p>
          <p className={`text-sm font-medium ${getChangeColor(token.change24h)}`}>
            {formatChange(token.change24h)}
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {token.quantity.toLocaleString()} tokens
        </p>
      </div>

      {/* Description */}
      {token.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {token.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-100">
        <motion.button
          className="flex-1 bg-[#695936] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#7a6a42] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onTrade(token);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={token.status === 'locked'}
        >
          {token.status === 'locked' ? 'Locked' : 'Trade'}
        </motion.button>
        <motion.button
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onView(token);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Details
        </motion.button>
      </div>

      {/* Last Update */}
      <p className="text-xs text-gray-400 mt-3">
        Updated {token.lastUpdate}
      </p>
    </motion.div>
  );
};

const TokenManagement: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');

  useEffect(() => {
    // Simulate API call
    const fetchTokens = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTokens: Token[] = [
        {
          id: '1',
          name: 'Dubai Elite Property',
          symbol: 'DRT',
          value: 8245.30,
          change24h: 5.2,
          quantity: 1500,
          status: 'active',
          icon: '🏢',
          description: 'Luxury real estate tokens representing premium Dubai properties in prime locations.',
          lastUpdate: '2 minutes ago'
        },
        {
          id: '2',
          name: 'Palm Jumeirah Villa',
          symbol: 'PJV',
          value: 12120.75,
          change24h: -2.1,
          quantity: 800,
          status: 'active',
          icon: '🏖️',
          description: 'Exclusive villa tokens from the iconic Palm Jumeirah development.',
          lastUpdate: '5 minutes ago'
        },
        {
          id: '3',
          name: 'Marina Tower Complex',
          symbol: 'MTC',
          value: 6780.25,
          change24h: 12.8,
          quantity: 2200,
          status: 'pending',
          icon: '🏗️',
          description: 'Modern tower complex in Dubai Marina with stunning waterfront views.',
          lastUpdate: '1 hour ago'
        },
        {
          id: '4',
          name: 'Downtown Business Hub',
          symbol: 'DBH',
          value: 15500.40,
          change24h: 8.4,
          quantity: 650,
          status: 'locked',
          icon: '🏙️',
          description: 'Commercial real estate in the heart of Downtown Dubai business district.',
          lastUpdate: '3 hours ago'
        }
      ];
      
      setTokens(mockTokens);
      setLoading(false);
    };

    fetchTokens();
  }, []);

  const handleViewToken = (token: Token) => {
    setSelectedToken(token);
  };

  const handleTradeToken = (token: Token) => {
    console.log('Trading token:', token.symbol);
    // Implement trade logic
  };

  const filteredTokens = tokens
    .filter(token => filterStatus === 'all' || token.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'value': return b.value - a.value;
        case 'change': return b.change24h - a.change24h;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
  const totalChange = tokens.reduce((sum, token) => sum + token.change24h, 0) / tokens.length;

  const filterOptions = [
    { value: 'all', label: 'All Tokens', count: tokens.length },
    { value: 'active', label: 'Active', count: tokens.filter(t => t.status === 'active').length },
    { value: 'pending', label: 'Pending', count: tokens.filter(t => t.status === 'pending').length },
    { value: 'locked', label: 'Locked', count: tokens.filter(t => t.status === 'locked').length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
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
          <h2 className="text-2xl font-bold text-gray-900">Token Portfolio</h2>
          <p className="text-gray-500 mt-1">Manage your real estate token investments</p>
        </div>
        
        <motion.button 
          className="bg-[#695936] text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-[#7a6a42] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Explore Properties</span>
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="text-xl">💼</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Portfolio</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. 24h Change</p>
              <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Tokens</p>
              <p className="text-2xl font-bold text-gray-900">
                {tokens.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Status Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {filterOptions.map((option) => (
            <motion.button
              key={option.value}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                filterStatus === option.value
                  ? 'bg-white text-[#695936] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setFilterStatus(option.value as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option.label} ({option.count})
            </motion.button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#695936] focus:border-[#695936]"
        >
          <option value="value">Sort by Value</option>
          <option value="change">Sort by Change</option>
          <option value="name">Sort by Name</option>
        </select>
      </motion.div>

      {/* Tokens Grid */}
      {filteredTokens.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredTokens.map((token, index) => (
            <TokenCard
              key={token.id}
              token={token}
              onView={handleViewToken}
              onTrade={handleTradeToken}
              index={index}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No tokens found"
          message="No tokens match your current filter criteria. Try adjusting your filters or explore new properties."
          actionLabel="Explore Properties"
          onAction={() => console.log('Navigate to properties')}
        />
      )}

      {/* Token Detail Modal */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedToken(null)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#695936]/10 flex items-center justify-center">
                  <span className="text-xl">{selectedToken.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedToken.name}</h3>
                  <p className="text-gray-500">{selectedToken.symbol}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Current Value</p>
                  <p className="text-2xl font-bold">${selectedToken.value.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Your Holdings</p>
                  <p className="font-semibold">{selectedToken.quantity.toLocaleString()} tokens</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">24h Change</p>
                  <p className={`font-semibold ${selectedToken.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h}%
                  </p>
                </div>
                
                {selectedToken.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm">{selectedToken.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  className="flex-1 bg-[#695936] text-white py-2 rounded-lg font-medium hover:bg-[#7a6a42] transition-colors"
                  onClick={() => handleTradeToken(selectedToken)}
                >
                  Trade
                </button>
                <button 
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedToken(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenManagement;