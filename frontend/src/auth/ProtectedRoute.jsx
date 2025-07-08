import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useGlobalLoading } from '../App';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const { setShow } = useGlobalLoading();

  if (loading) {
    setShow(true);
    return null;
  } else {
    setShow(false);
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return <Outlet />;
}