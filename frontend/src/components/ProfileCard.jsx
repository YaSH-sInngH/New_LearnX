import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { uploadAvatar, updateProfile } from '../api/profile';
import { toast } from 'react-toastify';

// Helper to get full avatar URL
const getAvatarUrl = (avatarUrl) => {
  // If falsy, or the string "undefined", or starts with "undefined", use default
  if (!avatarUrl || avatarUrl === 'undefined' || avatarUrl.startsWith('undefined')) {
    return '/default-avatar.png';
  }
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const SUPABASE_URL = 'https://sjvyivpzotvwlpfjwawx.supabase.co';
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`;
};

export default function ProfileCard({ profile, isOwnProfile = false, onUpdate }) {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    expertise: profile?.expertise || [],
    level: profile?.level || 'Beginner'
  });
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = isOwnProfile
    ? (user?.avatarUrl || '/default-avatar.png')
    : getAvatarUrl(profile?.avatarUrl);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
  
    setUploading(true);
    try {
      const result = await uploadAvatar(file);
      if (result.avatarUrl) {
        toast.success('Avatar updated successfully!');
        onUpdate && onUpdate({ ...profile, avatarUrl: result.avatarUrl });

        // Also update the user context if this is the current user
        if (isOwnProfile && setUser) {
          setUser({ ...user, avatarUrl: result.avatarUrl });
        }
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result.id) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        onUpdate && onUpdate(result);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExpertiseChange = (expertise) => {
    const current = formData.expertise;
    const updated = current.includes(expertise)
      ? current.filter(item => item !== expertise)
      : [...current, expertise];
    setFormData({ ...formData, expertise: updated });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400';
      case 'Creator': return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400';
      case 'Learner': return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-400';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
      case 'Intermediate': return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'Advanced': return 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-400';
    }
  };

  const calculateLevel = (xp) => {
    return Math.floor(xp / 1000) + 1;
  };

  const getLevelProgress = (xp) => {
    return (xp % 1000) / 10; // Progress percentage
  };

  return (
    <div className="card overflow-hidden relative backdrop-blur-sm bg-white/95 dark:bg-secondary-800/95 border border-white/20 dark:border-secondary-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
      {/* Floating Edit Button */}
      {isOwnProfile && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 btn btn-primary px-2 py-1 sm:px-4 sm:py-2 shadow-large hover:shadow-glow transition-all duration-300 z-10 text-xs sm:text-sm rounded-full backdrop-blur-sm bg-primary-600/90 hover:bg-primary-500 border border-primary-400/30 group"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6M3 17.25V21h3.75l11.06-11.06a2.121 2.121 0 00-3-3L3 17.25z" />
          </svg>
          <span className="hidden sm:inline font-medium">Edit</span>
        </button>
      )}

      {/* Header with Avatar */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-4 sm:p-6 md:p-8 flex flex-col items-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 via-transparent to-primary-800/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative mb-3 sm:mb-4 z-10">
          <div className="relative group">
            <img
              src={avatarUrl + '?t=' + Date.now()}
              alt={profile?.name || 'User'}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 sm:border-4 border-white/30 shadow-xl ring-4 sm:ring-6 ring-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:ring-white/40"
              onError={e => { e.target.src = '/default-avatar.png'; }}
            />
            {/* Avatar glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          {isOwnProfile && isEditing && (
            <label className="absolute bottom-0 right-0 bg-white dark:bg-secondary-800 rounded-full p-1 sm:p-2 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-white dark:border-secondary-700 group hover:scale-110">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 dark:text-secondary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="spinner w-6 h-6 sm:w-8 sm:h-8"></div>
            </div>
          )}
        </div>
        
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 font-display text-center px-2 relative z-10 drop-shadow-lg">{profile?.name}</h2>
        
        <div className="flex items-center space-x-2 flex-wrap justify-center gap-1 sm:gap-2 relative z-10">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20 shadow-lg ${getRoleColor(profile?.role)}`}>
            {profile?.role}
          </span>
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20 shadow-lg ${getLevelColor(profile?.level)}`}>
            {profile?.level}
          </span>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 relative">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors duration-200">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-primary-400 dark:hover:border-primary-500"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors duration-200">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="input resize-none text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-primary-400 dark:hover:border-primary-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors duration-200">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="input text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-primary-400 dark:hover:border-primary-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">Expertise</label>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'Python', 'React', 'Node.js', 'Data Science', 'Machine Learning', 'Web Design', 'Mobile Development'].map((skill) => (
                  <label key={skill} className="flex items-center bg-primary-50 dark:bg-primary-900/30 px-2 sm:px-3 py-2 rounded-xl cursor-pointer text-primary-700 dark:text-primary-300 font-medium text-xs sm:text-sm hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all duration-200 border border-primary-200/50 dark:border-primary-700/50 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md group">
                    <input
                      type="checkbox"
                      checked={formData.expertise.includes(skill)}
                      onChange={() => handleExpertiseChange(skill)}
                      className="mr-1 sm:mr-2 accent-primary-600 rounded transition-all duration-200"
                    />
                    <span className="whitespace-nowrap group-hover:scale-105 transition-transform duration-200">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-secondary-200/50 dark:border-secondary-700/50">
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary flex-1 text-sm sm:text-base transition-all duration-200 hover:scale-105 hover:shadow-lg border border-secondary-300 dark:border-secondary-600 hover:border-secondary-400 dark:hover:border-secondary-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex-1 text-sm sm:text-base transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Save Changes</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-4 sm:space-y-6">
            {/* Bio */}
            {profile?.bio && (
              <div className="group">
                <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 flex items-center">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-2"></div>
                  About
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed bg-secondary-50 dark:bg-secondary-900/30 p-4 rounded-xl border border-secondary-200/50 dark:border-secondary-700/50 hover:border-secondary-300 dark:hover:border-secondary-600 transition-all duration-200 hover:shadow-md">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Expertise */}
            {profile?.expertise && profile.expertise.length > 0 && (
              <div className="group">
                <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 flex items-center">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-2"></div>
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-2 sm:px-3 py-1 bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full whitespace-nowrap border border-primary-200/50 dark:border-primary-700/50 hover:shadow-md hover:scale-105 transition-all duration-200 hover:from-primary-200 hover:to-primary-100 dark:hover:from-primary-800/40 dark:hover:to-primary-800/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {profile?.role === 'Learner' && (
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-secondary-200/50 dark:border-secondary-700/50 relative">
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-2xl p-4 border border-primary-200/50 dark:border-primary-700/30 group-hover:border-primary-300 dark:group-hover:border-primary-600 transition-all duration-200 group-hover:shadow-lg">
                    <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                      {profile?.xp || 0}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 px-1 font-medium">Experience Points</div>
                  </div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/10 rounded-2xl p-4 border border-success-200/50 dark:border-success-700/30 group-hover:border-success-300 dark:group-hover:border-success-600 transition-all duration-200 group-hover:shadow-lg">
                    <div className="text-xl sm:text-2xl font-bold text-success-600 dark:text-success-400 mb-1">
                      {profile.badges ? profile.badges.length : 0}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 px-1 font-medium">Badges Earned</div>
                  </div>
                </div>
              </div>
            )}

            {/* Badges */}
            {profile.badges && profile.badges.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 flex items-center">
                  <div className="w-1 h-4 bg-gradient-to-b from-success-500 to-success-600 rounded-full mr-2"></div>
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {profile.badges.map((badge, i) => (
                    <div key={i} className="group hover:scale-110 transition-transform duration-200">
                      <img 
                        src={badge} 
                        alt="Badge" 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-success-200 dark:border-success-700 shadow-md group-hover:shadow-lg group-hover:border-success-300 dark:group-hover:border-success-600 transition-all duration-200" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-secondary-500 dark:text-secondary-400 text-center sm:text-left py-8 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl border border-dashed border-secondary-300 dark:border-secondary-700 flex items-center justify-center">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  No badges earned yet
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 