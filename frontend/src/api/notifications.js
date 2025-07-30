const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const getNotifications = async () => {
  try {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (res.status === 404 || res.status === 500) {
        // Backend not running or endpoint not found
        return [];
      }
      throw new Error('Failed to fetch notifications');
    }
    return res.json();
  } catch (error) {
    console.warn('Failed to fetch notifications:', error.message);
    return []; // Return empty array instead of throwing
  }
};

export const markAsRead = async (notificationId) => {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
};

export const markAllAsRead = async () => {
  const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
  return res.json();
};

export const deleteNotification = async (notificationId) => {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete notification');
  return res.json();
}; 