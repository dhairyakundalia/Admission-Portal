// import  { createContext, useState, useEffect, useContext, useRef } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const isFetchingUser = useRef(false);

//   // Axios instance with cookie support
//   const axiosInstance = useRef(axios.create({
//     baseURL: 'http://localhost:5000/api', // Fixed the colon
//     withCredentials: true,
//   }));

//   // Fetch current user from backend
//   const fetchCurrentUser = async () => {
//     if (isFetchingUser.current) return;
//     isFetchingUser.current = true;
//     setLoading(true);

//     try {
//       const response = await axiosInstance.current.get('/authentication/current-user');
//       if (response.data?.data) {
//         setUser(response.data.data);
//         console.log("User authenticated:", response.data.data);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error("Failed to fetch user:", error);
//       setUser(null);
//     } finally {
//       isFetchingUser.current = false;
//       setLoading(false);
//     }
//   };

//   // Setup response interceptor for token refresh
//   useEffect(() => {
//   const responseInterceptor = axiosInstance.current.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;

//       if (
//         error.response?.status === 401 &&
//         !originalRequest._retry &&
//         !originalRequest.url?.includes('/authentication/refresh-token') &&
//         !originalRequest.url?.includes('/authentication/login')
//       ) {
//         originalRequest._retry = true;
//         console.log('Access token expired, refreshing...');

//         try {
//           const refreshResponse = await axiosInstance.current.post('/authentication/refresh-token');
          
//           // Check if refresh was actually successful
//           if (refreshResponse.status === 200) {
//             console.log('Token refreshed successfully');
//             await fetchCurrentUser();
//             return axiosInstance.current(originalRequest);
//           } else {
//             throw new Error('Refresh token failed');
//           }
//         } catch (refreshError) {
//           console.error("Token refresh failed:", refreshError);
          
//           // Prevent further refresh attempts
//           if (refreshError.response?.status === 401) {
//             console.log('Refresh token expired');
//           }
//           clearCookies()
//           return Promise.reject(refreshError);
//         }
//       }
//       return Promise.reject(error);
//     }
//   );
  
//   return () => {
//     axiosInstance.current.interceptors.response.eject(responseInterceptor);
//   };
// }, []);

// // Initial authentication check
// useEffect(() => {
//   fetchCurrentUser();
// }, []);

// const clearCookies = async() => {
//   try{
//       await axiosInstance.current.post("/authentication/clear-cookies")
//       console.log("cleared cookies")
//     }
//     catch(error){
//       console.error(error);
//     }
//     finally{
//       setUser(null);
//       navigate('/auth');
//       setLoading(false)
//     }
//   }

//   // Login function - called after successful login/OTP verification
//   const login = async () => {
//     console.log("Login successful, fetching user data...");
//     await fetchCurrentUser();
//   };

//   // Logout function
//   const logout = async () => {
//     try {
//       await axiosInstance.current.post('/authentication/logout');
//       console.log("Logged out successfully");
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       setUser(null);
//       navigate('/auth');
//     }
//   };

//   const value = {
//     user,
//     loading,
//     login,
//     logout,
//     isAuthenticated: !!user?._id,
//     isAdmin: user?.role === 'admin',
//     isUser: user?.role === 'user',
//     axios: axiosInstance.current,
//   };

//   // if (loading) {
//   //   return (
//   //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//   //       <div className="text-center">
//   //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//   //         <p className="mt-4 text-gray-600">Loading...</p>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFetchingUser = useRef(false);

  const axiosInstance = useRef(axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
  }));

  const fetchCurrentUser = async () => {
    if (isFetchingUser.current) return;
    isFetchingUser.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.current.get('/authentication/current-user');
      if (response.data?.data) {
        setUser(response.data.data);
        console.log("User authenticated:", response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      isFetchingUser.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
  const responseInterceptor = axiosInstance.current.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/authentication/refresh-token') &&
        !originalRequest.url?.includes('/authentication/login')
      ) {
        originalRequest._retry = true;
        console.log('Access token expired, refreshing...');

        try {
          const refreshResponse = await axiosInstance.current.post('/authentication/refresh-token');
          
          if (refreshResponse.status === 200) {
            console.log('Token refreshed successfully');
            await fetchCurrentUser();
            return axiosInstance.current(originalRequest);
          } else {
            throw new Error('Refresh token failed');
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          
          if (refreshError.response?.status === 401) {
            console.log('Refresh token expired');
          }
          clearCookies()
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
  
  return () => {
    axiosInstance.current.interceptors.response.eject(responseInterceptor);
  };
}, []);

useEffect(() => {
  fetchCurrentUser();
}, []);

const clearCookies = async() => {
  try{
      await axiosInstance.current.post("/authentication/clear-cookies")
      console.log("cleared cookies")
    }
    catch(error){
      console.error(error);
    }
    finally{
      setUser(null);
      navigate('/auth');
      setLoading(false)
    }
  }

  const login = async () => {
    console.log("Login successful, fetching user data...");
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await axiosInstance.current.post('/authentication/logout');
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      navigate('/auth');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user?._id,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    axios: axiosInstance.current,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
