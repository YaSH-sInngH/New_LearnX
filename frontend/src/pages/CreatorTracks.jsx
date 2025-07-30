import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getProfile, getCreatorTracks } from '../api/profile';
import { createTrack, updateTrack, addModule, uploadModuleVideo, deleteTrack, uploadTrackCover } from '../api/tracks';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import MarkdownEditor from '../components/MarkdownEditor';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createPortal } from 'react-dom';

export default function CreatorTracks() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [trackForm, setTrackForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    estimatedDuration: '',
    tags: [],
    coverImage: null
  });
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    duration: '',
    video: null,
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [trackFormErrors, setTrackFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, tracksData] = await Promise.all([
        getProfile(),
        getCreatorTracks()
      ]);
      setProfile(profileData);
      setTracks(Array.isArray(tracksData) ? tracksData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrack = () => {
    setTrackForm({
      title: '',
      description: '',
      category: '',
      difficulty: 'Beginner',
      estimatedDuration: '',
      tags: [],
      coverImage: null
    });
    setTrackFormErrors({});
    setEditingTrack(null);
    setShowCreateModal(true);
  };

  const handleEditTrack = (track) => {
    setTrackForm({
      title: track.title || '',
      description: track.description || '',
      category: track.category || '',
      difficulty: track.difficulty || 'Beginner',
      estimatedDuration: track.estimatedDuration || '',
      tags: track.tags || [],
      coverImage: track.coverImage || null
    });
    setEditingTrack(track);
    setShowCreateModal(true);
  };

  const handleSaveTrack = async () => {
    const errors = {};
    if (!trackForm.title.trim()) errors.title = 'Track title is required';
    if (!trackForm.description.trim()) errors.description = 'Track description is required';
    if (!trackForm.category.trim()) errors.category = 'Track category is required';
    if (!String(trackForm.estimatedDuration).trim()) errors.estimatedDuration = 'Track estimated duration is required';

    setTrackFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Don't proceed if there are errors
    }

    setSaving(true);
    try {
      const { coverImage, ...trackData } = trackForm;
      trackData.estimatedDuration = parseInt(trackForm.estimatedDuration) || 0;
  
      let savedTrack;
      if (editingTrack) {
        savedTrack = await updateTrack(editingTrack.id, trackData);
        toast.success('Track updated successfully!');
      } else {
        savedTrack = await createTrack(trackData);
        toast.success('Track created successfully!');
      }
  
      // Upload cover image if provided
      if (coverImage) {
        setUploadingCover(true);
        try {
          await uploadTrackCover(savedTrack.id, coverImage);
          toast.success('Cover image uploaded successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(error.message || 'Failed to upload cover image');
        } finally {
          setUploadingCover(false);
        }
      }
  
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save track');
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = (trackId) => {
    setModuleForm({
      title: '',
      description: '',
      duration: '',
      video: null,
      notes: ''
    });
    setSelectedTrackId(trackId);
    setShowModuleModal(true);
  };

  const handleSaveModule = async () => {
    setSaving(true);
    try {
        const track = tracks.find(t => t.id === selectedTrackId);
        const currentModules = track?.modules || [];
      const moduleData = {
        title: moduleForm.title,
        description: moduleForm.description,
        duration: parseInt(moduleForm.duration) || 0,
        notes: moduleForm.notes,
        order: currentModules.length + 1
      };

      const newModule = await addModule(selectedTrackId, moduleData);

      if (moduleForm.video) {
        setUploadingVideo(true);
        await uploadModuleVideo(newModule.id, moduleForm.video);
        setUploadingVideo(false);
      }

      toast.success('Module added successfully!');
      setShowModuleModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to add module');
    } finally {
      setSaving(false);
      setUploadingVideo(false);
    }
  };

  const handleDeleteTrack = async (track) => {
    const result = await Swal.fire({
      title: 'Delete Track?',
      text: `Are you sure you want to delete "${track.title}"? This will permanently delete the entire track, all modules, videos, and associated content. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete Track',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'rounded-md',
        cancelButton: 'rounded-md'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteTrack(track.id);
        toast.success('Track deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error(error.message || 'Failed to delete track');
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (isPublished) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isPublished) => {
    return isPublished ? 'Published' : 'Draft';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your tracks...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout profile={profile} onProfileUpdate={setProfile}>
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Tracks</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">Manage your learning tracks and modules</p>
            </div>
            <button
              onClick={handleCreateTrack}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New Track</span>
            </button>
          </div>
        </div>
  
        {/* Track Grid */}
        {tracks.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tracks yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">Create your first learning track to get started</p>
            <button
              onClick={handleCreateTrack}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
            >
              Create Your First Track
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tracks.map((track) => (
              <div key={track.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Track Cover */}
                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-purple-500 to-blue-600">
                  {track.coverImageUrl && (
                    <img
                      src={track.coverImageUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(track.isPublished)}`}>
                      {getStatusText(track.isPublished)}
                    </span>
                  </div>
                </div>
  
                {/* Track Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-2">{track.title}</h3>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditTrack(track)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTrack(track)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{track.description}</p>
  
                  {/* Track Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(track.difficulty)}`}>
                      {track.difficulty}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate ml-2">{track.category}</span>
                  </div>
  
                  {/* Module Info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span>Modules</span>
                      <span>{track.modules?.length || 0} modules</span>
                    </div>
                    
                    {track.modules && track.modules.length > 0 ? (
                      <div className="space-y-1">
                        {track.modules.slice(0, 3).map((module, index) => (
                          <div key={module.id} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-xs flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="truncate">{module.title}</span>
                          </div>
                        ))}
                        {track.modules.length > 3 && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 ml-6">
                            +{track.modules.length - 3} more modules
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 dark:text-gray-500 italic">No modules yet</div>
                    )}
                  </div>
  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => navigate(`/creator/tracks/${track.id}/modules`)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Show Modules
                    </button>
                    <button
                      onClick={() => handleEditTrack(track)}
                      className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {/* Create/Edit Track Modal */}
        {showCreateModal && createPortal(
          <div className="fixed inset-0 z-[150] bg-black bg-opacity-40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">{editingTrack ? 'Edit Track' : 'Create New Track'}</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
  
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={trackForm.title}
                      onChange={(e) => {
                        setTrackForm({ ...trackForm, title: e.target.value });
                        if (trackFormErrors.title && e.target.value.trim()) {
                          setTrackFormErrors({ ...trackFormErrors, title: undefined });
                        }
                      }}
                      placeholder="Enter track title"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200"
                    />
                    {trackFormErrors.title && (
                      <p className="text-red-600 text-xs mt-1">{trackFormErrors.title}</p>
                    )}
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={trackForm.description}
                      onChange={(e) => {
                        setTrackForm({ ...trackForm, description: e.target.value });
                        if (trackFormErrors.description && e.target.value.trim()) {
                          setTrackFormErrors({ ...trackFormErrors, description: undefined });
                        }
                      }}
                      placeholder="Describe your track"
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200"
                    />
                    {trackFormErrors.description && (
                      <p className="text-red-600 text-xs mt-1">{trackFormErrors.description}</p>
                    )}
                  </div>
  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                      <input
                        type="text"
                        value={trackForm.category}
                        onChange={(e) => {
                          setTrackForm({ ...trackForm, category: e.target.value });
                          if (trackFormErrors.category && e.target.value.trim()) {
                            setTrackFormErrors({ ...trackFormErrors, category: undefined });
                          }
                        }}
                        placeholder="e.g., Programming, Design"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200"
                      />
                      {trackFormErrors.category && (
                        <p className="text-red-600 text-xs mt-1">{trackFormErrors.category}</p>
                      )}
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                      <select
                        value={trackForm.difficulty}
                        onChange={(e) => setTrackForm({ ...trackForm, difficulty: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Duration (minutes)</label>
                    <input
                      type="number"
                      value={trackForm.estimatedDuration}
                      onChange={(e) => {
                        setTrackForm({ ...trackForm, estimatedDuration: e.target.value });
                        if (trackFormErrors.estimatedDuration && e.target.value.trim()) {
                          setTrackFormErrors({ ...trackFormErrors, estimatedDuration: undefined });
                        }
                      }}
                      placeholder="120"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200"
                    />
                    {trackFormErrors.estimatedDuration && (
                      <p className="text-red-600 text-xs mt-1">{trackFormErrors.estimatedDuration}</p>
                    )}
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setTrackForm({ ...trackForm, coverImage: e.target.files[0] })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    />
                    {trackForm.coverImage && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(trackForm.coverImage)}
                          alt="Cover preview"
                          className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded border"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {trackForm.coverImage.name} ({(trackForm.coverImage.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
  
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTrack}
                    disabled={saving || uploadingCover}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
                  >
                    {saving ? 'Saving...' : uploadingCover ? 'Uploading Cover...' : (editingTrack ? 'Update Track' : 'Create Track')}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
  
        {/* Add Module Modal */}
        {showModuleModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Add Module</h2>
                  <button
                    onClick={() => setShowModuleModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
  
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module Title</label>
                    <input
                      type="text"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      placeholder="Enter module title"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      placeholder="Describe this module"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={moduleForm.duration}
                      onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                      placeholder="30"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video File</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setModuleForm({ ...moduleForm, video: e.target.files[0] })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                    {moduleForm.video && (
                      <div className="mt-2">
                        <video
                          src={URL.createObjectURL(moduleForm.video)}
                          controls
                          className="w-full max-w-md rounded border"
                          preload="metadata"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {moduleForm.video.name} ({(moduleForm.video.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <p className="text-xs text-blue-600">
                          Video will be processed after upload. This may take a few minutes.
                        </p>
                      </div>
                    )}
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Markdown)</label>
                    <MarkdownEditor
                      value={moduleForm.notes}
                      onChange={(value) => setModuleForm({ ...moduleForm, notes: value })}
                    />
                  </div>
                </div>
  
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveModule}
                    disabled={saving || uploadingVideo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
                  >
                    {saving ? 'Saving...' : uploadingVideo ? 'Uploading Video...' : 'Add Module'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 