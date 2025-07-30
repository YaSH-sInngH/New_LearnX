import React, { createContext, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import Login from './auth/Login';
import Signup from './auth/Signup';
import VerifyEmail from './auth/VerifyEmail';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ProtectedRoute from './auth/ProtectedRoute';
import GlobalToaster from './components/GlobalToaster';
import TracksHomepage from './pages/TracksHomepage';
import TrackDetail from './pages/TrackDetail';
import ModuleViewer from './pages/ModuleViewer';
import LearnerDashboard from './pages/LearnerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorTracks from './pages/CreatorTracks';
import AdminDashboard from './pages/AdminDashboard';
import TrackModules from './pages/TrackModules';
import Navbar from './components/NavbarFixed';
import PublicProfile from './pages/PublicProfile';
import GlobalLoader from './components/GlobalLoader';

// Global loading context
export const GlobalLoadingContext = createContext({ show: false, setShow: () => {} });
export function useGlobalLoading() { return useContext(GlobalLoadingContext); }

function Unauthorized() {
  return <div className="p-8 text-red-600">Unauthorized Access</div>;
}

// Utility to get dashboard route by role
function getDashboardRouteByRole(role) {
  switch (role) {
    case 'Learner': return '/dashboard/learner';
    case 'Creator': return '/dashboard/creator';
    case 'Admin': return '/dashboard/admin';
    default: return '/login';
  }
}

// Redirects to the correct dashboard if logged in, otherwise to login
function RootRedirect() {
  const { user } = useAuth();
  if (user && user.role) {
    return <Navigate to={getDashboardRouteByRole(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
}

// Redirects /dashboard to the correct dashboard for the logged-in user
function DashboardRedirect() {
  const { user } = useAuth();
  if (user && user.role) {
    return <Navigate to={getDashboardRouteByRole(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
}

// Redirects /admin to /dashboard/admin for admins, otherwise unauthorized
function AdminRedirect() {
  const { user } = useAuth();
  if (user && user.role === 'Admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return <Navigate to="/unauthorized" replace />;
}

// Wrapper component that conditionally renders Navbar
function AppLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  
  // List of routes where Navbar should not be shown (auth pages)
  const authRoutes = ['/login', '/signup', '/verify', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.includes(location.pathname);
  
  return (
    <>
      {/* Only show Navbar if user is authenticated and not on auth routes */}
      {user && !isAuthRoute && <Navbar />}
      {children}
    </>
  );
}

function App() {
  const [globalLoading, setGlobalLoading] = useState(false);
  return (
      <Router>
        <GlobalLoadingContext.Provider value={{ show: globalLoading, setShow: setGlobalLoading }}>
          <AppLayout>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/admin" element={<AdminRedirect />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes by role */}
              <Route element={<ProtectedRoute roles={["Learner"]} />}>
                <Route path="/dashboard/learner" element={<LearnerDashboard />} />
                <Route path="/tracks" element={<TracksHomepage />} />
                <Route path="/tracks/:trackId" element={<TrackDetail />} />
                <Route path="/module/:moduleId" element={<ModuleViewer />} />
              </Route>
              <Route element={<ProtectedRoute roles={["Creator"]} />}>
                <Route path="/dashboard/creator" element={<CreatorDashboard />} />
                <Route path="/dashboard/creator/tracks" element={<CreatorTracks />} />
                <Route path="/creator/tracks" element={<CreatorTracks />} />
                <Route path="/dashboard/creator/tracks/:trackId/modules" element={<TrackModules />} />
                <Route path="/creator/tracks/:trackId/modules" element={<TrackModules />} />
                <Route path="/tracks" element={<TracksHomepage />} />
                <Route path="/tracks/:trackId" element={<TrackDetail />} />
                <Route path="/module/:moduleId" element={<ModuleViewer />} />
              </Route>
              <Route element={<ProtectedRoute roles={["Admin"]} />}>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Route>

              {/* Default route */}
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <GlobalLoader show={globalLoading} />
          </AppLayout>
          <GlobalToaster />
        </GlobalLoadingContext.Provider>
      </Router>
  );
}

export default App;
