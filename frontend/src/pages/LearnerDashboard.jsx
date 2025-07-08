import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getProfile, getUserProgress, getLeaderboard, getEnrolledTracks } from '../api/profile';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import TrackCard from '../components/TrackCard';

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [enrolledTracks, setEnrolledTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, progressData, leaderboardData, tracksData] = await Promise.all([
        getProfile(),
        getUserProgress(),
        getLeaderboard(),
        getEnrolledTracks().catch(() => [])
      ]);

      setProfile(profileData);
      setProgress(progressData);
      setLeaderboard(leaderboardData);
      setEnrolledTracks(Array.isArray(tracksData) ? tracksData : []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboardPosition = () => {
    if (!leaderboard.length || !user) return null;
    const position = leaderboard.findIndex(u => u.id === user.id);
    return position >= 0 ? position + 1 : null;
  };

  const getProgressChartData = () => {
    if (!enrolledTracks.length) return [];
    
    return enrolledTracks.slice(0, 5).map(track => {
      // Based on backend structure, progress is in enrollment.progress
      const progressValue = track.enrollment?.progress || 0;
      
      return {
        name: track.title,
        progress: progressValue
      };
    });
  };

  const getRecentBadges = () => {
    // Return the 6 most recent achievements with a badge image
    if (profile?.badges && profile.badges.length > 0) {
      return profile.badges.slice(-6).reverse().map(url => ({ badgeImage: url, name: 'Badge' }));
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-primary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-300 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Profile badges:', profile.badges);

  return (
    <DashboardLayout profile={profile} onProfileUpdate={setProfile}>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Welcome Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-large mx-auto sm:mx-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-white font-display leading-tight">
                  Welcome back, {profile?.name}!
                </h1>
                <p className="text-secondary-600 dark:text-secondary-300 text-base sm:text-lg mt-1">
                  Continue your learning journey and unlock new achievements
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="card p-4 sm:p-6 hover:shadow-medium transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mx-auto sm:mx-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-center sm:text-left sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">Enrolled Tracks</p>
                  <p className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-white">{enrolledTracks.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6 hover:shadow-medium transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="p-2 sm:p-3 bg-success-100 dark:bg-success-900/30 rounded-xl mx-auto sm:mx-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center sm:text-left sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-white">
                    {enrolledTracks.filter(track => (track.enrollment?.progress || 0) === 100).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6 hover:shadow-medium transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="p-2 sm:p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl mx-auto sm:mx-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="text-center sm:text-left sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">Badges Earned</p>
                  <p className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-white">{profile.badges ? profile.badges.length : 0}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6 hover:shadow-medium transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="p-2 sm:p-3 bg-secondary-100 dark:bg-secondary-800 rounded-xl mx-auto sm:mx-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-center sm:text-left sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">Leaderboard</p>
                  <p className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-white">
                    #{getLeaderboardPosition() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Progress Overview */}
            <div className="xl:col-span-2">
              <div className="card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white">Progress Overview</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">Your Progress</span>
                  </div>
                </div>
                
                {enrolledTracks.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {getProgressChartData().map((track, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-200 truncate pr-2">
                            {track.name}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 flex-shrink-0">
                            {track.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 sm:h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${track.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white mb-2">No tracks enrolled yet</h3>
                    <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 mb-4">Start your learning journey by enrolling in tracks</p>
                    <a 
                      href="/tracks" 
                      className="btn btn-primary text-sm sm:text-base"
                    >
                      Browse Tracks
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Badge Showcase */}
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white mb-4 sm:mb-6">Badge Showcase</h2>
              {getRecentBadges().length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {getRecentBadges().map((badge, index) => (
                    <div
                      key={index}
                      className="group relative"
                      title={badge.name}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-warning-100 to-warning-200 dark:from-warning-900/30 dark:to-warning-800/30 rounded-2xl flex items-center justify-center mx-auto shadow-soft group-hover:shadow-medium transition-all duration-300 group-hover:scale-110">
                        {badge.badgeImage ? (
                          <img src={badge.badgeImage} alt={badge.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        ) : (
                          <span className="text-lg sm:text-2xl">🏆</span>
                        )}
                      </div>
                      <p className="text-xs text-center mt-2 text-secondary-600 dark:text-secondary-400 truncate">
                        {badge.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">No badges earned yet</p>
                  <p className="text-secondary-500 dark:text-secondary-500 text-xs mt-1">Complete tracks to earn badges</p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Enrolled Tracks */}
          <div className="mt-6 sm:mt-8">
            <div className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white">Recently Enrolled Tracks</h2>
                <a 
                  href="/tracks" 
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  View all tracks →
                </a>
              </div>
              
              {enrolledTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {enrolledTracks.slice(0, 6).map((track) => {
                    // Based on backend structure, progress is in enrollment.progress
                    const userProgress = track.enrollment ? { progress: track.enrollment.progress } : null;
                    
                    return (
                      <TrackCard 
                        key={track.id} 
                        track={track} 
                        userProgress={userProgress} 
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white mb-2">No enrolled tracks yet</h3>
                  <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 mb-4">Discover amazing learning tracks and start your journey</p>
                  <a 
                    href="/tracks" 
                    className="btn btn-primary text-sm sm:text-base"
                  >
                    Explore Tracks
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 