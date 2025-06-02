import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import DegreeFormDetails from '../components/DegreeFormDetails.jsx';
import ViewSubmissions from '../components/ViewSubmissions.jsx';

function AdminDashboardPage() {
  const { axios: authAxios } = useAuth();
  const [activeTab, setActiveTab] = useState('manageForms');
  const [degreeForms, setDegreeForms] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editFormId, setEditFormId] = useState('');
  const [viewingFormId, setViewingFormId] = useState(null);

  const fetchDegreeForms = async () => {
    try {
      const res = await authAxios.get('/degree-forms');
      setDegreeForms(res.data.data || []);
    } catch (err) {
      console.error('Failed to load degree forms:', err);
    }
  };
  useEffect(() => {
    if (activeTab === 'manageForms')
      fetchDegreeForms();
  }, [activeTab]);

  const handleDelete = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    try {
      await authAxios.delete(`/admin/degree-form/${formId}`);
      setDegreeForms((prev) => prev.filter((f) => f._id !== formId));
    } catch (err) {
      console.error('Error deleting form:', err);
      alert('Failed to delete form.');
    }
  };

  const handleEditForm = (formId) => {
    setEditFormId(formId);
    setEditMode(true);
  }

  const sidebarItems = [
    { key: 'manageForms', label: 'Manage Forms' },
    { key: 'createForm', label: 'Create Form' },
    { key: 'viewSubmissions', label: 'Form Submissions', disabled: !viewingFormId },
  ];

  useEffect(() => {
    if (activeTab !== 'viewSubmissions') {
      setViewingFormId(null)
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'manageForms')
      setEditMode(false);
  }, [activeTab])

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === 'manageForms' && (
        <>
          {editMode ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Form</h2>
              <DegreeFormDetails
                editMode={editMode}
                setEditMode={setEditMode}
                degreeFormId={editFormId}
                fetchDegreeForms={fetchDegreeForms}
                activeTab={activeTab}
              />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800">All Forms</h2>
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                          onClick={() => handleEditForm(form._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors duration-200"
                          onClick={() => {
                            setViewingFormId(form._id);
                            setActiveTab('viewSubmissions');
                          }}
                        >
                          View Submissions
                        </button>
                        <button
                          onClick={() => handleDelete(form._id)}
                          className="bg-red-600 text-white text-sm px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'createForm' && (
        <>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Form</h2>
          <DegreeFormDetails
            editMode={editMode}
            setEditMode={setEditMode}
            fetchDegreeForms={fetchDegreeForms}
            activeTab={activeTab} />
        </>
      )}

      {activeTab === 'viewSubmissions' && (
        <ViewSubmissions
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewingFormId={viewingFormId}
          setViewingFormId={setViewingFormId}
        />
      )}
    </DashboardLayout>
  );
}

export default AdminDashboardPage;
