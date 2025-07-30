import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getProfile, getCreatorTracks, getTrackAnalytics } from '../api/profile';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { Link } from 'react-router-dom';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    setLoading(true);
    try {
      const [profileData, tracksData] = await Promise.all([
        getProfile(),
        getCreatorTracks().catch(e => {
          console.error('getCreatorTracks error:', e);
          return [];
        })
      ]);
      console.log('tracksData:', tracksData);

      setProfile(profileData);
      setTracks(Array.isArray(tracksData) ? tracksData : []);

      // Fetch analytics for each track
      const analyticsData = {};
      for (const track of tracksData) {
        try {
          const trackAnalytics = await getTrackAnalytics(track.id);
          analyticsData[track.id] = trackAnalytics;
        } catch (error) {
          console.error(`Failed to fetch analytics for track ${track.id}:`, error);
        }
      }
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error('Failed to load creator dashboard');
      console.error('Creator dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickStats = () => {
    const totalLearners = tracks.reduce((sum, track) => sum + (track.enrollmentCount || 0), 0);
    const avgRating = tracks.length > 0 
      ? (tracks.reduce((sum, track) => sum + (track.rating || 0), 0) / tracks.length).toFixed(1)
      : 0;
    const publishedTracks = tracks.filter(track => track.isPublished).length;
    const totalModules = tracks.reduce((sum, track) => sum + (track.modules?.length || 0), 0);

    return { totalLearners, avgRating, publishedTracks, totalModules };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getCompletionRateData = () => {
    return tracks.map(track => ({
      name: track.title,
      completionRate: analytics[track.id]?.completionRate || 0,
      enrollmentCount: track.enrollmentCount || 0
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading creator dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getQuickStats();

  return (
    <DashboardLayout profile={profile} onProfileUpdate={setProfile}>
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 mt-16">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Creator Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">Track your content performance and analytics</p>
          </div>
          <Link
            to="/dashboard/creator/tracks"
            className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Manage Tracks</span>
          </Link>
        </div>
  
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Total Enrollments</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLearners}</p>
              </div>
            </div>
          </div>
  
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Published Tracks</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedTracks}</p>
              </div>
            </div>
          </div>
  
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Total Modules</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalModules}</p>
              </div>
            </div>
          </div>
  
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Avg Rating</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex px-4 sm:px-6 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', name: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
                { id: 'analytics', name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-1 mr-6 sm:mr-8 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
  
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Tracks */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Tracks</h3>
                  {tracks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No tracks created yet</p>
                      <Link
                        to="/dashboard/creator/tracks"
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
                      >
                        Create Your First Track
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {tracks.slice(0, 6).map((track) => (
                        <div key={track.id} className="bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate pr-2">{track.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(track.isPublished ? 'published' : 'draft')}`}>
                              {track.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{track.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{track.modules?.length || 0} modules</span>
                            <span>{track.enrollmentCount || 0} learners</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
  
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Link
                      to="/dashboard/creator/tracks"
                      className="bg-purple-50 dark:bg-gray-900 border border-purple-200 dark:border-purple-800 rounded-lg p-4 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white">Create New Track</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Start building your next course</p>
                        </div>
                      </div>
                    </Link>
  
                    <Link
                      to="/dashboard/creator/tracks"
                      className="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white">Manage Tracks</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Edit existing tracks and modules</p>
                        </div>
                      </div>
                    </Link>
  
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="bg-green-50 dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-lg p-4 hover:bg-green-100 dark:hover:bg-green-800 transition-colors text-left w-full"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white">View Analytics</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Track performance and insights</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
  
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {tracks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No tracks available for analytics</p>
                    <Link
                      to="/dashboard/creator/tracks"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
                    >
                      Create Your First Track
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* Track Selector */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Track for Analytics
                      </label>
                      <select
                        value={selectedTrackId || ''}
                        onChange={(e) => setSelectedTrackId(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      >
                        <option value="" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Choose a track...</option>
                        {tracks.map((track) => (
                          <option key={track.id} value={track.id} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                            {track.title}
                          </option>
                        ))}
                      </select>
                    </div>
  
                    {/* Analytics Dashboard */}
                    {selectedTrackId && (
                      <AnalyticsDashboard trackId={selectedTrackId} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 