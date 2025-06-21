'use client';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const Layout = ({ children, hideSidebar = false }: LayoutProps) => {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          {!hideSidebar && <Sidebar />}
          <main className={`${hideSidebar ? 'w-full' : 'flex-1'} p-6`}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
};

export default Layout;