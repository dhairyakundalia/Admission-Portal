import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function EditSubmissionDetailsPage() {
    const { submissionId } = useParams();
    const { axios: authAxios } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        personalDetails: {},
        educationalDetails: {},
        branchPreferences: {},
    });

    const [selectedBranches, setSelectedBranches] = useState([]);
    const allBranchOptions = ["CS", "IT", "EC", "CH", "MH", "IC", "CL"];
    useEffect(() => {
        const currentSelection = Object.values(formData.branchPreferences).filter(Boolean);
        setSelectedBranches(currentSelection);
    }, [formData.branchPreferences]);

    useEffect(() => {
        const fetchSubmissionData = async () => {
            try {
                setError(null);
                const res = await authAxios.get(`/user/filled-form/${submissionId}`);
                const submission = res.data.data;

                setFormData({
                    personalDetails: submission.personalDetails || {},
                    educationalDetails: submission.educationalDetails || {},
                    branchPreferences: submission.branchPreferences || {},
                });

            } catch (err) {
                console.error('Failed to fetch submission for editing:', err);
                if (err.response) {
                    if (err.response.status === 404) {
                        setError("Form not found.");
                    } else if (err.response.status === 400 && err.response.data.message.includes("is not active")) {
                        setError("This form is not active.");
                    } else if (err.response.status === 400 && err.response.data.message.includes("submission is closed")) {
                        setError("This form is no longer accepting submissions.");
                    } else if (err.response.status === 409 && err.response.data.message.includes("not submitted")) {
                        setError("You have not submitted this form.");
                    } else if (err.response.status === 401 || err.response.status === 403) {
                        setError("You are not authorized to access or apply for this form.");
                    } else {
                        setError(err.response.data.message || "Failed to load form. An unexpected error occurred.");
                    }
                } else {
                    setError("Network error or server unavailable. Please try again.");
                }
            }
        };
        fetchSubmissionData();
    }, [submissionId, authAxios]);

    const handleInputChange = (e, section) => {
        const { name, value } = e.target;

        if (section === "branchPreferences") {
            setFormData(prev => {
                const updatedBranchPreferences = { ...prev.branchPreferences, [name]: value };
                if (!value) {
                    const currentPrefIndex = parseInt(name.replace("pref", ""), 10);
                    for (let i = currentPrefIndex + 1; i <= 7; i++) {
                        updatedBranchPreferences[`pref${i}`] = "";
                    }
                }
                return {
                    ...prev,
                    branchPreferences: updatedBranchPreferences
                };
            })
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [section]: {
                    ...prevFormData[section],
                    [name]: value
                }
            }));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const dataToUpdate = {
                personalDetails: {
                    ...formData.personalDetails,
                    dob: formData.personalDetails.dob ? new Date(formData.personalDetails.dob).toISOString() : '',
                },
                educationalDetails: {
                    ...formData.educationalDetails,
                    sscPassingYear: isNaN(formData.educationalDetails.sscPassingYear) ? formData.educationalDetails.sscPassingYear : new Date(formData.educationalDetails.sscPassingYear, 0, 1).toISOString(),
                    sscPercentile: isNaN(formData.educationalDetails.sscPercentile) ? Number(formData.educationalDetails.sscPercentile) : formData.educationalDetails.sscPercentile,
                    hscPassingYear: isNaN(formData.educationalDetails.hscPassingYear) ? formData.educationalDetails.hscPassingYear : new Date(formData.educationalDetails.hscPassingYear, 0, 1).toISOString(),
                    hscTotalPercentile: isNaN(formData.educationalDetails.hscTotalPercentile) ? Number(formData.educationalDetails.hscTotalPercentile) : formData.educationalDetails.hscTotalPercentile,
                    hscSciencePercentile: isNaN(formData.educationalDetails.hscSciencePercentile) ? Number(formData.educationalDetails.hscSciencePercentile) : formData.educationalDetails.hscSciencePercentile,
                    gujcetPassingYear: isNaN(formData.educationalDetails.gujcetPassingYear) ? formData.educationalDetails.gujcetPassingYear : new Date(formData.educationalDetails.gujcetPassingYear, 0, 1).toISOString(),
                    gujcetMarks: isNaN(formData.educationalDetails.gujcetMarks) ? Number(formData.educationalDetails.gujcetMarks) : formData.educationalDetails.gujcetMarks,
                    gujcetPercentile: isNaN(formData.educationalDetails.gujcetPercentile) ? Number(formData.educationalDetails.gujcetPercentile) : formData.educationalDetails.gujcetPercentile,
                },
                branchPreferences: {
                    ...formData.branchPreferences,
                }
            };

            console.log(dataToUpdate);
            const res = await authAxios.put(`/user/update-details/${submissionId}`, dataToUpdate);

            alert(res.data.message || 'Submission details updated successfully!');
            navigate('/user-dashboard');

        } catch (err) {
            console.error('Failed to update submission details:', err);
            if (err.response) {
                if (err.response.status === 400 && err.response.data.message.includes("is not active")) {
                    setError("Update failed: The form is not active.");
                } else if (err.response.status === 400 && err.response.data.message.includes("submission is closed")) {
                    setError("Update failed: This form is no longer accepting submissions.");
                } else if (err.response.status === 409 && err.response.data.message.includes("not submitted")) {
                    setError("Update failed: You have not submitted this form.");
                } else if (err.response.status === 401 || err.response.status === 403) {
                    setError("Update failed: You are not authorized.");
                } else {
                    setError(err.response.data.message || 'Submission failed. An unexpected error occurred.');
                }
            } else {
                setError("Network error or server unavailable. Please try again.");
            }
        }
    };

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-red-700 bg-red-100 border border-red-400 rounded-md mt-8">
                <h1 className="text-xl font-bold mb-4">Error</h1>
                <p>{error}</p>
                <button onClick={() => navigate('/user-dashboard')} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200">
                    Return to Dashboard
                </button>
            </div>
        );
    }
    if (!formData.personalDetails) return <p className="text-center mt-8 text-gray-600">No submission data found to edit.</p>;


    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
            <h1 className="text-3xl font-extrabold mb-3 text-gray-900 border-b-2 border-indigo-200 pb-2">
                Edit Your Submission Details
            </h1>

            <form onSubmit={handleUpdate} className="space-y-8">

                <div className="bg-indigo-50 p-6 rounded-md border border-indigo-200">
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4 border-b border-indigo-300 pb-2">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="fullName" name="fullName" value={formData.personalDetails.fullName ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input type="date" id="dob" name="dob" value={formData.personalDetails.dob ? (new Date(formData.personalDetails.dob)).toISOString().split('T')[0] : ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select id="gender" name="gender" value={formData.personalDetails.gender ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" name="email" value={formData.personalDetails.email ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile No</label>
                            <input type="text" id="mobileNo" name="mobileNo" value={formData.personalDetails.mobileNo ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">Guardian Name</label>
                            <input type="text" id="guardianName" name="guardianName" value={formData.personalDetails.guardianName ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="guardianMobileNo" className="block text-sm font-medium text-gray-700">Guardian Mobile No</label>
                            <input type="text" id="guardianMobileNo" name="guardianMobileNo" value={formData.personalDetails.guardianMobileNo ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="guardianEmail" className="block text-sm font-medium text-gray-700">Guardian Email</label>
                            <input type="email" id="guardianEmail" name="guardianEmail" value={formData.personalDetails.guardianEmail ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea id="address" name="address" value={formData.personalDetails.address ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="city" name="city" value={formData.personalDetails.city ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="state" name="state" value={formData.personalDetails.state ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                            <input type="text" id="pincode" name="pincode" value={formData.personalDetails.pincode ?? ""} onChange={(e) => handleInputChange(e, "personalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-md border border-emerald-200">
                    <h2 className="text-2xl font-semibold text-emerald-800 mb-4 border-b border-emerald-300 pb-2">Educational Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-2 border-b border-emerald-300 pb-1">SSC Details:</h3>
                        <div>
                            <label htmlFor="sscSchoolName" className="block text-sm font-medium text-gray-700">SSC School Name</label>
                            <input type="text" id="sscSchoolName" name="sscSchoolName" value={formData.educationalDetails.sscSchoolName ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="sscBoard" className="block text-sm font-medium text-gray-700">SSC Board</label>
                            <input type="text" id="sscBoard" name="sscBoard" value={formData.educationalDetails.sscBoard ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="sscPassingYear" className="block text-sm font-medium text-gray-700">SSC Passing Year</label>
                            <input type="number" id="sscPassingYear" name="sscPassingYear" value={formData.educationalDetails.sscPassingYear ? (new Date(formData.educationalDetails.sscPassingYear).getFullYear()) : ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="sscPercentile" className="block text-sm font-medium text-gray-700">SSC Percentile</label>
                            <input type="number" step="0.01" id="sscPercentile" name="sscPercentile" value={formData.educationalDetails.sscPercentile ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>

                        <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-4 border-b border-emerald-300 pb-1">HSC Details:</h3>
                        <div>
                            <label htmlFor="hscStream" className="block text-sm font-medium text-gray-700">HSC Stream</label>
                            <input type="text" id="hscStream" name="hscStream" value={formData.educationalDetails.hscStream ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscSchoolName" className="block text-sm font-medium text-gray-700">HSC School Name</label>
                            <input type="text" id="hscSchoolName" name="hscSchoolName" value={formData.educationalDetails.hscSchoolName ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscBoard" className="block text-sm font-medium text-gray-700">HSC Board</label>
                            <input type="text" id="hscBoard" name="hscBoard" value={formData.educationalDetails.hscBoard ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscPassingYear" className="block text-sm font-medium text-gray-700">HSC Passing Year</label>
                            <input type="number" id="hscPassingYear" name="hscPassingYear" value={formData.educationalDetails.hscPassingYear ? (new Date(formData.educationalDetails.hscPassingYear).getFullYear()) : ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscTotalPercentile" className="block text-sm font-medium text-gray-700">HSC Total Percentile</label>
                            <input type="number" step="0.01" id="hscTotalPercentile" name="hscTotalPercentile" value={formData.educationalDetails.hscTotalPercentile ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscSciencePercentile" className="block text-sm font-medium text-gray-700">HSC Science Percentile</label>
                            <input type="number" step="0.01" id="hscSciencePercentile" name="hscSciencePercentile" value={formData.educationalDetails.hscSciencePercentile ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>

                        <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-4 border-b border-emerald-300 pb-1">GUJCET Details:</h3>
                        <div>
                            <label htmlFor="gujcetRollNo" className="block text-sm font-medium text-gray-700">GUJCET Roll No</label>
                            <input type="text" id="gujcetRollNo" name="gujcetRollNo" value={formData.educationalDetails.gujcetRollNo ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="gujcetPassingYear" className="block text-sm font-medium text-gray-700">GUJCET Passing Year</label>
                            <input type="number" id="gujcetPassingYear" name="gujcetPassingYear" value={formData.educationalDetails.gujcetPassingYear ? (new Date(formData.educationalDetails.gujcetPassingYear).getFullYear()) : ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="gujcetMarks" className="block text-sm font-medium text-gray-700">GUJCET Marks</label>
                            <input type="number" step="0.01" id="gujcetMarks" name="gujcetMarks" value={formData.educationalDetails.gujcetMarks ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="gujcetPercentile" className="block text-sm font-medium text-gray-700">GUJCET Percentile</label>
                            <input type="number" step="0.01" id="gujcetPercentile" name="gujcetPercentile" value={formData.educationalDetails.gujcetPercentile ?? ""} onChange={(e) => handleInputChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-md border border-indigo-200">
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4 border-b border-indigo-300 pb-2">Branch Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const prefKey = `pref${i + 1}`;
                            const isDisabled = i > 0 && !formData.branchPreferences[`pref${i}`];
                            const availableOptions = allBranchOptions.filter(
                                (opt) => !selectedBranches.includes(opt) || formData.branchPreferences[prefKey] === opt
                            );

                            return (
                                <div key={prefKey}>
                                    <label htmlFor={prefKey} className="block text-sm font-medium text-gray-700">
                                        Preference {i + 1}
                                    </label>
                                    <select
                                        id={prefKey}
                                        name={prefKey}
                                        value={formData.branchPreferences[prefKey] ?? ""}
                                        onChange={(e) => handleInputChange(e, "branchPreferences")}
                                        disabled={isDisabled}
                                        className={`mt-1 block w-full border ${isDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                            } border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    >
                                        <option value="">Select Branch</option>
                                        {availableOptions.map((opt) => (
                                            <option key={opt} value={opt ?? ""}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    Update Details
                </button>
            </form>
        </div>
    );
}

export default EditSubmissionDetailsPage;
