import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function UploadDocumentsPage() {
    const { submissionId } = useParams();
    const { axios: authAxios } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [documentFiles, setDocumentFiles] = useState({
        candidatePhoto: null,
        aadharCard: null,
        sscMarksheet: null,
        hscMarksheet: null,
        gujcetMarksheet: null,
        leavingCertificate: null
    });
    const [existingDocuments, setExistingDocuments] = useState({});

    useEffect(() => {
        const fetchSubmissionDocuments = async () => {
            try {
                setError(null);
                const res = await authAxios.get(`/user/filled-form/${submissionId}`);
                const submission = res.data.data;

                setExistingDocuments(submission.documents || {});

            } catch (err) {
                console.error('Failed to fetch submission documents:', err);
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
        fetchSubmissionDocuments();
    }, [submissionId, authAxios]);

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        setDocumentFiles(prevFiles => ({
            ...prevFiles,
            [fieldName]: file
        }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();

        for (const key in documentFiles) {
            if (documentFiles[key]) {
                formData.append(key, documentFiles[key]);
            }
        }

        if (Array.from(formData.entries()).length === 0) {
            setError("No new documents selected for upload.");
            return;
        }

        try {
            const res = await authAxios.patch(`/user/update-documents/${submissionId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert(res.data.message || 'Documents updated successfully!');
            navigate('/user-dashboard');

        } catch (err) {
            console.error('Failed to upload documents:', err);
            if (err.response) {
                if (err.response.status === 400 && err.response.data.message.includes("is not active")) {
                    setError("Upload failed: The form is not active.");
                } else if (err.response.status === 400 && err.response.data.message.includes("submission is closed")) {
                    setError("Upload failed: This form is no longer accepting submissions.");
                } else if (err.response.status === 409 && err.response.data.message.includes("not submitted")) {
                    setError("Upload failed: You have not submitted this form.");
                } else if (err.response.status === 401 || err.response.status === 403) {
                    setError("Upload failed: You are not authorized.");
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

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
            <h1 className="text-3xl font-extrabold mb-3 text-gray-900 border-b-2 border-indigo-200 pb-2">
                Upload Your Documents
            </h1>
            <p className="text-gray-600 mb-6">Upload or re-upload your required documents. Existing documents will be replaced.</p>

            <form onSubmit={handleUpload} className="space-y-8">
                <div className="bg-orange-50 p-6 rounded-md border border-orange-200">
                    <h2 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-300 pb-2">Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="candidatePhoto" className="block text-sm font-medium text-gray-700">Candidate Photo <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="candidatePhoto"
                                accept="image/*, application/pdf"
                                onChange={(e) => handleFileChange(e, "candidatePhoto")}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {existingDocuments.candidatePhoto && <a href={existingDocuments.candidatePhoto} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-1 block">View Current Photo</a>}
                        </div>
                        <div>
                            <label htmlFor="aadharCard" className="block text-sm font-medium text-gray-700">Aadhar Card <span className="text-gray-500">(Optional)</span></label>
                            <input
                                type="file"
                                id="aadharCard"
                                accept="application/pdf,image/*"
                                onChange={(e) => handleFileChange(e, "aadharCard")}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {existingDocuments.aadharCard && <a href={existingDocuments.aadharCard} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-1 block">View Current Aadhar</a>}
                        </div>
                        <div>
                            <label htmlFor="sscMarksheet" className="block text-sm font-medium text-gray-700">SSC Marksheet <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="sscMarksheet"
                                accept="application/pdf,image/*"
                                onChange={(e) => handleFileChange(e, "sscMarksheet")}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {existingDocuments.sscMarksheet && <a href={existingDocuments.sscMarksheet} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-1 block">View Current SSC Marksheet</a>}
                        </div>
                        <div>
                            <label htmlFor="hscMarksheet" className="block text-sm font-medium text-gray-700">HSC Marksheet <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="hscMarksheet"
                                accept="application/pdf,image/*"
                                onChange={(e) => handleFileChange(e, "hscMarksheet")}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {existingDocuments.hscMarksheet && <a href={existingDocuments.hscMarksheet} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-1 block">View Current HSC Marksheet</a>}
                        </div>
                        <div>
                            <label htmlFor="gujcetMarksheet" className="block text-sm font-medium text-gray-700">GUJCET Marksheet <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="gujcetMarksheet"
                                accept="application/pdf,image/*"
                                onChange={(e) => handleFileChange(e, "gujcetMarksheet")}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {existingDocuments.gujcetMarksheet && <a href={existingDocuments.gujcetMarksheet} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-1 block">View Current GUJCET Marksheet</a>}
                        </div>
                        <div>
                            <label htmlFor="leavingCertificate" className="block text-sm font-medium text-gray-700">Leaving Certificate <span className="text-gray-500">(Optional)</span></label>
                            <input
                                type="file"
                                id="leavingCertificate"
                                accept="application/pdf,image/*"
                                onChange={(e) => handleFileChange(e, "leavingCertificate")}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {existingDocuments.leavingCertificate && <a href={existingDocuments.leavingCertificate} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-1 block">View Current Leaving Certificate</a>}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    Upload Documents
                </button>
            </form>
        </div>
    );
}

export default UploadDocumentsPage;
