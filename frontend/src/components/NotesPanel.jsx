import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function NotesPanel({ moduleId, initialNotes = '', isCompleted = false }) {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem(`module-notes-${moduleId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [moduleId]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now (could be API call later)
      localStorage.setItem(`module-notes-${moduleId}`, notes);
      toast.success('Notes saved successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const addHighlight = () => {
    const newHighlight = {
      id: Date.now(),
      text: 'New highlight',
      timestamp: new Date().toISOString(),
      color: 'yellow'
    };
    setHighlights([...highlights, newHighlight]);
  };

  const updateHighlight = (id, updates) => {
    setHighlights(highlights.map(h => 
      h.id === id ? { ...h, ...updates } : h
    ));
  };

  const deleteHighlight = (id) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  const renderMarkdown = (text) => {
    // Simple markdown rendering (you can use a library like react-markdown for more features)
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="h-96 flex flex-col dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notes</h3>
        <div className="flex items-center space-x-2">
          {isCompleted && (
            <span className="text-green-600 text-sm">✓ Module completed</span>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          /* Edit Mode */
          <div className="h-full flex flex-col dark:bg-gray-900">
            <div className="flex-1 p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes here... Use **bold**, *italic*, and `code` for formatting."
                className="w-full h-full resize-none border-0 focus:ring-0 text-sm dark:bg-gray-900"
                style={{ minHeight: '200px' }}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Markdown supported: **bold**, *italic*, `code`
                </div>
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="h-full overflow-y-auto">
            {notes ? (
              <div className="p-4">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(notes) }}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm">No notes yet</p>
                <p className="text-xs">Click "Edit" to start taking notes</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Highlights Section */}
      <div className="border-t dark:border-gray-700">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Highlights</h4>
          <button
            onClick={addHighlight}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto">
          {highlights.length > 0 ? (
            <div className="p-3 space-y-2">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={highlight.text}
                      onChange={(e) => updateHighlight(highlight.id, { text: e.target.value })}
                      className="w-full text-sm bg-transparent border-0 focus:ring-0"
                      placeholder="Highlight text..."
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(highlight.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHighlight(highlight.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
              No highlights yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 