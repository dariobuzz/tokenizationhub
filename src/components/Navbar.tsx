'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <motion.nav 
      className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="mr-2"
          >
            🏢
          </motion.div>
          <motion.span 
            className="text-xl font-bold text-[#695936]"
            whileHover={{ scale: 1.05 }}
          >
            TokenizeHub
          </motion.span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center space-x-6">
        <Link href="/dashboard">
          <motion.span 
            className="text-[#695936] hover:text-[#7a6a42]"
            whileHover={{ y: -2 }}
          >
            Dashboard
          </motion.span>
        </Link>
        <Link href="/tokens">
          <motion.span 
            className="text-[#695936] hover:text-[#7a6a42]"
            whileHover={{ y: -2 }}
          >
            Tokens
          </motion.span>
        </Link>
        <Link href="/deposit">
          <motion.span 
            className="text-[#695936] hover:text-[#7a6a42]"
            whileHover={{ y: -2 }}
          >
            Deposit
          </motion.span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {status === 'loading' ? (
          <motion.div 
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.98, 1, 0.98]
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="bg-gray-100 px-4 py-2 rounded-lg"
          >
            Loading...
          </motion.div>
        ) : session?.user ? (
          <motion.div 
            className="flex items-center bg-gray-100 px-4 py-2 rounded-lg cursor-pointer"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-8 h-8 rounded-full bg-[#695936] flex items-center justify-center text-white mr-3">
              {session.user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <span className="text-gray-700 font-medium block">
                {session.user.name || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                ID: {session.user.id?.substring(0, 8) || 'Unknown'}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-[#695936] border border-[#695936] rounded-lg hover:bg-[#695936] hover:text-white transition-colors"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-[#695936] text-white rounded-lg hover:bg-[#7a6a42] transition-colors"
            >
              Register
            </motion.button>
          </div>
        )}
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            className="text-[#695936]"
          >
            {isMenuOpen ? '✕' : '☰'}
          </motion.button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          className="absolute top-full left-0 right-0 bg-white shadow-md p-4 md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex flex-col space-y-3">
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
              <span className="block py-2 px-4 hover:bg-gray-100 rounded">Dashboard</span>
            </Link>
            <Link href="/tokens" onClick={() => setIsMenuOpen(false)}>
              <span className="block py-2 px-4 hover:bg-gray-100 rounded">Tokens</span>
            </Link>
            <Link href="/deposit" onClick={() => setIsMenuOpen(false)}>
              <span className="block py-2 px-4 hover:bg-gray-100 rounded">Deposit</span>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;