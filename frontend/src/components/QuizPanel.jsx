import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getQuizAttempts, autoGenerateQuiz } from '../api/tracks';
import { toast } from 'react-toastify';
import BadgeUnlockModal from './BadgeUnlockModal';
import AIAssistantPanel from './AIAssistantPanel';

export default function QuizPanel({ 
  moduleId, 
  module, 
  activeTab, 
  onTabChange, 
  onSubmitQuiz, 
  isCompleted = false 
}) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    if (module?.quiz) {
      setQuiz(module.quiz);
      // Initialize answers object
      const initialAnswers = {};
      module.quiz.questions.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setCurrentAnswers(initialAnswers);
    }
    fetchQuizAttempts();
  }, [moduleId, module]);

  const fetchQuizAttempts = async () => {
    try {
      const attemptsData = await getQuizAttempts(moduleId);
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Failed to fetch quiz attempts:', error);
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    const answers = Object.values(currentAnswers);
    if (answers.some(answer => answer === '' || answer === undefined)) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmitQuiz(answers);
      if (!result || typeof result.score !== 'number') {
        toast.error('Quiz failed. Please try again.');
        setLastResult({ score: 0, passed: false, correctAnswers: [] });
        setShowResults(true);
        return;
      }
      setLastResult(result);
      setShowResults(true);
      fetchQuizAttempts(); // Refresh attempts
      // Badge unlock animation
      if (result.newBadge) {
        setUnlockedBadge(result.newBadge);
      }
      // XP gain feedback
      if (result.xpGained) {
        setXpGained(result.xpGained);
        toast.success(`+${result.xpGained} XP!`);
      }
    } catch (error) {
      toast.error('Quiz failed. Please try again.');
      setLastResult({ score: 0, passed: false, correctAnswers: [] });
      setShowResults(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const result = await autoGenerateQuiz(moduleId);
      if (result.quiz) {
        setQuiz(result.quiz);
        toast.success('AI quiz generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const resetQuiz = () => {
    setCurrentAnswers({});
    setShowResults(false);
    setLastResult(null);
  };

  const renderQuizQuestion = (question, index) => {
    const isAnswered = currentAnswers[index] !== '';
    const isCorrect = showResults && lastResult?.correctAnswers?.[index] === currentAnswers[index];

    return (
      <div key={index} className="mb-6 p-4 border rounded-lg">
        <div className="flex items-start space-x-2 mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Q{index + 1}.</span>
          <p className="text-sm text-gray-900 dark:text-gray-100 flex-1">{question.question}</p>
        </div>
        
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => (
            <label
              key={optionIndex}
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors text-gray-900 dark:text-gray-100 ${
                currentAnswers[index] === optionIndex
                  ? showResults
                    ? isCorrect
                      ? 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700'
                      : 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700'
                    : 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800'
              } border`}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={optionIndex}
                checked={currentAnswers[index] === optionIndex}
                onChange={() => handleAnswerChange(index, optionIndex)}
                disabled={showResults}
                className="text-blue-600 dark:text-blue-400"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">{option}</span>
              {showResults && (
                <span className="ml-auto">
                  {isCorrect && currentAnswers[index] === optionIndex && (
                    <span className="text-green-600">✓</span>
                  )}
                  {!isCorrect && lastResult?.correctAnswers?.[index] === optionIndex && (
                    <span className="text-green-600">✓</span>
                  )}
                  {!isCorrect && currentAnswers[index] === optionIndex && (
                    <span className="text-red-600">✗</span>
                  )}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-96 flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Badge Unlock Modal */}
      <BadgeUnlockModal badge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />
      
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850">
        <div className="flex">
          <button
            onClick={() => onTabChange('quiz')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 ease-in-out relative ${
              activeTab === 'quiz'
                ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Quiz</span>
            </div>
            {activeTab === 'quiz' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 ease-in-out relative ${
              activeTab === 'ai'
                ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI Assistant</span>
            </div>
            {activeTab === 'ai' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>
  
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {activeTab === 'quiz' && (
          <div className="p-6">
            {!quiz ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Quiz Available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">This module doesn't have a quiz yet. Create one to test your knowledge!</p>
                {user?.role === 'Creator' && (
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {generatingQuiz ? (
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating AI Quiz...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Generate AI Quiz</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quiz Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span>Module Quiz</span>
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {quiz.questions.length} questions
                        </span>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Passing score: {quiz.passingScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Quiz Questions */}
                {!showResults ? (
                  <div className="space-y-4">
                    {quiz.questions.map((question, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        {renderQuizQuestion(question, index)}
                      </div>
                    ))}
                    
                    <div className="pt-4">
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting || Object.values(currentAnswers).some(answer => answer === '' || answer === undefined)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl"
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Submitting Quiz...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Submit Quiz</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Quiz Results */
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                      lastResult.passed 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20' 
                        : 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20'
                    }`}>
                      {lastResult.passed ? (
                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className={`text-3xl font-bold mb-3 ${
                      lastResult.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {lastResult.passed ? 'Quiz Passed!' : 'Quiz Failed'}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Score: {lastResult.score}%
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mb-6">
                      <span className="font-medium">
                        {Array.isArray(lastResult?.correctAnswers)
                          ? lastResult.correctAnswers.filter((_, index) => lastResult.correctAnswers[index] === currentAnswers[index]).length
                          : 0}
                      </span>
                      {' '}out of {quiz.questions.length} questions answered correctly
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Try Again</span>
                      </div>
                    </button>
                  </div>
                )}
  
                {/* Quiz Attempt History */}
                {attempts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Previous Attempts</span>
                    </h4>
                    <div className="space-y-3">
                      {attempts.slice(0, 3).map((attempt, index) => (
                        <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {attempts.length - index}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              Attempt {attempts.length - index}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              attempt.passed 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {attempt.score}%
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
  
        {activeTab === 'ai' && (
          <div className="h-full">
            <AIAssistantPanel moduleId={moduleId} module={module} />
          </div>
        )}
      </div>
    </div>
  );
} 