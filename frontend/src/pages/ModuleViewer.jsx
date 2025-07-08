import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuleById, saveModuleProgress, submitQuiz, getQuizAttempts } from '../api/tracks';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import VideoPlayer from '../components/VideoPlayer';
import NotesPanel from '../components/NotesPanel';
import QuizPanel from '../components/QuizPanel';
import { getProfile } from '../api/profile';

export default function ModuleViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai'); // Changed default to 'ai'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  useEffect(() => {
    fetchModuleDetails();
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    setLoading(true);
    try {
      const moduleData = await getModuleById(moduleId);
      setModule(moduleData);
      
      // Check if user has progress for this module
      if (moduleData.userProgress) {
        setVideoProgress(moduleData.userProgress.lastPosition || 0);
        setIsVideoCompleted(moduleData.userProgress.completed || false);
      }
    } catch (error) {
      toast.error('Failed to load module');
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = async (currentTime, duration) => {
    const progress = (currentTime / duration) * 100;
    setVideoProgress(progress);
    
    // Save progress every 30 seconds
    if (Math.floor(currentTime) % 30 === 0) {
      try {
        await saveModuleProgress(module.trackId, moduleId, {
          position: currentTime,
          completed: progress >= 90 // Mark as completed if watched 90% or more
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  const handleVideoComplete = async () => {
    setIsVideoCompleted(true);
    try {
      await saveModuleProgress(module.trackId, moduleId, {
        position: module.videoDuration || 0,
        completed: true
      });
      toast.success('Module completed!');
      const updatedProfile = await getProfile();
      setUser(updatedProfile);
    } catch (error) {
      console.error('Failed to mark module as completed:', error);
    }
  };

  const handleQuizSubmit = async (answers) => {
    try {
      const result = await submitQuiz(moduleId, answers);
      if (result.passed) {
        toast.success(`Quiz passed! Score: ${result.score}%`);
        // Mark module as completed if quiz is passed
        try {
          await saveModuleProgress(module.trackId, moduleId, {
            completed: true,
            quizCompleted: true
          });
          const updatedProfile = await getProfile();
          setUser(updatedProfile);
        } catch (progressError) {
          toast.error('Quiz passed, but failed to update progress.');
          // Do NOT throw here, just notify
        }
      } else {
        toast.error(`Quiz failed. Score: ${result.score}%`);
      }
      return result;
    } catch (error) {
      toast.error('Failed to submit quiz');
      // Do NOT throw here, just return a failed result
      return { score: 0, passed: false, correctAnswers: [] };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Module not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The module you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="group p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-105"
              >
                <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate max-w-xs sm:max-w-none">
                  {module.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Module {module.order}</p>
              </div>
            </div>
            
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="lg:hidden group p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6">
          {/* Video Player Column (60% width) */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <VideoPlayer
                videoUrl={module.videoUrl}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                initialProgress={videoProgress}
                isCompleted={isVideoCompleted}
              />
            </div>
          </div>
  
          {/* Sidebar Columns (40% width) */}
          <div className={`w-full lg:w-2/5 ${isSidebarCollapsed ? 'hidden lg:block' : 'block'}`}>
            <div className="space-y-3 sm:space-y-6">
              {/* Notes Panel (20% width) */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1">
                <NotesPanel
                  moduleId={moduleId}
                  initialNotes={module.notes}
                  isCompleted={isVideoCompleted}
                />
              </div>
  
              {/* Quiz/Resources Panel (20% width) */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1">
                <QuizPanel
                  moduleId={moduleId}
                  module={module}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onSubmitQuiz={handleQuizSubmit}
                  isCompleted={isVideoCompleted}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 