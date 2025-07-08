import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FilterSidebar({ filters, onFilterChange, categories, creators }) {
  const [isOpen, setIsOpen] = useState(false);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const ratings = [4, 3, 2, 1];

  const handleCategoryChange = (category) => {
    const newCategories = filters.category === category 
      ? null 
      : category;
    onFilterChange({ ...filters, category: newCategories });
  };

  const handleDifficultyChange = (difficulty) => {
    const newDifficulties = filters.difficulty === difficulty 
      ? null 
      : difficulty;
    onFilterChange({ ...filters, difficulty: newDifficulties });
  };

  const handleRatingChange = (rating) => {
    const newRating = filters.minRating === rating ? 0 : rating;
    onFilterChange({ ...filters, minRating: newRating });
  };

  const handleCreatorChange = (creatorId) => {
    const newCreator = filters.creatorId === creatorId ? null : creatorId;
    onFilterChange({ ...filters, creatorId: newCreator });
  };

  const clearFilters = () => {
    onFilterChange({
      category: null,
      difficulty: null,
      minRating: 0,
      creatorId: null
    });
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.minRating > 0 || filters.creatorId;

  // Helper to render a clickable creator name (for future use if you display a list)
  function CreatorName({ creator }) {
    return (
      <Link to={creator.id ? `/profile/${creator.id}` : '#'} className="text-blue-600 hover:underline">
        {creator.name}
      </Link>
    );
  }

  return (
  <div className="w-full lg:w-64">
    {/* Mobile toggle */}
    <div className="lg:hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl p-4 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-750 dark:hover:to-gray-700"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <span className="font-semibold text-sm sm:text-base bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Filters
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          )}
          <svg
            className={`w-5 h-5 transform transition-all duration-300 text-gray-500 dark:text-gray-400 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
    </div>

    {/* Filter sidebar */}
    <div className={`lg:block ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-600 p-6 sm:p-8 space-y-6 sm:space-y-8 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Filters
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="group relative text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              <span className="relative z-10">Clear all</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Categories</h4>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="group flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 p-3 rounded-xl transition-all duration-200">
                <div className="relative">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category}
                    onChange={() => handleCategoryChange(category)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    filters.category === category 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                  }`}>
                    {filters.category === category && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight ml-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Difficulty</h4>
          </div>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <label key={difficulty} className="group flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900/20 dark:hover:to-blue-900/20 p-3 rounded-xl transition-all duration-200">
                <div className="relative">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={filters.difficulty === difficulty}
                    onChange={() => handleDifficultyChange(difficulty)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    filters.difficulty === difficulty 
                      ? 'border-green-500 bg-gradient-to-r from-green-500 to-blue-600 shadow-lg' 
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-green-400'
                  }`}>
                    {filters.difficulty === difficulty && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight ml-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {difficulty}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Minimum Rating</h4>
          </div>
          <div className="space-y-2">
            {ratings.map((rating) => (
              <label key={rating} className="group flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 p-3 rounded-xl transition-all duration-200">
                <div className="relative">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    filters.minRating === rating 
                      ? 'border-yellow-500 bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg' 
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-yellow-400'
                  }`}>
                    {filters.minRating === rating && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center ml-3">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm transition-all duration-200 ${
                          i < rating 
                            ? 'text-yellow-400 drop-shadow-sm' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2 font-medium">& up</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Creators */}
        {creators && creators.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Creators</h4>
            </div>
            <div className="relative">
              <select
                value={filters.creatorId || ''}
                onChange={(e) => handleCreatorChange(e.target.value || null)}
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-md hover:shadow-lg appearance-none cursor-pointer dark:bg-gray-800"
              >
                <option value="">All Creators</option>
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Active Filters</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 shadow-md border border-blue-200 dark:border-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Category: {filters.category}
                </span>
              )}
              {filters.difficulty && (
                <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 text-green-800 dark:text-green-200 shadow-md border border-green-200 dark:border-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Difficulty: {filters.difficulty}
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-800 dark:text-yellow-200 shadow-md border border-yellow-200 dark:border-yellow-700">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Rating: {filters.minRating}+ stars
                </span>
              )}
              {filters.creatorId && (
                <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 shadow-md border border-purple-200 dark:border-purple-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Creator: <CreatorName creator={creators?.find(c => c.id === filters.creatorId)} />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
} 