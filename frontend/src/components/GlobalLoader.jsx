import React from 'react';

export default function GlobalLoader({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="spinner w-16 h-16 border-4 border-t-primary-600"></div>
    </div>
  );
} 