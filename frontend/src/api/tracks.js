// API helpers for tracks and modules
const API_BASE = import.meta.env.VITE_API_BASE;

// Get auth token from context or localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Track API functions
export async function searchTracks(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/tracks/search?${queryParams}`);
  return res.json();
}

export async function getTrackById(trackId) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function enrollInTrack(trackId) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}/enroll`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getTrackProgress(trackId) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}/progress`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    // Optionally log or handle specific status codes
    return null;
  }
  return res.json();
}

export async function getTrackReviews(trackId) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}/reviews`);
  return res.json();
}

// Module API functions
export async function getModuleById(moduleId) {
  const res = await fetch(`${API_BASE}/modules/${moduleId}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function saveModuleProgress(trackId, moduleId, progressData) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}/progress`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      moduleId,
      ...progressData
    })
  });
  if (!res.ok) {
    // Try to parse error, fallback to text
    let errorMsg = 'Failed to update progress';
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      errorMsg = await res.text();
    }
    throw new Error(errorMsg);
  }
  // Only parse JSON if content-type is correct
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return {};
}

// Quiz API functions
export async function submitQuiz(moduleId, answers) {
  const res = await fetch(`${API_BASE}/modules/${moduleId}/quiz`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ moduleId, answers })
  });
  return res.json();
}

export async function getQuizAttempts(moduleId) {
  const res = await fetch(`${API_BASE}/modules/${moduleId}/quiz/attempts`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

// Discussion API functions
export async function getTrackDiscussions(trackId) {
  const res = await fetch(`${API_BASE}/discussions/track/${trackId}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function getModuleDiscussions(moduleId) {
  const res = await fetch(`${API_BASE}/discussions/module/${moduleId}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function createDiscussion(data) {
  const res = await fetch(`${API_BASE}/discussions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function editDiscussion(id, content) {
  const res = await fetch(`${API_BASE}/discussions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });
  return res.json();
}

export async function deleteDiscussion(id) {
  const res = await fetch(`${API_BASE}/discussions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function createTrack(data) {
  const res = await fetch(`${API_BASE}/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateTrack(trackId, data) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteTrack(trackId) {
  try {
    const res = await fetch(`${API_BASE}/tracks/${trackId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete track');
    }

    return await res.json();
  } catch (error) {
    console.error('API Error - deleteTrack:', error);
    throw error;
  }
}

export async function addModule(trackId, data) {
  try {
    const res = await fetch(`${API_BASE}/modules/tracks/${trackId}/modules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    // Try to parse JSON, but handle HTML error pages
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add module');
      } else {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} - ${text.slice(0, 100)}`);
      }
    }

    return await res.json();
  } catch (error) {
    console.error('API Error - addModule:', error);
    throw error; // Re-throw to be caught in the component
  }
}

export async function updateModule(moduleId, data) {
  try {
    const res = await fetch(`${API_BASE}/modules/${moduleId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update module');
    }

    return await res.json();
  } catch (error) {
    console.error('API Error - updateModule:', error);
    throw error;
  }
}

export async function deleteModule(moduleId) {
  try {
    const res = await fetch(`${API_BASE}/modules/${moduleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete module');
    }

    return await res.json();
  } catch (error) {
    console.error('API Error - deleteModule:', error);
    throw error;
  }
}

export async function uploadModuleVideo(moduleId, file) {
  try {
    const formData = new FormData();
    formData.append('video', file);
    
    // Remove Content-Type header - let the browser set it with the boundary
    const headers = getAuthHeaders();
    delete headers['Content-Type'];
    
    const res = await fetch(`${API_BASE}/modules/${moduleId}/video`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    // Try to parse JSON, but handle HTML error pages
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload video');
      } else {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} - ${text.slice(0, 100)}`);
      }
    }

    return await res.json();
  } catch (error) {
    console.error('API Error - uploadModuleVideo:', error);
    throw error;
  }
}

export async function updateVideoDuration(moduleId, duration) {
  try {
    const res = await fetch(`${API_BASE}/modules/${moduleId}/duration`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ duration })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update video duration');
    }

    return await res.json();
  } catch (error) {
    console.error('API Error - updateVideoDuration:', error);
    throw error;
  }
}

export async function autoGenerateQuiz(moduleId) {
  const res = await fetch(`${API_BASE}/modules/${moduleId}/quiz/ai-generate`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getTrackAnalytics(trackId) {
  try {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/analytics`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch analytics');
    }

    return await res.json();
  } catch (error) {
    console.error('API Error - getTrackAnalytics:', error);
    throw error;
  }
}

export async function uploadTrackCover(trackId, file) {
  const formData = new FormData();
  formData.append('cover', file);
  
  // Remove Content-Type header - let the browser set it with the boundary
  const headers = getAuthHeaders();
  delete headers['Content-Type'];
  
  const res = await fetch(`${API_BASE}/tracks/${trackId}/cover`, {
    method: 'POST',
    headers: headers,
    body: formData
  });
  return res.json();
}

export async function createReview(trackId, rating, comment) {
  const res = await fetch(`${API_BASE}/tracks/${trackId}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ rating, comment })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to submit review');
  }
  return res.json();
}

export async function uploadAttachment(file) {
  const formData = new FormData();
  formData.append('attachment', file);
  
  // Remove Content-Type header - let browser set it with boundary
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  };
  
  const res = await fetch(`${API_BASE}/discussions/attachment`, {
    method: 'POST',
    headers,
    body: formData
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload attachment');
  }
  
  return await res.json();
}