import React from 'react';
import Confetti from 'react-confetti';

export default function BadgeUnlockModal({ badge, onClose }) {
  if (!badge) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <Confetti width={window.innerWidth} height={window.innerHeight} />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center relative">
        <button
          className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ×
        </button>
        <div className="text-5xl mb-4">
          {badge.badgeImage ? (
            <img src={badge.badgeImage} alt={badge.name} className="w-16 h-16 object-contain mx-auto" />
          ) : (
            '🏆'
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">Badge Unlocked!</h2>
        <div className="text-lg font-semibold text-yellow-600 mb-2">{badge.name}</div>
        <div className="text-gray-600 dark:text-gray-300 mb-4">{badge.description}</div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          onClick={onClose}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
} 