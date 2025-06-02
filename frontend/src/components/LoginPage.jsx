// // src/components/LoginPage.jsx
// import React, { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext.jsx'; // Import useAuth
// import { useNavigate } from 'react-router-dom'; // To redirect on success

// function LoginPage() {
//   const [email, setEmail] = useState(''); // Use email directly as identifier is passed
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login, axios: authAxios } = useAuth(); // Get login and axios from context
//   const navigate = useNavigate(); // For direct navigation on error (if needed)

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await authAxios.post('/authentication/login', { email, password }); // Use authAxios for cookie handling

//       if (response.data.statusCode === 200) { // Check your ApiResponse structure
//         console.log('Login successful, cookies set by backend.');
//         await login(); // Tell AuthContext to fetch user data
//         // AuthPage's useEffect will handle the actual dashboard navigation
//       } else {
//         // This part might not be hit if backend throws ApiError with non-2xx status
//         setError(response.data.message || 'Login failed unexpectedly.');
//       }
//     } catch (err) {
//       console.error('Login error:', err.response?.data?.message || err.message);
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
//       // Optional: if login fails severely, you might want to redirect
//       // navigate('/auth');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-10 rounded-lg shadow-xl text-center">
//       <form onSubmit={handleSubmit}>
//         <h2 className="text-3xl font-bold mb-8 text-gray-800">Login</h2>
//         {error && <p className="text-red-500 mb-4 text-sm text-left">{error}</p>}
//         <div className="mb-5 text-left">
//           <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
//             Email:
//           </label>
//           <input
//             type="email" // Changed to email type
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             disabled={loading}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />
//         </div>
//         <div className="mb-6 text-left">
//           <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
//             Password:
//           </label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             disabled={loading}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Logging In...' : 'Login'}
//         </button>
//       </form>
//     </div>
//   );
//   }

// export default LoginPage;

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, axios: authAxios } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAxios.post('/authentication/login', { 
        email, 
        password 
      });

      if (response.data.statusCode === 200) {
        console.log('Login successful');
        await login(); // Fetch user data and trigger redirect
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg max-w-md shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;