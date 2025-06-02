// // src/components/RegisterPage.jsx
// import React, { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext.jsx'; // Import useAuth

// function RegisterPage({ onRegistrationSuccess, onSwitchToLogin }) {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [mobile_no, setMobileNo] = useState(''); // Corrected to mobile_no for backend
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { axios: authAxios } = useAuth(); // Get axios instance from context

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await authAxios.post('/authentication/register', {
//         name,
//         email,
//         mobile_no, // Corrected field name
//         password,
//       });

//       if (response.data.statusCode === 200 && response.data.data._id) { // Check your ApiResponse structure
//         // Backend now sends userId in data field
//         onRegistrationSuccess(response.data.data._id); // Pass userId for OTP
//       } else {
//         setError(response.data.message || 'Registration failed unexpectedly.');
//       }
//     } catch (err) {
//       console.error('Registration error:', err.response?.data?.message || err.message);
//       setError(err.response?.data?.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md text-center">
//       <form onSubmit={handleSubmit}>
//         <h2 className="text-3xl font-bold mb-8 text-gray-800">Register</h2>
//         {error && <p className="text-red-500 mb-4 text-sm text-left">{error}</p>}
//         <div className="mb-5 text-left">
//           <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
//             Name:
//           </label>
//           <input
//             type="text"
//             id="name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//             disabled={loading}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />
//         </div>
//         <div className="mb-5 text-left">
//           <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
//             Email:
//           </label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             disabled={loading}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />
//         </div>
//         <div className="mb-5 text-left">
//           <label htmlFor="mobileNo" className="block text-gray-700 text-sm font-semibold mb-2">
//             Phone Number:
//           </label>
//           <input
//             type="tel"
//             id="mobileNo"
//             value={mobile_no} // Corrected field name
//             onChange={(e) => setMobileNo(e.target.value)}
//             required
//             pattern="[0-9]{10}"
//             title="Please enter a 10 digit phone number"
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
//           {loading ? 'Registering...' : 'Register'}
//         </button>
//         <p className="mt-5 text-gray-600">
//           Already have an account?{' '}
//           <span onClick={onSwitchToLogin} className="text-blue-600 hover:underline cursor-pointer">
//             Login
//           </span>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default RegisterPage;

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function RegisterPage({ onRegistrationSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_no: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { axios: authAxios } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAxios.post('/authentication/register', formData);

      if (response.data.statusCode === 200 && response.data.data._id) {
        console.log('Registration successful');
        onRegistrationSuccess(response.data.data._id);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="mobile_no" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="mobile_no"
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleInputChange}
            required
            pattern="[0-9]{10}"
            title="Please enter a 10-digit phone number"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Create a password"
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
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline focus:outline-none"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;