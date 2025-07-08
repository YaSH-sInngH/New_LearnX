import React, { useState, useEffect, useRef } from 'react';
import { askAI, getModuleQuestions, deleteQuestion } from '../api/ai';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthProvider';

export default function AIAssistantPanel({ moduleId, module }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchQuestions();
  }, [moduleId]);

  useEffect(() => {
    scrollToBottom();
  }, [questions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchQuestions = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await getModuleQuestions(moduleId);
      if (response.questions) {
        setQuestions(response.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const questionText = currentQuestion.trim();
    setCurrentQuestion('');
    setIsLoading(true);

    // Add user question immediately
    const userQuestion = {
      id: `temp-${Date.now()}`,
      question: questionText,
      answer: null,
      citations: [],
      createdAt: new Date().toISOString(),
      user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
      isPending: true
    };

    setQuestions(prev => [...prev, userQuestion]);

    try {
      const response = await askAI(moduleId, questionText);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Update the question with AI response
      setQuestions(prev => prev.map(q => 
        q.id === userQuestion.id 
          ? { ...response, user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl } }
          : q
      ));

      toast.success('AI response generated successfully!');
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error(error.message || 'Failed to get AI response');
      
      // Remove the pending question on error
      setQuestions(prev => prev.filter(q => q.id !== userQuestion.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const getSourceTypeColor = (sourceType) => {
    switch (sourceType) {
      case 'transcript': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'notes': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'both': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getSourceTypeIcon = (sourceType) => {
    switch (sourceType) {
      case 'transcript': return '🎥';
      case 'notes': return '📝';
      case 'both': return '📚';
      default: return '❓';
    }
  };

  return (
    <div className="h-96 flex flex-col dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Ask questions about this module
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading conversation history...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No questions yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">Ask your first question about this module</p>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="space-y-3">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md bg-blue-600 text-white rounded-lg p-3 dark:bg-gray-900">
                  <p className="text-sm">{question.question}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-blue-200">
                    <span>{question.user?.name || 'You'}</span>
                    <span>{new Date(question.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* AI Response */}
              {question.isPending ? (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md bg-gray-100 rounded-lg p-3 dark:bg-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              ) : question.answer ? (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md bg-gray-50 rounded-lg p-3 dark:bg-gray-900">
                    <div className="flex items-start space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{question.answer}</p>
                        
                        {/* Citations */}
                        {question.citations && question.citations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sources:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(question.sourceType)}`}>
                                {getSourceTypeIcon(question.sourceType)} {question.sourceType}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {question.citations.slice(0, 3).map((citation, index) => (
                                <div key={index} className="text-xs bg-gray-100 rounded p-2">
                                  <div className="flex items-center space-x-1 mb-1">
                                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${getSourceTypeColor(citation.source)}`}>
                                      {citation.source}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      ({(citation.relevance * 100).toFixed(0)}% relevant)
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300">{citation.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(question.createdAt).toLocaleTimeString()}</span>
                          {question.user?.id === user?.id && (
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Ask a question about this module..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:bg-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!currentQuestion.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Ask</span>
              </div>
            ) : (
              'Ask'
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          AI will search through module notes and video transcript to answer your questions
        </p>
      </div>
    </div>
  );
} 