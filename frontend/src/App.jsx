import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ApplyFormPage from './pages/ApplyFormPage.jsx';
import ViewFormPage from './pages/ViewFormPage.jsx';
import EditSubmissionDetailsPage from './pages/EditSubmissionDetailsPage.jsx';
import UploadDocumentsPage from './pages/UploadDocumentsPage.jsx'
import './index.css';

// PrivateRoute: Protects routes based on authentication and role
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.warn(`Access denied for user ${user?.email} with role ${user?.role}`);

    // Redirect to appropriate dashboard based on user's role
    if (user?.role === 'user') {
      return <Navigate to="/user-dashboard" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// HomeRedirect: Handles root path "/" redirection based on auth status
const HomeRedirect = () => {
  const { isAuthenticated, isAdmin, isUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (isUser) {
      return <Navigate to="/user-dashboard" replace />;
    }
    // Unknown role but authenticated
    return <Navigate to="/unauthorized" replace />;
  }

  // Not authenticated, go to auth page
  return <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen w-full bg-gray-50">
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected routes */}
            <Route
              path="/user-dashboard"
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <UserDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />

            {/* Unauthorized access page */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center bg-red-50">
                  <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h1>
                    <p className="text-red-600">You are not authorized to view this page.</p>
                  </div>
                </div>
              }
            />

            <Route
              path="/user-dashboard/apply/:degreeFormId"
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <ApplyFormPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user-dashboard/view/:submissionId"
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <ViewFormPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user-dashboard/edit-details/:submissionId"
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <EditSubmissionDetailsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user-dashboard/upload-documents/:submissionId"
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <UploadDocumentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard/view-submission/:submissionId"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ViewFormPage />
                </PrivateRoute>
              }
            />


            {/* Root path - redirects based on auth status */}
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;