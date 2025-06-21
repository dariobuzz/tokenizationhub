'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// Add this helper function to check for admin role
const isAdmin = (session: any): boolean => {
  return session?.user?.role === 'admin';
};

const Sidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tokens', label: 'Token Portfolio', icon: '💰' },
    { path: '/deposit', label: 'Deposit Funds', icon: '💸' },
    { path: '/rewards', label: 'Rewards & Claims', icon: '🏆' },
    { path: '/kyc', label: 'KYC Verification', icon: '🔐' },
  ];

  // Admin menu items
  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: '⚙️' },
    { path: '/admin/kyc', label: 'KYC Management', icon: '🔍' },
    { path: '/admin/deposits', label: 'User Deposits', icon: '💲' },
  ];

  return (
    <motion.div 
      className="w-64 bg-white shadow-md h-screen"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <motion.h2 
          className="text-xl font-semibold text-gray-800 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Menu
        </motion.h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.li 
                key={item.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link 
                  href={item.path} 
                  className={`flex items-center px-4 py-2 rounded transition-all duration-200 ${
                    pathname === item.path 
                      ? 'bg-[#695936] text-white' 
                      : 'text-[#695936] hover:bg-blue-50'
                  }`}
                  onMouseEnter={() => setIsHovered(item.path)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <motion.span
                    animate={{ 
                      x: isHovered === item.path ? 5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.label}
                  </motion.span>
                  {pathname === item.path && (
                    <motion.div 
                      className="w-1 h-full bg-white absolute right-0"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              </motion.li>
            ))}
            
            {/* Admin menu items - only shown if user has admin role */}
            {isAdmin(session) && (
              <>
                <motion.li 
                  className="pt-4 border-t mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="px-4 py-2 text-sm font-medium text-gray-500">
                    Admin Controls
                  </div>
                </motion.li>
                
                {adminMenuItems.map((item, index) => (
                  <motion.li 
                    key={item.path}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (0.1 * index) }}
                  >
                    <Link 
                      href={item.path} 
                      className={`flex items-center px-4 py-2 rounded transition-all duration-200 ${
                        pathname === item.path 
                          ? 'bg-[#695936] text-white' 
                          : 'text-[#695936] hover:bg-blue-50'
                      }`}
                      onMouseEnter={() => setIsHovered(item.path)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <motion.span
                        animate={{ 
                          x: isHovered === item.path ? 5 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {item.label}
                      </motion.span>
                      {pathname === item.path && (
                        <motion.div 
                          className="w-1 h-full bg-white absolute right-0"
                          layoutId="adminActiveIndicator"
                        />
                      )}
                    </Link>
                  </motion.li>
                ))}
              </>
            )}
           
            {/* Conditional rendering based on authentication status */}
            <motion.li 
              className="pt-4 border-t mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {session ? (
                <motion.button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center w-full text-left px-4 py-2 text-white bg-[#695936] hover:bg-[#7a6a42] rounded"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="mr-3">👋</span>
                  Logout
                </motion.button>
              ) : (
                <Link href="/login" className="flex items-center px-4 py-2 text-[#695936] hover:bg-blue-50 rounded">
                  <span className="mr-3">🔑</span>
                  Login
                </Link>
              )}
            </motion.li>
            {/* Add Registration as a separate list item */}
            {!session && (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Link 
                  href="/registration" 
                  className="flex items-center px-4 py-2 text-white bg-[#695936] hover:bg-[#7a6a42] rounded mt-2"
                >
                  <span className="mr-3">✏️</span>
                  Registration
                </Link>
              </motion.li>
            )}
          </ul>
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;