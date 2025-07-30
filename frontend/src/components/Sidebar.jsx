import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import ProfileCard from './ProfileCard';

export default function Sidebar({ profile, onProfileUpdate }) {
  const { user } = useAuth();
  const location = useLocation();

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'Learner': return '/dashboard/learner';
      case 'Creator': return '/dashboard/creator';
      case 'Admin': return '/dashboard/admin';
      default: return '/dashboard';
    }
  };

  const navLinks = [
    { 
      to: getDashboardRoute(), 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    
    // Browse Tracks - only for Learners
    ...(user?.role === 'Learner' ? [{ 
      to: '/tracks', 
      label: 'Browse Tracks', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }] : []),
    
    // My Tracks - only for Creators
    ...(user?.role === 'Creator' ? [{ 
      to: '/dashboard/creator/tracks', 
      label: 'My Tracks', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }] : []),
    
    // Analytics - only for Creators
    ...(user?.role === 'Creator' ? [{ 
      to: '/dashboard/analytics', 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }] : []),
    
    // Admin specific links
    ...(user?.role === 'Admin' ? [
      { 
        to: '/dashboard/users', 
        label: 'Users', 
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      },
    ] : []),
  ];

  // Ensure profile data exists before rendering ProfileCard
  const displayProfile = profile || {
    name: user?.name || 'User',
    role: user?.role || 'Member',
    avatarUrl: '/default-avatar.png'
  };

  return (
    <aside className="relative z-50 min-h-screen w-full max-w-[90vw] sm:w-64 md:w-72 lg:w-80 flex flex-col bg-white dark:bg-gray-800">
      {/* Profile Card */}  
      <div className="p-2 sm:p-4 border-b border-white/20 dark:border-secondary-700/20 mt-116 sm:mt-0 max-w-xs mx-auto">
        <ProfileCard 
          profile={displayProfile} 
          isOwnProfile={true} 
          onUpdate={onProfileUpdate} 
        />
      </div>
  
      {/* Navigation */}
      <nav className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-4">
            Navigation
          </h3>
          {navLinks.map(link => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-soft' 
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-white/50 dark:hover:bg-secondary-800/50 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <div className={`transition-colors duration-200 flex-shrink-0 ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-secondary-500 dark:text-secondary-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'
                }`}>
                  {link.icon}
                </div>
                <span className="truncate">{link.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
  
      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-white/20 dark:border-secondary-700/20">
        <div className="text-center">
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            © 2024 LearnX Platform
          </p>
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}