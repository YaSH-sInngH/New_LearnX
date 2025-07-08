import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import { toast } from 'react-toastify';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying...');
  const [isVerified, setIsVerified] = useState(false);
  const handled = useRef(false);

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      verifyEmail(token).then(res => {
        if (handled.current) return;
        handled.current = true;
        if (res.message && res.message.includes('verified')) {
          setStatus('Email verified successfully!');
          setIsVerified(true);
          toast.success('Email verified successfully!');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus(res.message || 'Verification failed.');
          toast.error(res.message || 'Verification failed.');
        }
      }).catch(error => {
        if (handled.current) return;
        handled.current = true;
        setStatus('Verification failed.');
        toast.error('Verification failed.');
      });
    } else {
      setStatus('Invalid verification link.');
      toast.error('Invalid verification link.');
    }
  }, [params, navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
      <div className={`mb-4 ${isVerified ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
        {status}
      </div>
      {isVerified && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to login page...
        </div>
      )}
      {!isVerified && (
        <a href="/login" className="text-blue-600 block mt-4">Go to Login</a>
      )}
    </div>
  );
} 