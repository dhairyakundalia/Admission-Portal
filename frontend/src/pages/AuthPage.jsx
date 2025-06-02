// // src/pages/AuthPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import LoginPage from '../components/LoginPage.jsx';
// import RegisterPage from '../components/RegisterPage.jsx';
// import OTPVerification from '../components/OTPVerification.jsx';
// import { useAuth } from '../contexts/AuthContext.jsx';

// function AuthPage() {
//   const [showRegister, setShowRegister] = useState(false);
//   const [showOTP, setShowOTP] = useState(false);
//   const [userIdForOTP, setUserIdForOTP] = useState(null); // Store userId for OTP verification
//   const navigate = useNavigate();
//   const { isAuthenticated, isAdmin, isUser, loading } = useAuth(); // Get auth state from context

//   // Handle redirection based on authentication status and role
//   useEffect(() => {
//     if (!loading && isAuthenticated) {
//       if (isAdmin) {
//         navigate('/admin-dashboard', { replace: true });
//       } else if (isUser) {
//         navigate('/user-dashboard', { replace: true });
//       }
//       // If isAuthenticated but no specific role, or unknown role, redirect to unauthorized
//       else {
//         navigate('/unauthorized', { replace: true });
//       }
//     }
//   }, [isAuthenticated, isAdmin, isUser, loading, navigate]);

//   // Function called after successful registration API call
//   // This will set the userId and transition to OTP verification screen
//   const handleRegistrationSuccess = (userId) => {
//     setUserIdForOTP(userId);
//     setShowRegister(false);
//     setShowOTP(true);
//   };

//   // Resend OTP function (calls backend directly)
//   const handleResendOtp = async (userId) => {
//     const { axios: authAxios } = useAuth(); // Get axios instance from context
//     try {
//       // Backend expects userId in body to identify which user's OTP to resend
//       const response = await authAxios.post('/authentication/resend-otp', { userId });
//       alert(response.data.message || "OTP resent successfully!");
//       return Promise.resolve();
//     } catch (error) {
//       console.error("Error resending OTP:", error.response?.data?.message || error.message);
//       alert(error.response?.data?.message || "Failed to resend OTP.");
//       return Promise.reject(error);
//     }
//   };

//   if (loading) {
//     return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
//   }

//   // If already authenticated, don't show login/register forms, just wait for redirect
//   if (isAuthenticated) {
//     return null;
//   } 

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
//       {!showRegister && !showOTP && (
//         <>
//           <LoginPage /> {/* LoginPage now handles its own success via AuthContext.login() */}
//           <p className="mt-6 text-gray-700">
//             Don't have an account?{' '}
//             <span onClick={() => setShowRegister(true)} className="text-blue-600 hover:underline cursor-pointer">
//               Register
//             </span>
//           </p>
//         </>
//       )}

//       {showRegister && !showOTP && (
//         <RegisterPage
//           onRegistrationSuccess={handleRegistrationSuccess}
//           onSwitchToLogin={() => setShowRegister(false)}
//         />
//       )}

//       {showOTP && (
//         <OTPVerification
//           userId={userIdForOTP}
//           onResendOtp={handleResendOtp}
//         />
//       )}
//     </div>
//   );
// }

// export default AuthPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../components/LoginPage.jsx';
import RegisterPage from '../components/RegisterPage.jsx';
import OTPVerification from '../components/OTPVerification.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function AuthPage() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'otp'
  const [userIdForOTP, setUserIdForOTP] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isUser, loading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin-dashboard', { replace: true });
      } else if (isUser) {
        navigate('/user-dashboard', { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isUser, loading, navigate]);

  // Handle successful registration
  const handleRegistrationSuccess = (userId) => {
    setUserIdForOTP(userId);
    setCurrentView('otp');
  };

  // Handle switching between views
  const switchToLogin = () => setCurrentView('login');
  const switchToRegister = () => setCurrentView('register');

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

  // Don't render auth forms if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {currentView === 'login' && (
          <div className="space-y-6">
            <LoginPage />
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={switchToRegister}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline focus:outline-none"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        )}

        {currentView === 'register' && (
          <RegisterPage
            onRegistrationSuccess={handleRegistrationSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}

        {currentView === 'otp' && userIdForOTP && (
          <OTPVerification userId={userIdForOTP} />
        )}
      </div>
    </div>
  );
}

export default AuthPage;