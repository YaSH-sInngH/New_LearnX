const API_BASE = import.meta.env.VITE_API_BASE + '/ai';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Ask AI a question about a module
export async function askAI(moduleId, question) {
  const res = await fetch(`${API_BASE}/ask/${moduleId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ question })
  });
  return res.json();
}

// Get questions for a specific module
export async function getModuleQuestions(moduleId, limit = 20, offset = 0) {
  const res = await fetch(`${API_BASE}/questions/${moduleId}?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

// Get user's questions across all modules
export async function getUserQuestions(limit = 20, offset = 0) {
  const res = await fetch(`${API_BASE}/questions?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

// Delete a question
export async function deleteQuestion(questionId) {
  const res = await fetch(`${API_BASE}/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
} 