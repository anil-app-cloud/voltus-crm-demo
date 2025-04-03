import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
        <Header />
        <main className="flex-1 p-6 mt-16 transition-all duration-300 ease-in-out dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 