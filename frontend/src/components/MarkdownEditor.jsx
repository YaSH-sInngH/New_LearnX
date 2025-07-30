import React from 'react';
// If you have 'marked' or 'markdown-it', you can use it for better rendering
// import { marked } from 'marked';

export default function MarkdownEditor({ value, onChange }) {
  return (
    <div>
      <textarea
        className="w-full p-2 border rounded mb-2 font-mono"
        rows={6}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write notes in markdown..."
      />
      <div className="bg-gray-50 border rounded p-2 min-h-[60px]">
        <div className="text-xs text-gray-500 mb-1">Preview:</div>
        {/* Simple preview: replace line breaks, bold, italics, and code */}
        <div
          className="prose prose-sm"
          dangerouslySetInnerHTML={{
            __html: value
              .replace(/\n/g, '<br/>')
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*(.*?)\*/g, '<i>$1</i>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
          }}
        />
      </div>
    </div>
  );
} 