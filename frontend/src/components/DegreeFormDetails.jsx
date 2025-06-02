import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function DegreeFormDetails({ editMode, setEditMode, degreeFormId = null, fetchDegreeForms, activeTab }) {
    const { axios: authAxios } = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        activeFrom: "",
        lastDate: "",
    });

    const [dateError, setDateError] = useState('');

    const utcToIst = (utcDate) => {
        const date = new Date(utcDate);
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(date.getTime() + IST_OFFSET);
        return istDate
    }
    const fetchDegreeForm = async () => {
        try {
            const res = await authAxios.get(`/degree-form/${degreeFormId}`);
            const responseData = res.data.data || {};
            setFormData({
                ...responseData,
                activeFrom: responseData.activeFrom ? utcToIst(responseData.activeFrom).toISOString().split('T')[0] : '',
                lastDate: responseData.lastDate ? utcToIst(responseData.lastDate).toISOString().split('T')[0] : ''
            })
        } catch (err) {
            console.error('Failed to load degree forms:', err);
        }
    };

    const isValidDateRange = (from, to) => {
        return (new Date(to) >= new Date(from));
    };

    useEffect(() => {
        if (editMode && degreeFormId) {
            fetchDegreeForm();
        }
    }, [editMode, degreeFormId]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!isValidDateRange(formData.activeFrom, formData.lastDate)) {
            setDateError('Last date must be after or equal to Active From date.');
            return;
        } else {
            setDateError('');
        }

        if (editMode && degreeFormId) {
            try {
                await authAxios.put(`/admin/degree-form/${degreeFormId}`, formData);
                alert('Form updated!');
                setFormData({ title: "", description: "", activeFrom: "", lastDate: "" });
                fetchDegreeForms();
                setEditMode(false);
            } catch (err) {
                console.error('Error updating form:', err);
                alert('Failed to update form.');
            }
        }
        else {
            try {
                await authAxios.post('/admin/degree-form', formData);
                alert('Form created!');
                setFormData({ title: "", description: "", activeFrom: "", lastDate: "" });
                setEditMode(false);
            } catch (err) {
                console.error('Error creating form:', err);
                alert('Failed to create form.');
            }
        }
    };

    return (
        <form
            onSubmit={async (e) => handleFormSubmit(e)}
            className="space-y-4 max-w-lg bg-white p-6 rounded-md shadow-lg"
        >
            <div>
                <label className="block font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div>
                <label className="block font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block font-medium text-gray-700 mb-1">Active From <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        required
                        min={utcToIst(new Date()).toISOString().split('T')[0]}
                        value={formData.activeFrom}
                        onChange={(e) => setFormData({ ...formData, activeFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="flex-1">
                    <label className="block font-medium text-gray-700 mb-1">Last Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        required
                        min={utcToIst(new Date()).toISOString().split('T')[0]}
                        value={formData.lastDate}
                        onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
            <div className="flex gap-2 mt-4">
                {editMode && activeTab === 'manageForms' && (
                    <button
                        type="button"
                        className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200'
                        onClick={() => setEditMode(false)}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                    {editMode ? 'Update Form' : 'Create Form'}
                </button>
            </div>
        </form>
    )
}

export default DegreeFormDetails
