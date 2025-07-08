import React from 'react';
import { Link } from 'react-router-dom';

export default function TrackCard({ track, userProgress }) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-warning-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-warning-400">☆</span>);
      } else {
        stars.push(<span key={i} className="text-secondary-300 dark:text-secondary-600">☆</span>);
      }
    }
    return stars;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'Intermediate': return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'Advanced': return 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-400';
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="card-hover group overflow-hidden relative">
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Link to={`/tracks/${track.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-xl">
          {/* Enhanced image with better overlay */}
          <div className="relative overflow-hidden">
            <img 
              src={track.coverImageUrl || '/default-track-cover.jpg'} 
              alt={track.title}
              className="w-full h-36 sm:h-44 md:h-48 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
              onError={(e) => {
                e.target.src = '/default-track-cover.jpg';
              }}
            />
            
            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
          
          {/* Progress Overlay with enhanced styling */}
          {userProgress && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 sm:p-3 md:p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-white mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-semibold tracking-wide">Your Progress</span>
                <span className="text-xs sm:text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {userProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2 overflow-hidden backdrop-blur-sm">
                <div 
                  className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 h-1.5 sm:h-2 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${userProgress.progress}%` }}
                >
                  <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Difficulty Badge */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg ${getDifficultyColor(track.difficulty)}`}>
              {track.difficulty}
            </span>
          </div>
          
          {/* Enhanced Rating Badge */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/95 dark:bg-secondary-800/95 backdrop-blur-md px-1.5 sm:px-2 py-1 rounded-lg border border-white/20 dark:border-secondary-700/50 shadow-lg">
            <div className="flex items-center space-x-1">
              <span className="text-warning-400 text-xs sm:text-sm drop-shadow-sm">★</span>
              <span className="text-xs sm:text-sm font-bold text-secondary-900 dark:text-white">
                {track.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4 sm:p-5 md:p-6 relative">
        {/* Enhanced Title and Creator section */}
        <div className="mb-3 sm:mb-4">
          <h3 className="font-bold text-base sm:text-lg text-secondary-900 dark:text-white line-clamp-2 mb-2 sm:mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300 leading-tight">
            {track.title}
          </h3>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <img 
                src={track.Creator?.avatarUrl || '/default-avatar.png'} 
                alt={track.Creator?.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white dark:border-secondary-700 shadow-lg ring-2 ring-primary-500/20 transition-all duration-300 group-hover:ring-primary-500/40"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-success-500 border-2 border-white dark:border-secondary-800 rounded-full shadow-sm animate-pulse"></div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white">{track.Creator?.name}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Creator</p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Rating with better visual hierarchy */}
        <div className="flex items-center mb-3 sm:mb-4 p-2 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
          <div className="flex items-center space-x-1 mr-2 sm:mr-3">
            {renderStars(track.rating)}
          </div>
          <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">
            {track.rating.toFixed(1)} rating
          </span>
        </div>
        
        {/* Enhanced Meta Information */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2 py-1 rounded-md">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{formatDuration(track.estimatedDuration)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2 py-1 rounded-md">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="truncate max-w-20 sm:max-w-none font-medium">{track.category}</span>
          </div>
        </div>
        
        {/* Enhanced Tags */}
        {track.tags && track.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {track.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 sm:px-3 py-1 bg-gradient-to-r from-secondary-100 to-secondary-200 dark:from-secondary-800 dark:to-secondary-700 text-secondary-700 dark:text-secondary-300 text-xs font-semibold rounded-full truncate max-w-24 sm:max-w-none border border-secondary-200 dark:border-secondary-600 shadow-sm"
              >
                {tag}
              </span>
            ))}
            {track.tags.length > 3 && (
              <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-secondary-100 to-secondary-200 dark:from-secondary-800 dark:to-secondary-700 text-secondary-700 dark:text-secondary-300 text-xs font-semibold rounded-full border border-secondary-200 dark:border-secondary-600 shadow-sm">
                +{track.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Enhanced Action Button */}
        <div className="mt-4 sm:mt-5 md:mt-6">
          <Link to={`/tracks/${track.id}`} className="btn btn-primary w-full justify-center text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 relative overflow-hidden group">
            <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center">
              {userProgress ? 'Continue Learning' : 'Start Learning'}
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
} 