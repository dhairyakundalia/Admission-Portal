import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { useNavigate } from 'react-router-dom';

function UserDashboardPage() {
    const navigate = useNavigate();
    const { axios: authAxios } = useAuth();
    const [activeTab, setActiveTab] = useState('forms');
    const [degreeForms, setDegreeForms] = useState([]);
    const [filledForms, setFilledForms] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [formsRes, submissionsRes] = await Promise.all([
                    authAxios.get('/degree-forms'),
                    authAxios.get('/user/filled-forms'),
                ]);
                setDegreeForms(formsRes.data.data || []);
                setFilledForms(submissionsRes.data.data || []);
            } catch (err) {
                console.error('Error loading dashboard data:', err);
            }
        };

        fetchData();
    }, []);

    const sidebarItems = [
        { key: 'forms', label: 'Forms' },
        { key: 'submissions', label: 'Submitted Responses' },
    ];

    return (
        <DashboardLayout
            sidebarItems={sidebarItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >
            {activeTab === 'forms' && (
                <>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Available Forms</h2>
                    {degreeForms.length === 0 ? (
                        <p className="text-gray-600 p-4 bg-white rounded-md shadow-sm">No forms available.</p>
                    ) : (
                        <ul className="space-y-4">
                            {degreeForms.map((form) => (
                                <li
                                    key={form._id}
                                    className="bg-white p-4 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
                                >
                                    <span className="font-medium text-gray-800 text-lg">{form.title}</span>
                                    <button className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 text-sm transition-colors duration-200" onClick={() => navigate(`/user-dashboard/apply/${form._id}`)}>
                                        Apply
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {activeTab === 'submissions' && (
                <>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Your Submitted Responses</h2>
                    {filledForms.length === 0 ? (
                        <p className="text-gray-600 p-4 bg-white rounded-md shadow-sm">You haven't filled any forms yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {filledForms.map((submission) => (
                                <li
                                    key={submission._id}
                                    className="bg-white p-4 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
                                >
                                    <span className="font-medium text-gray-800 text-lg">{submission.degreeFormTitle || 'Untitled Form'}</span>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-md hover:bg-gray-300 transition-colors duration-200" onClick={() => navigate(`/user-dashboard/view/${submission._id}`)}>
                                            View
                                        </button>
                                        <button
                                            className="bg-orange-400 text-white text-sm px-3 py-1 rounded-md hover:bg-orange-500 transition-colors duration-200"
                                            onClick={() => navigate(`/user-dashboard/edit-details/${submission._id}`)}
                                        >
                                            Edit Details
                                        </button>
                                        <button
                                            className="bg-purple-600 text-white text-sm px-3 py-1 rounded-md hover:bg-purple-700 transition-colors duration-200"
                                            onClick={() => navigate(`/user-dashboard/upload-documents/${submission._id}`)}
                                        >
                                            Upload Documents
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </DashboardLayout>
    );
}

export default UserDashboardPage;
