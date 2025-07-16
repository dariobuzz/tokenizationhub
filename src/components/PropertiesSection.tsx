'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { LoadingSpinner, CardSkeleton } from './LoadingStates';

interface Property {
  id: string;
  name: string;
  location: string;
  value: number;
  tokensAvailable: number;
  tokenPrice: number;
  projectedROI: number;
  completionDate: string;
  minimumInvestment: number;
  status: 'available' | 'funding' | 'completed' | 'coming-soon';
  features: string[];
  description: string;
  images: string[];
  totalTokens: number;
  raisedAmount: number;
  investorCount: number;
  propertyType: 'residential' | 'commercial' | 'mixed' | 'hospitality';
  developer: string;
  area: number; // sqft
}

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onInvest: (property: Property) => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, isOpen, onClose, onInvest }) => {
  if (!property) return null;

  const fundingProgress = (property.raisedAmount / property.value) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Property Image Header */}
            <div className="relative h-64 bg-gradient-to-r from-[#695936] to-[#8B7355]">
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{property.name}</h2>
                    <p className="text-xl opacity-90">{property.location}</p>
                    <p className="text-lg opacity-75 mt-1">{property.developer}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Status Badge */}
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === 'available' ? 'bg-green-500 text-white' :
                    property.status === 'funding' ? 'bg-blue-500 text-white' :
                    property.status === 'completed' ? 'bg-gray-500 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    {property.status === 'available' ? '🟢 Available for Investment' :
                     property.status === 'funding' ? '🔵 Funding in Progress' :
                     property.status === 'completed' ? '⚫ Fully Funded' :
                     '🟠 Coming Soon'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {/* Investment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Property Value</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    ${property.value.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Projected ROI</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {property.projectedROI}% p.a.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Min. Investment</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    ${property.minimumInvestment.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold">Funding Progress</h4>
                  <span className="text-sm text-gray-500">{Math.round(fundingProgress)}% Complete</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <motion.div
                    className="bg-gradient-to-r from-[#695936] to-[#8B7355] h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${fundingProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">${property.raisedAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Raised</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{property.investorCount}</p>
                    <p className="text-sm text-gray-500">Investors</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{property.tokensAvailable.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Tokens Available</p>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Property Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{property.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Area:</span>
                      <span className="font-medium">{property.area.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Completion:</span>
                      <span className="font-medium">{property.completionDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Token Price:</span>
                      <span className="font-medium">${property.tokenPrice}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {property.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#695936] rounded-full"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">About This Property</h4>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {property.status === 'available' && (
                <button
                  onClick={() => onInvest(property)}
                  className="px-6 py-3 bg-[#695936] text-white rounded-lg font-medium hover:bg-[#7a6a42] transition-colors flex items-center space-x-2"
                >
                  <span>💳</span>
                  <span>Invest Now</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PropertyCard: React.FC<{ property: Property; onClick: () => void; index: number }> = ({ 
  property, 
  onClick, 
  index 
}) => {
  const fundingProgress = (property.raisedAmount / property.value) * 100;
  
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      {/* Property Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#695936] to-[#8B7355] overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            property.status === 'available' ? 'bg-green-500 text-white' :
            property.status === 'funding' ? 'bg-blue-500 text-white' :
            property.status === 'completed' ? 'bg-gray-500 text-white' :
            'bg-orange-500 text-white'
          }`}>
            {property.status === 'available' ? 'Available' :
             property.status === 'funding' ? 'Funding' :
             property.status === 'completed' ? 'Completed' :
             'Coming Soon'}
          </span>
        </div>
        
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-bold mb-1">{property.name}</h3>
          <p className="text-sm opacity-90">{property.location}</p>
        </div>
        
        <div className="absolute top-4 right-4 text-white">
          <span className="text-2xl opacity-75">
            {property.propertyType === 'residential' ? '🏠' :
             property.propertyType === 'commercial' ? '🏢' :
             property.propertyType === 'mixed' ? '🏗️' : '🏨'}
          </span>
        </div>
      </div>

      {/* Property Info */}
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Property Value</p>
            <p className="text-lg font-bold text-gray-900">
              ${property.value.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Projected ROI</p>
            <p className="text-lg font-bold text-green-600">
              {property.projectedROI}% p.a.
            </p>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Funding Progress</span>
            <span className="text-sm font-medium">{Math.round(fundingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#695936] to-[#8B7355] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${fundingProgress}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
            />
          </div>
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Min. Investment</p>
            <p className="font-medium">${property.minimumInvestment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Completion</p>
            <p className="font-medium">{property.completionDate}</p>
          </div>
        </div>

        {/* View Details Button */}
        <motion.button
          className="w-full mt-4 bg-[#695936] text-white py-2 rounded-lg font-medium group-hover:bg-[#7a6a42] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

const PropertiesSection: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'funding' | 'completed'>('all');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProperties: Property[] = [
        {
          id: '1',
          name: 'Palm Jumeirah Elite Villa',
          location: 'Palm Jumeirah, Dubai',
          value: 2500000,
          tokensAvailable: 1750000,
          tokenPrice: 1,
          projectedROI: 12.5,
          completionDate: 'Q2 2025',
          minimumInvestment: 1000,
          status: 'available',
          features: [
            'Beachfront Location',
            'Private Pool & Garden',
            '5 Bedrooms, 6 Bathrooms',
            'Smart Home Technology',
            'Concierge Services',
            '24/7 Security'
          ],
          description: 'An exclusive beachfront villa on the iconic Palm Jumeirah, offering luxury living with stunning views of the Arabian Gulf. This property represents the pinnacle of Dubai real estate investment.',
          images: ['/palm.jpeg'],
          totalTokens: 2500000,
          raisedAmount: 750000,
          investorCount: 127,
          propertyType: 'residential',
          developer: 'Emaar Properties',
          area: 8500
        },
        {
          id: '2',
          name: 'Downtown Dubai Business Tower',
          location: 'Downtown Dubai, DIFC',
          value: 8500000,
          tokensAvailable: 5950000,
          tokenPrice: 1,
          projectedROI: 15.2,
          completionDate: 'Q4 2024',
          minimumInvestment: 2500,
          status: 'funding',
          features: [
            'Prime DIFC Location',
            'Grade A Office Space',
            'Modern Architecture',
            'Sustainability Certified',
            'Metro Connectivity',
            'Premium Amenities'
          ],
          description: 'A state-of-the-art commercial tower in the heart of Dubai\'s financial district, designed for modern businesses and offering exceptional returns through premium office leasing.',
          images: ['/palm.jpeg'],
          totalTokens: 8500000,
          raisedAmount: 2550000,
          investorCount: 283,
          propertyType: 'commercial',
          developer: 'Damac Properties',
          area: 150000
        },
        {
          id: '3',
          name: 'Marina Waterfront Residence',
          location: 'Dubai Marina',
          value: 1800000,
          tokensAvailable: 1080000,
          tokenPrice: 1,
          projectedROI: 10.8,
          completionDate: 'Q1 2025',
          minimumInvestment: 500,
          status: 'available',
          features: [
            'Marina Views',
            'Luxury Amenities',
            '2-3 Bedroom Apartments',
            'Rooftop Pool',
            'Gym & Spa',
            'Retail Podium'
          ],
          description: 'Modern residential complex offering breathtaking marina views and world-class amenities. Perfect for investors seeking steady rental yields in Dubai\'s most sought-after waterfront community.',
          images: ['/palm.jpeg'],
          totalTokens: 1800000,
          raisedAmount: 720000,
          investorCount: 96,
          propertyType: 'residential',
          developer: 'Sobha Realty',
          area: 45000
        },
        {
          id: '4',
          name: 'Expo City Mixed Development',
          location: 'Expo City Dubai',
          value: 4200000,
          tokensAvailable: 0,
          tokenPrice: 1,
          projectedROI: 14.0,
          completionDate: 'Q3 2024',
          minimumInvestment: 1500,
          status: 'completed',
          features: [
            'Mixed-Use Development',
            'Expo Legacy Project',
            'Sustainable Design',
            'Transportation Hub',
            'Entertainment District',
            'Innovation Center'
          ],
          description: 'A landmark mixed-use development in the new Expo City, combining residential, commercial, and entertainment spaces. This project represents the future of urban living in Dubai.',
          images: ['/palm.jpeg'],
          totalTokens: 4200000,
          raisedAmount: 4200000,
          investorCount: 456,
          propertyType: 'mixed',
          developer: 'Dubai Holding',
          area: 95000
        },
        {
          id: '5',
          name: 'Luxury Resort & Spa',
          location: 'Jumeirah Beach, Dubai',
          value: 12000000,
          tokensAvailable: 12000000,
          tokenPrice: 1,
          projectedROI: 16.5,
          completionDate: 'Q1 2026',
          minimumInvestment: 5000,
          status: 'coming-soon',
          features: [
            'Beachfront Resort',
            '200+ Guest Rooms',
            'World-Class Spa',
            'Multiple Restaurants',
            'Conference Facilities',
            'Private Beach Access'
          ],
          description: 'An ultra-luxury beachfront resort and spa development on Jumeirah Beach, designed to attract high-end tourists and generate substantial hospitality revenues.',
          images: ['/palm.jpeg'],
          totalTokens: 12000000,
          raisedAmount: 0,
          investorCount: 0,
          propertyType: 'hospitality',
          developer: 'Atlantis Resorts',
          area: 250000
        }
      ];
      
      setProperties(mockProperties);
      setLoading(false);
    };

    fetchProperties();
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  const handleInvestClick = (property: Property) => {
    setModalOpen(false);
    // Redirect to investment flow
    console.log('Investing in:', property.name);
  };

  const filteredProperties = properties.filter(property => 
    filter === 'all' || property.status === filter
  );

  const totalValue = properties.reduce((sum, property) => sum + property.value, 0);
  const availableProperties = properties.filter(p => p.status === 'available').length;
  const totalInvestors = properties.reduce((sum, property) => sum + property.investorCount, 0);

  const filterOptions = [
    { value: 'all', label: 'All Properties', count: properties.length },
    { value: 'available', label: 'Available', count: properties.filter(p => p.status === 'available').length },
    { value: 'funding', label: 'Funding', count: properties.filter(p => p.status === 'funding').length },
    { value: 'completed', label: 'Funded', count: properties.filter(p => p.status === 'completed').length },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        
        {/* Properties Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Dubai Skyline */}
      <motion.div
        className="relative h-64 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src="/palm.jpeg"
          alt="Dubai Skyline"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        
        <div className="relative z-10 p-8 text-white h-full flex flex-col justify-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Dubai Real Estate
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl opacity-90 mb-6 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Invest in premium Dubai properties through fractional ownership. 
            Own a piece of the world's most dynamic real estate market.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="text-sm opacity-75">Portfolio Value</span>
              <p className="text-lg font-bold">${(totalValue / 1000000).toFixed(1)}M+</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="text-sm opacity-75">Available Properties</span>
              <p className="text-lg font-bold">{availableProperties}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="text-sm opacity-75">Total Investors</span>
              <p className="text-lg font-bold">{totalInvestors}+</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Portfolio Overview Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-[#695936]/10 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-green-600 font-medium">+12.8%</span>
            <span className="text-gray-500 ml-1">from last quarter</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average ROI</p>
              <p className="text-2xl font-bold text-gray-900">13.8%</p>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-green-600 font-medium">+2.1%</span>
            <span className="text-gray-500 ml-1">above market</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Investors</p>
              <p className="text-2xl font-bold text-gray-900">{totalInvestors}+</p>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-green-600 font-medium">+45</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investment Opportunities</h2>
          <p className="text-gray-500">Discover premium Dubai real estate investments</p>
        </div>

        <div className="flex space-x-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === option.value
                  ? 'bg-[#695936] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Properties Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {filteredProperties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={() => handlePropertyClick(property)}
            index={index}
          />
        ))}
      </motion.div>

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onInvest={handleInvestClick}
      />
    </div>
  );
};

export default PropertiesSection; 