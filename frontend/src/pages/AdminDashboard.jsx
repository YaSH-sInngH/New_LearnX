import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getProfile, getAllUsers, updateUserRole, getPlatformStats, manageTrack, getAllTracks, adminManageTrack, updateUserStatus } from '../api/profile';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate, Link } from 'react-router-dom';
import AdminStats from '../components/AdminStats';
import AdminInvitationCodes from '../components/AdminInvitationCodes';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [error, setError] = useState(null);
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, usersData, statsData, tracksData] = await Promise.all([
        getProfile(),
        getAllUsers(),
        getPlatformStats(),
        getAllTracks().catch(e=>{
            console.error('Error fetching tracks:', e);
            return [];
        })
      ]);
      setProfile(profileData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setStats(statsData);
      setTracks(Array.isArray(tracksData) ? tracksData : []);
    } catch (error) {
      console.error('Admin dashboard fetch error:', error);
      if (error?.message?.includes('401') || error?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        setError('Failed to load admin dashboard data.');
      }
      setUsers([]);
      setStats({});
      setProfile(null);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }

    try {
      const promises = selectedUsers.map(userId => updateUserRole(userId, action));
      await Promise.all(promises);
      toast.success(`Successfully ${action}ed ${selectedUsers.length} users`);
      setSelectedUsers([]);
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleTrackAction = async (trackId, action) => {
    try {
      await adminManageTrack(trackId, action);
      toast.success(`Track ${action}ed successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error(`Failed to ${action} track`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Creator': return 'bg-purple-100 text-purple-800';
      case 'Learner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'banned': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DashboardLayout profile={profile} onProfileUpdate={setProfile}>
        <div className="max-w-5xl mx-auto py-8">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg text-center font-semibold">
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile} onProfileUpdate={setProfile}>
      <div className="max-w-5xl mx-auto py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage platform users and content</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="space-y-6 sm:space-y-8">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.userCount ?? 0}</p>
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
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Total Tracks</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.trackCount ?? 0}</p>
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
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Enrollments</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.enrollmentCount ?? 0}</p>
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
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto px-4 sm:px-6 scrollbar-hide">
                  {[
                    { id: 'users', name: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
                    { id: 'tracks', name: 'Tracks', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                    { id: 'stats', name: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                    { id: 'invitations', name: 'Invitations', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-4 px-2 sm:px-4 border-b-2 font-medium text-sm flex items-center space-x-1 sm:space-x-2 min-w-0 ${
                        activeTab === tab.id
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span className="text-xs sm:text-sm">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'users' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Search and Filters */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                      >
                        <option value="all" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">All Roles</option>
                        <option value="Admin" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Admin</option>
                        <option value="Creator" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Creator</option>
                        <option value="Learner" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Learner</option>
                      </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <span className="text-sm font-medium text-blue-900">
                            {selectedUsers.length} user(s) selected
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleBulkAction('ban')}
                              className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 flex-1 sm:flex-none"
                            >
                              Ban Selected
                            </button>
                            <button
                              onClick={() => handleBulkAction('unban')}
                              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 flex-1 sm:flex-none"
                            >
                              Unban Selected
                            </button>
                            <button
                              onClick={() => setSelectedUsers([])}
                              className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 flex-1 sm:flex-none"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Users Table */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-3 sm:px-6 py-3 text-left">
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUsers(filteredUsers.map(user => user.id));
                                      } else {
                                        setSelectedUsers([]);
                                      }
                                    }}
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  User
                                </th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Role
                                </th>
                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Joined
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={selectedUsers.includes(user.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedUsers([...selectedUsers, user.id]);
                                        } else {
                                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                        }
                                      }}
                                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <Link to={user.id ? `/profile/${user.id}` : '#'} className="flex items-center group">
                                        <img
                                          src={user.avatarUrl || '/default-avatar.png'}
                                          alt={user.name}
                                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 border-2 border-transparent group-hover:border-blue-500 transition"
                                        />
                                        <div className="ml-2 sm:ml-4 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition">{user.name}</div>
                                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                          <div className="sm:hidden mt-1 flex gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                              {user.role}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status || 'active')}`}>
                                              {user.status || 'active'}
                                            </span>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>
                                  </td>
                                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status || 'active')}`}>
                                      {user.status || 'active'}
                                    </span>
                                  </td>
                                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const newStatus = user.status === 'banned' ? 'active' : 'banned';
                                          await updateUserStatus(user.id, newStatus);
                                          toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`);
                                          fetchAdminData(); // Refresh data
                                        } catch (error) {
                                          toast.error('Failed to update user status');
                                        }
                                      }}
                                      className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'banned' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                                    >
                                      {user.status === 'banned' ? 'Unban' : 'Ban'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tracks' && (
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Track Approval Queue</h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm md:text-lg font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Creator</th>
                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {tracks.map((track) => (
                                <tr key={track.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{track.category}</div>
                                    <div className="sm:hidden mt-1 flex items-center gap-2">
                                      <img src={track.Creator?.avatarUrl || '/default-avatar.png'} alt={track.Creator?.name} className="w-6 h-6 rounded-full object-cover" />
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{track.Creator?.name}</span>
                                    </div>
                                    <div className="md:hidden mt-1">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${track.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {track.isPublished ? 'Published' : 'Pending'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <img src={track.Creator?.avatarUrl || '/default-avatar.png'} alt={track.Creator?.name} className="w-8 h-8 rounded-full object-cover" />
                                      <div className="ml-2">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{track.Creator?.name}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${track.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {track.isPublished ? 'Published' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                      <button onClick={() => handleTrackAction(track.id, 'publish')} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                                      <button onClick={() => handleTrackAction(track.id, 'feature')} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Feature</button>
                                      <button onClick={() => handleTrackAction(track.id, 'unpublish')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Growth Charts</h3>
                    <AdminStats stats={stats} />
                  </div>
                )}

                {activeTab === 'invitations' && (
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invitation Codes</h3>
                    <AdminInvitationCodes />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 