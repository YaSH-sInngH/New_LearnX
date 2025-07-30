import React, { useState } from 'react';
import { askAI } from '../api/ai';

export default function AITestPanel({ moduleId }) {
  const [notes, setNotes] = useState(`# Invention of Zero

- Zero (0) is both a number and a numerical digit used to represent the absence of any quantity.
- It plays a crucial role in the modern number system as a placeholder and in arithmetic operations.

## Historical Development

- Ancient Civilizations like the Babylonians used placeholders (around 300 BCE) in their positional number system but lacked a true zero.
- Maya Civilization (in Central America) independently developed a symbol for zero by around 4th century CE for use in their calendar system.

## Zero in Indian Mathematics

- The first true use of zero as both a placeholder and a number was in India.
- Mathematician Brahmagupta (628 CE) is credited with formalizing zero in his work Brahmasphutasiddhanta.
- He defined operations involving zero, including rules like:
- \\( a + 0 = a \\)
- \\( a - 0 = a \\)
- \\( a \\times 0 = 0 \\)
- Division by zero was mentioned, but misunderstood (as infinity or undefined).

## Transmission to the West

- Indian mathematics and the concept of zero spread to the Islamic world through scholars and translations (like Al-Khwarizmi).
- From there, it entered Europe around the 12th century via Latin translations of Arabic texts.

## Significance of Zero

- Enabled the development of the decimal (base-10) positional number system.
- Crucial for advancements in mathematics, science, engineering, and computer science.
- Forms the foundation of binary code (0 and 1) used in digital computing.

## Summary

- Zero's invention is one of the greatest intellectual achievements in mathematics.
- It transformed arithmetic and laid the groundwork for modern technological progress.`);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [settingNotes, setSettingNotes] = useState(false);

  const setModuleNotes = async () => {
    setSettingNotes(true);
    try {
      const response = await fetch(`/api/ai/test/set-notes/${moduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      
      if (response.ok) {
        alert('Notes set successfully!');
      } else {
        alert('Failed to set notes');
      }
    } catch (error) {
      alert('Error setting notes: ' + error.message);
    } finally {
      setSettingNotes(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const response = await askAI(moduleId, question);
      setAnswer(response.answer);
    } catch (error) {
      setAnswer('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">AI Test Panel</h3>
      
      {/* Set Notes */}
      <div className="space-y-2">
        <h4 className="font-medium">1. Set Module Notes</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-40 p-2 border rounded"
          placeholder="Enter module notes..."
        />
        <button
          onClick={setModuleNotes}
          disabled={settingNotes}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {settingNotes ? 'Setting Notes...' : 'Set Notes'}
        </button>
      </div>

      {/* Ask Question */}
      <div className="space-y-2">
        <h4 className="font-medium">2. Test AI Questions</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={askQuestion}
            disabled={loading || !question.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </div>
        
        {/* Quick Test Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setQuestion('Who invented zero?')}
            className="bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Who invented zero?
          </button>
          <button
            onClick={() => setQuestion('Tell me about Maya Civilization')}
            className="bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Tell me about Maya Civilization
          </button>
          <button
            onClick={() => setQuestion('What is this module about?')}
            className="bg-gray-200 px-3 py-1 rounded text-sm"
          >
            What is this module about?
          </button>
        </div>
      </div>

      {/* Answer */}
      {answer && (
        <div className="space-y-2">
          <h4 className="font-medium">AI Answer:</h4>
          <div className="p-3 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap text-sm">{answer}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 