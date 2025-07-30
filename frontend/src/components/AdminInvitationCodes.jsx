import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const API_BASE = import.meta.env.VITE_API_BASE;

export default function AdminInvitationCodes() {
  const [invitationCodes, setInvitationCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);

  const fetchInvitationCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/invitation-codes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setInvitationCodes(data);
      } else {
        toast.error(data.message || 'Failed to fetch invitation codes');
      }
    } catch (error) {
      toast.error('Failed to fetch invitation codes');
    }
  };

  const generateCode = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:6166/api/admin/invitation-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ expiresInDays: parseInt(expiresInDays) })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Invitation code generated successfully!');
        fetchInvitationCodes();
      } else {
        toast.error(data.message || 'Failed to generate invitation code');
      }
    } catch (error) {
      toast.error('Failed to generate invitation code');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invitation code?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:6166/api/admin/invitation-codes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Invitation code deleted successfully!');
        fetchInvitationCodes();
      } else {
        toast.error(data.message || 'Failed to delete invitation code');
      }
    } catch (error) {
      toast.error('Failed to delete invitation code');
    }
  };

  useEffect(() => {
    fetchInvitationCodes();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Generate Admin Invitation Code</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Expires in (days)</label>
            <input
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="input"
              min="1"
              max="365"
            />
          </div>
          <button
            onClick={generateCode}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Invitation Codes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Used By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
              {invitationCodes.map((code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {code.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {code.creator?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {code.usedByUser?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      code.isUsed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {code.isUsed ? 'Used' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {code.expiresAt ? formatDate(code.expiresAt) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {!code.isUsed && (
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 