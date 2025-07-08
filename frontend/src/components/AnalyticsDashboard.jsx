import React, { useState, useEffect } from 'react';
import { getTrackAnalytics } from '../api/tracks';
import { toast } from 'react-toastify';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, TimeScale);

export default function AnalyticsDashboard({ trackId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [trackId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getTrackAnalytics(trackId);
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        No analytics data available
      </div>
    );
  }

  const renderCompletionRateChart = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Module Completion Rates</h3>
        <div className="space-y-4">
          {analytics.moduleAnalytics.map((module) => (
            <div key={module.moduleId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Module {module.moduleOrder}: {module.moduleTitle}
                </h4>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {module.completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${module.completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{module.completedEnrollments} completed</span>
                <span>{module.totalEnrollments} enrolled</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDropOffAnalysis = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Drop-off Analysis</h3>
        <div className="space-y-4">
          {analytics.dropOffAnalysis.map((module) => (
            <div key={module.moduleId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Module {module.moduleOrder}: {module.moduleTitle}
                </h4>
                <span className={`text-sm font-medium text-gray-600 dark:text-gray-400 ${
                  module.dropOffRate > 20 ? 'text-red-600' : 
                  module.dropOffRate > 10 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {module.dropOffRate}% drop-off
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Drop-off count: {module.dropOffCount} learners</p>
                <p>Remaining learners: {module.remainingLearners}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuizPerformance = () => {
    const modulesWithQuizzes = analytics.moduleAnalytics.filter(module => module.quizStats);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quiz Performance</h3>
        {modulesWithQuizzes.length > 0 ? (
          <div className="space-y-4">
            {modulesWithQuizzes.map((module) => (
              <div key={module.moduleId} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Module {module.moduleOrder}: {module.moduleTitle}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                      {module.quizStats.averageScore}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                      {module.quizStats.passRate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                      {module.quizStats.totalAttempts}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
                  </div>
                </div>
                {module.quizStats.recentAttempts.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Recent Attempts</h5>
                    <div className="space-y-1">
                      {module.quizStats.recentAttempts.map((attempt, index) => (
                        <div key={index} className="flex items-center justify-between text-sm ">
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(attempt.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400 ${
                              attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {attempt.score}%
                            </span>
                            <span className={attempt.passed ? 'text-green-600' : 'text-red-600'}>
                              {attempt.passed ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No quiz data available</p>
          </div>
        )}
      </div>
    );
  };

  const renderLearnerList = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Learner Progress</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Enrolled
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={enrollment.user?.avatarUrl || '/default-avatar.png'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {enrollment.user?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {enrollment.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{enrollment.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-gray-600 dark:text-gray-400 ${
                      enrollment.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {enrollment.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTimeAnalytics = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Time-based Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">
              {analytics.timeAnalytics.enrollmentsLast30Days}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">New Enrollments (30 days)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-500">
              {analytics.timeAnalytics.completionsLast30Days}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completions (30 days)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-500">
              {analytics.timeAnalytics.averageTimeToComplete}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Days to Complete</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Track Analytics</h2>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600">{analytics.totalEnrollments}</div>
          <div className="text-sm text-gray-600">Total Enrollments</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-green-600">{analytics.completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-purple-600">{analytics.moduleAnalytics.length}</div>
          <div className="text-sm text-gray-600">Total Modules</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-yellow-600">
            {analytics.moduleAnalytics.filter(m => m.quizStats).length}
          </div>
          <div className="text-sm text-gray-600">Modules with Quizzes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'completion', name: 'Completion Rates' },
              { id: 'dropoff', name: 'Drop-off Analysis' },
              { id: 'quiz', name: 'Quiz Performance' },
              { id: 'learners', name: 'Learner List' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderTimeAnalytics()}
          {activeTab === 'completion' && renderCompletionRateChart()}
          {activeTab === 'dropoff' && renderDropOffAnalysis()}
          {activeTab === 'quiz' && renderQuizPerformance()}
          {activeTab === 'learners' && renderLearnerList()}
          {analytics.enrollmentsOverTime && analytics.enrollmentsOverTime.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h4 className="text-lg font-semibold mb-4">Enrollments Over Time (Last 30 Days)</h4>
              <Line
                data={{
                  labels: analytics.enrollmentsOverTime.map(e => e.date),
                  datasets: [{
                    label: 'Enrollments',
                    data: analytics.enrollmentsOverTime.map(e => e.count),
                    fill: true,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    tension: 0.3
                  }]
                }}
                options={{
                  scales: {
                    x: { type: 'time', time: { unit: 'day' } }
                  }
                }}
              />
            </div>
          )}
          {analytics.dropOffAnalysis && analytics.dropOffAnalysis.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h4 className="text-lg font-semibold mb-4">Quiz/Module Drop-off</h4>
              <Bar
                data={{
                  labels: analytics.dropOffAnalysis.map(d => d.moduleTitle),
                  datasets: [{
                    label: 'Drop-off Rate (%)',
                    data: analytics.dropOffAnalysis.map(d => d.dropOffRate),
                    backgroundColor: '#ef4444'
                  }]
                }}
                options={{
                  indexAxis: 'y',
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 