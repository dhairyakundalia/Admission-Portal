// import React from 'react';
// import { useAuth } from '../contexts/AuthContext.jsx';

// function DashboardLayout({ sidebarItems = [], activeTab, setActiveTab, children }) {
//   const { user, logout } = useAuth();

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-100">
//       {/* Top Nav */}
//       <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
//             {user?.name?.charAt(0) || 'U'}
//           </div>
//           <h1 className="text-lg font-semibold text-gray-800">
//             Welcome, {user?.name || 'User'}
//           </h1>
//         </div>
//         <button
//           onClick={logout}
//           className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Layout */}
//       <div className="flex flex-1">
//         {/* Sidebar */}
//         <div className="w-64 bg-white shadow-md p-4">
//           <ul className="space-y-1">
//             {sidebarItems.map((item) => (
//               <li key={item.key}>
//                 <button
//                   onClick={() => !item.disabled && setActiveTab(item.key)}
//                   className={`w-full text-left px-3 py-2 rounded ${activeTab === item.key
//                     ? 'bg-blue-100 text-blue-700 font-semibold'
//                     : 'hover:bg-gray-100 text-gray-800'
//                     } ${item.disabled
//                       ? 'opacity-50 cursor-not-allowed hover:bg-transparent'
//                       : ''
//                     }`}
//                   disabled={item.disabled}
//                 >
//                   {item.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6 rounded-md">{children}</div>
//       </div>
//     </div>
//   );
// }

// export default DashboardLayout;

import  { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function DashboardLayout({ sidebarItems = [], activeTab, setActiveTab, children }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center rounded-md">
        <div className="flex items-center gap-3">
          <button
            className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-gray-800">
            Welcome, {user?.name || 'User'}
          </h1>
        </div>
        <button
          onClick={logout}
          className="text-xs sm:text-sm bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:bg-red-600 transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-1 relative">
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:relative sm:translate-x-0 sm:shadow-md sm:flex-shrink-0`}
        >
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    if (!item.disabled) {
                      setActiveTab(item.key);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200
                    ${activeTab === item.key
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'hover:bg-gray-100 text-gray-800'
                    } ${item.disabled
                      ? 'opacity-50 cursor-not-allowed hover:bg-transparent'
                      : ''
                    }`}
                  disabled={item.disabled}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 p-4 sm:p-6 rounded-md overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
