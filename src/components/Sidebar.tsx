'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow';
  requiresAuth?: boolean;
}

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '🏠',
      requiresAuth: true
    },
    {
      label: 'Portfolio',
      href: '/dashboard?tab=portfolio',
      icon: '📊',
      requiresAuth: true
    },
    {
      label: 'Properties',
      href: '/tokens',
      icon: '🏢',
      badge: 'New',
      badgeColor: 'green'
    },
    {
      label: 'Deposit',
      href: '/deposit',
      icon: '💳',
      badge: 'Popular',
      badgeColor: 'blue',
      requiresAuth: true
    },
    {
      label: 'KYC Verification',
      href: '/kyc',
      icon: '✅',
      badge: session ? undefined : 'Required',
      badgeColor: 'red',
      requiresAuth: true
    },
    {
      label: 'Rewards',
      href: '/rewards',
      icon: '🎁',
      requiresAuth: true
    },
    {
      label: 'Activity',
      href: '/dashboard?tab=activity',
      icon: '⚡',
      requiresAuth: true
    },
    {
      label: 'Support',
      href: '/support',
      icon: '💬'
    }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    if (href.includes('?tab=') && pathname === '/dashboard') {
      return false; // Handle tab navigation differently
    }
    return pathname === href;
  };

  const getBadgeStyles = (color: string) => {
    const styles = {
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800'
    };
    return styles[color as keyof typeof styles] || styles.blue;
  };

  // Filter items based on auth status
  const filteredNavItems = navItems.filter(item => 
    !item.requiresAuth || session
  );

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 lg:hidden z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:relative z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${!isCollapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        initial={false}
        animate={{ width: isCollapsed ? 64 : 256 }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <motion.button
            className="flex items-center justify-center w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg 
              className={`h-5 w-5 text-gray-500 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
            {!isCollapsed && (
              <span className="ml-2 text-sm font-medium text-gray-700">
                Collapse
              </span>
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item, index) => {
            const isActive = isActiveLink(item.href);
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <motion.div
                    className={`group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#695936] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#695936]'
                    }`}
                    whileHover={{ x: isActive ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 text-xl">
                      {item.icon}
                    </div>

                    {/* Label and Badge */}
                    {!isCollapsed && (
                      <motion.div 
                        className="flex items-center justify-between flex-1 ml-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                        
                        {item.badge && (
                          <motion.span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeStyles(item.badgeColor || 'blue')}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </motion.div>
                    )}

                    {/* Collapsed state badge */}
                    {isCollapsed && item.badge && (
                      <motion.div
                        className="absolute left-10 top-2 w-2 h-2 bg-red-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      />
                    )}
                  </motion.div>
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-16 top-0 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                    {item.badge && (
                      <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getBadgeStyles(item.badgeColor || 'blue')}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Quick Stats - Only show when expanded and user is logged in */}
        {!isCollapsed && session && (
          <motion.div 
            className="p-4 border-t border-gray-200 mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-r from-[#695936] to-[#7a6a42] rounded-lg p-4 text-white">
              <h4 className="text-sm font-semibold mb-2">Quick Stats</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/80">Portfolio:</span>
                  <span className="font-semibold">$24.7K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">ROI:</span>
                  <span className="font-semibold text-green-200">+15.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Properties:</span>
                  <span className="font-semibold">3</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile toggle button */}
        <motion.button
          className="lg:hidden fixed bottom-4 right-4 bg-[#695936] text-white p-3 rounded-full shadow-lg z-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </motion.aside>
    </>
  );
};

export default Sidebar;