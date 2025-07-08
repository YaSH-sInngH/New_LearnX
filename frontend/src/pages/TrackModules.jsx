import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTrackById, addModule, updateModule, deleteModule, deleteTrack, uploadModuleVideo, autoGenerateQuiz } from '../api/tracks';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import { confirmDelete } from '../utils/sweetAlert';
import VideoPlayer from '../components/VideoPlayer';
import ReactMarkdown from 'react-markdown';


export default function TrackModules() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatingQuizFor, setGeneratingQuizFor] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    duration: '',
    video: null
  });
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [showNotesPreview, setShowNotesPreview] = useState(false);
  const  [showNotesModal, setNotesModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  useEffect(() => {
    fetchTrack();
  }, [trackId]);

  const fetchTrack = async () => {
    setLoading(true);
    try {
      const trackData = await getTrackById(trackId);
      setTrack(trackData);
    } catch (error) {
      toast.error('Failed to load track');
      console.error('Error fetching track:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      let moduleRes;
      const { video, ...formDataWithoutVideo } = formData;
      const processedData = {
        ...formDataWithoutVideo,
        duration: formData.duration ? parseInt(formData.duration) : null,
        order: track.modules.length + 1
      };

      if (editingModule) {
        moduleRes = await updateModule(editingModule.id, processedData);
        toast.success('Module updated successfully!');
      } else {
        moduleRes = await addModule(trackId, processedData);
        toast.success('Module added successfully!');
      }
      
      if (formData.video) {
        setUploadingVideo(true);
        try {
          const moduleId = editingModule ? editingModule.id : moduleRes.id;
          if (!moduleId) {
            throw new Error('Failed to get module ID');
          }
          const result = await uploadModuleVideo(moduleId, formData.video);
          toast.success('Video uploaded! It will be processed shortly.');
        } catch (err) {
          toast.error(err.message || 'Video upload failed');
        } finally {
          setUploadingVideo(false);
        }
      }
      
      // Reset form and refresh data
      setFormData({
        title: '',
        notes: '',
        duration: '',
        video: null
      });
      setShowAddForm(false);
      setEditingModule(null);
      fetchTrack();
    } catch (error) {
      toast.error(error.message || 'Failed to save module');
    }
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setFormData({
      title: module.title || '',
      notes: module.notes || '',
      duration: module.duration || '',
      video: null
    });
    setShowAddForm(true);
  };

  const handleDeleteModuleClick = async (module) => {
    const confirmed = await confirmDelete(
      'Delete Module?',
      `Are you sure you want to delete "${module.title}"? This action cannot be undone and will also remove any associated videos and quizzes.`,
      module.title
    );

    if (confirmed) {
      try {
        await deleteModule(module.id);
        toast.success('Module deleted successfully!');
        fetchTrack();
      } catch (error) {
        toast.error(error.message || 'Failed to delete module');
      }
    }
  };

  const handleDeleteTrackClick = async () => {
    const confirmed = await confirmDelete(
      'Delete Track?',
      `Are you sure you want to delete "${track.title}"? This will permanently delete the entire track, all modules, videos, and associated content. This action cannot be undone.`,
      track.title
    );

    if (confirmed) {
      try {
        await deleteTrack(trackId);
        toast.success('Track deleted successfully!');
        navigate('/creator/tracks');
      } catch (error) {
        toast.error(error.message || 'Failed to delete track');
      }
    }
  };

  const cancelEdit = () => {
    setEditingModule(null);
    setShowAddForm(false);
    setFormData({
      title: '',
      notes: '',
      duration: '',
      video: null
    });
  };

  const toggleModuleExpansion = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getVideoStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-green-600';
      case 'processing': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getVideoStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGenerateQuiz = async (module) => {
    if (!module.videoUrl && !module.notes) {
      toast.error('Module must have either video content or notes to generate AI quiz');
      return;
    }

    setGeneratingQuiz(true);
    setGeneratingQuizFor(module.id);
    
    try {
      const result = await autoGenerateQuiz(module.id);
      if (result.quiz) {
        toast.success(`AI quiz generated successfully for "${module.title}"!`);
        fetchTrack(); // Refresh to show the new quiz
      } else {
        toast.error(result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
      setGeneratingQuizFor(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading track modules...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Track not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The track you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/creator/tracks"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Tracks
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">{track.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">Manage modules for this track</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Add Module
            </button>
            <button
              onClick={handleDeleteTrackClick}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Delete Track
            </button>
          </div>
        </div>

        {/* Add/Edit Module Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-200 dark:bg-gray-800"
                    placeholder="Enter module title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-200 dark:bg-gray-800"
                    placeholder="e.g., 15"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-200 dark:bg-gray-800"
                  placeholder="Additional notes or content for this module"
                />
                <button
                  type="button"
                  className="mt-2 px-3 sm:px-4 py-1 sm:py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs sm:text-sm font-medium"
                  onClick={() => setShowNotesPreview(true)}
                >
                  Preview Notes
                </button>
                {showNotesPreview && (
                  <div className="mt-4 border border-blue-200 bg-blue-50 dark:bg-gray-900 p-3 sm:p-4 rounded relative">
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg sm:text-xl"
                      onClick={() => setShowNotesPreview(false)}
                      aria-label="Close preview"
                    >
                      ×
                    </button>
                    <div className="prose prose-sm sm:prose max-w-none pr-6">
                      <ReactMarkdown>{formData.notes || 'No notes to preview.'}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Markdown Preview (only after saving) */}
              {editingModule && editingModule.notes && !showAddForm && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes Preview
                  </label>
                  <div className="prose prose-sm sm:prose max-w-none bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded">
                    <ReactMarkdown>{editingModule.notes}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFormData({ ...formData, video: e.target.files[0] })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-200 dark:bg-gray-800"
                />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
                  Supported formats: MP4, WebM, MOV. Max size: 500MB
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  disabled={uploadingVideo}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                >
                  {uploadingVideo ? 'Uploading...' : (editingModule ? 'Update Module' : 'Add Module')}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Modules ({track.modules?.length || 0})</h2>
          
          {track.modules && track.modules.length > 0 ? (
            track.modules.map((module, index) => (
              <div key={module.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">{module.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {module.duration ? `${module.duration} minutes` : 'Duration not specified'}
                        </p>
                        {module.videoUrl && (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`text-xs font-medium ${getVideoStatusColor(module.videoStatus)}`}>
                              {getVideoStatusText(module.videoStatus)}
                            </span>
                            {module.videoDuration && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDuration(module.videoDuration)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-0">
                      {module.videoUrl && (
                        <button
                          onClick={() => toggleModuleExpansion(module.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                        >
                          {expandedModules.has(module.id) ? 'Hide Video' : 'View Video'}
                        </button>
                      )}
                      {module.quiz ? (
                        <span className="text-green-600 text-xs sm:text-sm font-medium">✓ Quiz Available</span>
                      ) : (
                        <button
                          onClick={() => handleGenerateQuiz(module)}
                          disabled={generatingQuiz}
                          className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium disabled:opacity-50"
                        >
                          {generatingQuiz && generatingQuizFor === module.id ? 'Generating...' : 'Generate Quiz'}
                        </button>
                      )}
                      {module.notes && (
                        <button
                          onClick={() => {
                            setSelectedModule(module);
                            setNotesModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium"
                        >
                          View Notes
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(module)}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-xs sm:text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModuleClick(module)}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Video Preview */}
                {expandedModules.has(module.id) && module.videoUrl && (
                  <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Video Preview:</h4>
                    <div className="w-full max-w-2xl">
                      <VideoPlayer 
                        videoUrl={module.videoUrl}
                        onProgress={() => {}}
                        onComplete={() => {}}
                        isCompleted={false}
                        moduleId={module.id}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No modules yet</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Get started by adding your first module.</p>
            </div>
          )}
        </div>
      </div>

      {showNotesModal && selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] p-4 sm:p-6 relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-xl sm:text-2xl"
              onClick={() => setNotesModal(false)}
              aria-label="Close notes preview"
            >
              ×
            </button>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white pr-8">Module Notes</h3>
            <div className="prose prose-sm sm:prose max-w-none dark:prose-invert overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <ReactMarkdown>{selectedModule.notes}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

