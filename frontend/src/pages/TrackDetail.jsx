import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTrackById, enrollInTrack, getTrackProgress, getTrackReviews, createReview } from '../api/tracks';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import DiscussionPanel from '../components/DiscussionPanel';
import TrackLeaderboard from '../components/TrackLeaderBoard';

export default function TrackDetail() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolling, setEnrolling] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchTrackDetails();
  }, [trackId]);

  const fetchTrackDetails = async () => {
    setLoading(true);
    try {
      const [trackData, progressData, reviewsData] = await Promise.all([
        getTrackById(trackId),
        getTrackProgress(trackId).catch(() => null),
        getTrackReviews(trackId).catch(() => [])
      ]);

      setTrack(trackData);
      setUserProgress(progressData && !progressData.error ? progressData : null);
      setReviews(reviewsData);
    } catch (error) {
      toast.error('Failed to load track details');
      console.error('Error fetching track details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in this track');
      return;
    }

    setEnrolling(true);
    try {
      await enrollInTrack(trackId);
      toast.success('Successfully enrolled in track!');
      fetchTrackDetails(); // Refresh to get progress
    } catch (error) {
      toast.error(error.message || 'Failed to enroll in track');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (track?.modules?.length > 0) {
      navigate(`/module/${track.modules[0].id}`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      await createReview(trackId, reviewRating, reviewComment);
      toast.success('Review submitted successfully!');
      fetchTrackDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating, setRating) => (
    <div className="flex items-center space-x-1 mb-2">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => setRating(n)}
          className={`text-2xl focus:outline-none ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  console.log('userProgress:', userProgress);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading track details...</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 md:h-96">
        <img
          src={track.coverImageUrl || '/default-track-cover.jpg'}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">{track.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-3 sm:mb-4">
              <div className="flex items-center">
                {renderStars(track.rating, setReviewRating)}
                <span className="ml-2 text-sm sm:text-base">({track.rating.toFixed(1)})</span>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(track.difficulty)} w-fit`}>
                {track.difficulty}
              </span>
              <span className="text-sm sm:text-base lg:text-lg">{formatDuration(track.estimatedDuration)}</span>
            </div>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-200 max-w-3xl line-clamp-3 sm:line-clamp-none">{track.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4 sm:mb-6 lg:mb-8">
              <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 overflow-x-auto">
                {['overview', 'curriculum', 'discussion'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm capitalize whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">About this track</h3>
                  <div className="prose max-w-none">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{track.description}</p>
                  </div>
                </div>

                {/* Creator Profile */}
                {track.Creator && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">About the instructor</h3>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <Link to={track.Creator.id ? `/profile/${track.Creator.id}` : '#'} className="flex items-center space-x-3 sm:space-x-4 group">
                        <img
                          src={track.Creator.avatarUrl || '/default-avatar.png'}
                          alt={track.Creator.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-transparent group-hover:border-blue-500 transition"
                        />
                        <div>
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition">{track.Creator.name}</h4>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Track Creator</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                  <TrackLeaderboard trackId={trackId} />
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Reviews</h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm sm:text-base">{review.user?.name}</span>
                              <div className="flex">{renderStars(review.rating, setReviewRating)}</div>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">No reviews yet. Be the first to review this track!</p>
                  )}
                </div>

                {userProgress && !reviews.some(r => r.user?.id === user.id) && (
                  <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mt-4 sm:mt-6 max-w-full sm:max-w-lg">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Leave a Review</h4>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Your Rating</label>
                    {renderStars(reviewRating, setReviewRating)}
                    <label className="block text-xs sm:text-sm font-medium mb-2 mt-3 sm:mt-4">Your Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white text-sm sm:text-base"
                      placeholder="Share your thoughts about this track..."
                      required
                    />
                    <button
                      type="submit"
                      className="mt-3 sm:mt-4 w-full bg-blue-600 text-white py-2 sm:py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Curriculum</h3>
                {userProgress ? (
                  <div className="space-y-2">
                    {track.modules.map((module, index) => {
                      const isUnlocked = userProgress.completedModules?.includes(module.id) || index === 0 || userProgress.completedModules?.includes(track.modules[index - 1]?.id);
                      return (
                        <div
                          key={module.id}
                          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 flex items-center justify-between ${isUnlocked ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}`}
                          onClick={() => isUnlocked && navigate(`/module/${module.id}`)}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{module.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                {module.duration ? `${module.duration} minutes` : 'Duration not specified'}
                              </p>
                            </div>
                          </div>
                          {userProgress?.completedModules?.includes(module.id) && (
                            <span className="text-green-600 text-xs sm:text-sm font-medium flex-shrink-0">✓ Completed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Enroll to access the curriculum and start learning!</p>
                )}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Discussion</h3>
                <DiscussionPanel trackId={trackId} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 order-first lg:order-last">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-8">
              <div className="text-center mb-4 sm:mb-6">
                {userProgress ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span>Progress</span>
                        <span>{userProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${userProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={handleStartLearning}
                      className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Continue Learning
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{formatDuration(track.estimatedDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty</span>
                  <span>{track.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category</span>
                  <span className="truncate ml-2">{track.category}</span>
                </div>
                {track.tags && track.tags.length > 0 && (
                  <div>
                    <span className="block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {track.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 