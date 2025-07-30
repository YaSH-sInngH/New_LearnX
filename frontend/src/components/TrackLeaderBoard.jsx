import React, { useEffect, useState } from 'react';
import { getTrackLeaderboard } from '../api/profile';
import { Link } from 'react-router-dom';

export default function TrackLeaderboard({ trackId }) {
  const [leaders, setLeaders] = useState([]);
  useEffect(() => {
    getTrackLeaderboard(trackId).then(setLeaders);
  }, [trackId]);
  return (
    <div className="card p-4 sm:p-5 md:p-6 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-xl"></div>
      
      {/* Enhanced header with icon */}
      <div className="relative mb-4 sm:mb-5">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-2 bg-gradient-to-r from-warning-400 to-warning-500 rounded-lg shadow-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-secondary-900 dark:text-white">Top Learners</h3>
        </div>
        <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
      </div>
      
      {/* Enhanced leaderboard list */}
      <div className="relative">
        <ol className="space-y-2 sm:space-y-3">
          {leaders.map((entry, i) => (
            entry.user ? (
              <li key={entry.user.id} className="group">
                <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg transition-all duration-300 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 hover:shadow-md">
                  {/* Enhanced position indicator */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 group-hover:scale-110 ${
                      i === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                      i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                      i === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                      'bg-gradient-to-r from-secondary-200 to-secondary-300 dark:from-secondary-700 dark:to-secondary-600 text-secondary-700 dark:text-secondary-300'
                    }`}>
                      {i + 1}
                    </div>
                    {/* Medal icons for top 3 */}
                    {i < 3 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4">
                        <svg className={`w-full h-full ${
                          i === 0 ? 'text-yellow-500' :
                          i === 1 ? 'text-gray-400' :
                          'text-orange-500'
                        }`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced avatar with status ring */}
                  <div className="relative flex-shrink-0">
                    <Link to={entry.user.id ? `/profile/${entry.user.id}` : '#'}>
                      <img 
                        src={entry.user.avatarUrl || '/default-avatar.png'} 
                        alt={entry.user.name}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white dark:border-secondary-700 shadow-lg ring-2 ring-primary-500/20 transition-all duration-300 group-hover:ring-primary-500/40"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </Link>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-success-500 border-2 border-white dark:border-secondary-800 rounded-full shadow-sm animate-pulse"></div>
                  </div>
                  
                  {/* Enhanced name and details */}
                  <div className="flex-1 min-w-0">
                    <Link to={entry.user.id ? `/profile/${entry.user.id}` : '#'} className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      <span className="text-sm sm:text-base font-semibold text-secondary-900 dark:text-white truncate block">
                        {entry.user.name}
                      </span>
                    </Link>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Rank #{i + 1}</span>
                    </div>
                  </div>
                  
                  {/* Enhanced stats section */}
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    {/* Progress indicator */}
                    <div className="flex items-center space-x-1 bg-secondary-100 dark:bg-secondary-800 px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                        {entry.progress}%
                      </span>
                    </div>
                    
                    {/* XP badge */}
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded-full shadow-lg">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L13.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <span className="text-xs font-bold">
                        {entry.xp}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar visualization */}
                <div className="mt-1 mx-2 sm:mx-3">
                  <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-1 rounded-full transition-all duration-700 ease-out ${
                        i === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        i === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-primary-400 to-primary-500'
                      }`}
                      style={{ width: `${entry.progress}%` }}
                    >
                      <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                    </div>
                  </div>
                </div>
              </li>
            ) : null
          ))}
        </ol>
        
        {/* Bottom decoration */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-center space-x-2 text-xs text-secondary-500 dark:text-secondary-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">Keep learning to climb the ranks!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
