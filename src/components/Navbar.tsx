'use client';
import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const pathMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/deposit': 'Deposit Funds',
      '/tokens': 'Properties',
      '/kyc': 'KYC Verification',
      '/rewards': 'Rewards',
      '/support': 'Support'
    };
    
    return pathMap[pathname] || 'TokenizeHub';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const notifications = [
    {
      id: 1,
      title: 'Deposit Confirmed',
      message: 'Your $5,000 USDT deposit has been processed',
      time: '5m ago',
      type: 'success',
      unread: true
    },
    {
      id: 2,
      title: 'KYC Approved',
      message: 'Your identity verification is complete',
      time: '2h ago',
      type: 'info',
      unread: true
    },
    {
      id: 3,
      title: 'Monthly Dividend',
      message: 'You received $125 from Palm Jumeirah Villa',
      time: '1d ago',
      type: 'success',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Breadcrumb */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Image 
                src="/SUN_LOGO.png" 
                alt="TokenizeHub" 
                width={40} 
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold text-[#695936] hidden sm:block">
                TokenizeHub
              </span>
            </Link>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 font-medium">{getBreadcrumbs()}</span>
            </div>
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {session && (
              <>
                {/* Search - Hidden on mobile */}
                <div className="hidden lg:block">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search properties, transactions..."
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936] text-sm"
                    />
                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#695936] rounded-lg"
                    onClick={() => setShowNotifications(!showNotifications)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-2-2V9a7 7 0 00-14 0v6l-2 2h5m12 0v1a3 3 0 01-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            <button className="text-sm text-[#695936] hover:text-[#7a6a42]">
                              Mark all read
                            </button>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                                notification.unread ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                  <p className="text-sm text-gray-500">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-gray-100">
                          <Link href="/notifications" className="text-sm text-[#695936] hover:text-[#7a6a42] font-medium">
                            View all notifications →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <motion.button
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#695936]"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#695936] flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-white">
                          {getInitials(session.user?.name || session.user?.email || 'U')}
                        </span>
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                          </Link>
                          <Link
                            href="/security"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Security
                          </Link>
                          <hr className="my-1" />
                          <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!session && (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="text-gray-700 hover:text-[#695936] font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/registration"
                  className="bg-[#695936] text-white px-4 py-2 rounded-lg hover:bg-[#7a6a42] transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showProfileMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;