// API helpers for profile and user management
const API_BASE = import.meta.env.VITE_API_BASE;

// Get auth token from context or localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Profile API functions
export async function getProfile(userId = null) {
  const endpoint = userId ? `/profile/${userId}` : '/profile';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function updateProfile(profileData) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return res.json();
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API_BASE}/profile/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
    },
    body: formData
  });
  return res.json();
}

// Gamification API functions
export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/gamification/leaderboard`);
  return res.json();
}

export async function getUserProgress() {
  const res = await fetch(`${API_BASE}/gamification/progress`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getTrackLeaderboard(trackId) {
  const res = await fetch(`${API_BASE}/gamification/leaderboard/${trackId}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

// Admin API functions
export async function getAllUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Request failed');
  }
  return res.json();
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  return res.json();
}

export async function getPlatformStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function manageTrack(trackId, action) {
  const res = await fetch(`${API_BASE}/admin/tracks/${trackId}/manage`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  });
  return res.json();
}

// Creator API functions
export async function getCreatorTracks() {
  const res = await fetch(`${API_BASE}/tracks/creator`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getTrackAnalytics(trackId) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}/analytics`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

// Learner API functions
export async function getEnrolledTracks() {
  const res = await fetch(`${API_BASE}/tracks/enrolled`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getRecentActivity() {
  const res = await fetch(`${API_BASE}/activity/recent`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getAllTracks() {
  const res = await fetch(`${API_BASE}/admin/tracks`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function adminManageTrack(trackId, action) {
  const res = await fetch(`${API_BASE}/admin/tracks/${trackId}/manage`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  });
  return res.json();
}

// Add this function to your API helpers
export async function updateUserStatus(userId, status) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const res = await fetch(
    `${API_BASE}/admin/users/${userId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ status })
    }
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update user status');
  }
  return res.json();
}

export async function getXPHistory() {
  const res = await fetch(`${API_BASE}/profile/xp-history`, {
    headers: getAuthHeaders()
  });
  return res.json();
} 