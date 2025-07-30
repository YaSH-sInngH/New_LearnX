import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Password is required.');
      return;
    } else if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    } else {
      setError('');
    }
    setIsLoading(true);
    
    const token = params.get('token');
    if (!token) {
      toast.error('Invalid or missing token.');
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await resetPassword(token, newPassword);
      if (res.message && res.message.includes('successful')) {
        toast.success('Password reset successful! Redirecting to login...');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(res.message || 'Failed to reset password.');
      }
    } catch (error) {
      toast.error('An error occurred while resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow text-center">
      <h2 className="text-2xl font-bold dark:text-white mb-4">Reset Password</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit}>
        <input 
          type="password" 
          placeholder="New Password" 
          value={newPassword} 
          onChange={e => {
            setNewPassword(e.target.value);
            if (error) setError('');
          }} 
          className={`w-full mb-2 p-2 border rounded dark:text-white ${error ? 'border-danger-500 focus:ring-danger-500' : ''}`} 
          disabled={isLoading}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>
        )}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50 dark:text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Set New Password'}
        </button>
      </form>
      <div className="mt-2 text-sm ">
        <Link to="/login" className="text-blue-600 dark:text-white">Back to Login</Link>
      </div>
    </div>
  );
} 