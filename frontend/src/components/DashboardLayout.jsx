import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ profile, onProfileUpdate, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-primary-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-200/20 dark:bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Enhanced overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 md:hidden transition-all duration-300 ease-out" 
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"></div>
        </div>
      )}
      
      {/* Enhanced Sidebar */}
      <div className={`z-50 w-64 max-w-[90vw] sm:w-72 md:w-80 glass border-r border-white/30 dark:border-secondary-600/30 shadow-2xl shadow-primary-500/5 dark:shadow-primary-400/5
        fixed inset-y-0 left-0 transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0 scale-100' : '-translate-x-full scale-95'}
        md:relative md:inset-y-auto md:left-auto md:fixed-none md:translate-x-0 md:scale-100 md:flex md:flex-col`}
      >
        {/* Sidebar glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 dark:from-primary-400/5 dark:to-secondary-400/5 rounded-lg blur-xl"></div>
        
        <Sidebar 
          profile={profile} 
          onProfileUpdate={onProfileUpdate} 
        />
      </div>
      
      {/* Main content */}
      <main className="flex-1 min-h-screen relative z-10">
        {/* Enhanced Mobile header */}
        <div className="md:hidden glass border-b border-white/30 dark:border-secondary-600/30 backdrop-blur-xl shadow-lg shadow-primary-500/5 dark:shadow-primary-400/5">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Enhanced menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="group relative p-3 rounded-xl bg-white/60 dark:bg-secondary-800/60 hover:bg-white/80 dark:hover:bg-secondary-700/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-6 h-6 text-secondary-700 dark:text-secondary-300 relative z-10 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Enhanced logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl blur-sm opacity-75"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-400 dark:via-primary-500 dark:to-primary-600 bg-clip-text text-transparent font-display tracking-tight">
                LearnX
              </span>
            </div>
            
            {/* Enhanced spacer with subtle indicator */}
            <div className="w-10 flex justify-center">
              <div className="w-2 h-2 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Content area */}
        <div className="relative">
          {/* Content glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/20 to-transparent dark:via-primary-900/10 pointer-events-none"></div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}