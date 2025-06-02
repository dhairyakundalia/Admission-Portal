import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function ApplyFormPage() {
    const { degreeFormId } = useParams();
    console.log(degreeFormId)
    const { axios: authAxios } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        personalDetails: {
            fullName: '',
            dob: '',
            gender: '',
            email: '',
            mobileNo: '',
            guardianName: '',
            guardianMobileNo: '',
            guardianEmail: '',
            address: '',
            city: '',
            state: '',
            pincode: ''
        },
        educationalDetails: {
            sscSchoolName: '',
            sscBoard: '',
            sscPassingYear: '',
            sscPercentile: '',
            hscStream: '',
            hscSchoolName: '',
            hscBoard: '',
            hscPassingYear: '',
            hscTotalPercentile: '',
            hscSciencePercentile: '',
            gujcetRollNo: '',
            gujcetPassingYear: '',
            gujcetMarks: '',
            gujcetPercentile: ''
        },
        branchPreferences: {
            pref1: '',
            pref2: '',
            pref3: '',
            pref4: '',
            pref5: '',
            pref6: '',
            pref7: ''
        },
    });
    const [selectedBranches, setSelectedBranches] = useState([]);
    const allBranchOptions = ["CS", "IT", "EC", "CH", "MH", "IC", "CL"];
    useEffect(() => {
        const currentSelection = Object.values(formData.branchPreferences).filter(Boolean);
        setSelectedBranches(currentSelection);
    }, [formData.branchPreferences]);

    const [candidatePhoto, setCandidatePhoto] = useState(null);
    const [aadharCard, setAadharCard] = useState(null);
    const [sscMarksheet, setSSCMarksheet] = useState(null);
    const [hscMarksheet, setHSCMarksheet] = useState(null);
    const [gujcetMarksheet, setGUJCETMarksheet] = useState(null);
    const [leavingCertificate, setLeavingCertificate] = useState(null);

    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                setError(null);
                const res = await authAxios.get(`/user/degree-form/${degreeFormId}`);
                setForm(res.data.data);
            } catch (err) {
                console.error('Failed to fetch form:', err);
                if (err.response) {
                    if (err.response.status === 404) {
                        setError("Form not found.");
                    } else if (err.response.status === 400 && err.response.data.message.includes("is not active")) {
                        setError("This form is not active.");
                    } else if (err.response.status === 400 && err.response.data.message.includes("submission is closed")) {
                        setError("This form is no longer accepting submissions.");
                    } else if (err.response.status === 409 && err.response.data.message.includes("already submitted")) {
                        setError("You have already submitted this form.");
                    } else if (err.response.status === 401 || err.response.status === 403) {
                        setError("You are not authorized to access or apply for this form.");
                    } else {
                        setError(err.response.data.message || "Failed to load form. An unexpected error occurred.");
                    }
                } else {
                    setError("Network error or server unavailable. Please try again.");
                }
                setForm(null);
            } finally {

            }
        };
        fetchForm();
    }, [degreeFormId, authAxios]);

    const handleTextChange = (e, section) => {
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
        }
        else {

            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: value,
                },
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {

            const dataToSend = {
                ...formData,
                personalDetails: {
                    ...formData.personalDetails,
                    dob: formData.personalDetails.dob ? new Date(formData.personalDetails.dob).toISOString() : '',
                },
                educationalDetails: {
                    ...formData.educationalDetails,
                    sscPassingYear: formData.educationalDetails.sscPassingYear ? new Date(formData.educationalDetails.sscPassingYear, 0, 1).toISOString() : '',
                    sscPercentile: formData.educationalDetails.sscPercentile ? Number(formData.educationalDetails.sscPercentile) : '',
                    hscPassingYear: formData.educationalDetails.hscPassingYear ? new Date(formData.educationalDetails.hscPassingYear, 0, 1).toISOString() : '',
                    hscTotalPercentile: formData.educationalDetails.hscTotalPercentile ? Number(formData.educationalDetails.hscTotalPercentile) : '',
                    hscSciencePercentile: formData.educationalDetails.hscSciencePercentile ? Number(formData.educationalDetails.hscSciencePercentile) : '',
                    gujcetPassingYear: formData.educationalDetails.gujcetPassingYear ? new Date(formData.educationalDetails.gujcetPassingYear, 0, 1).toISOString() : '',
                    gujcetMarks: formData.educationalDetails.gujcetMarks ? Number(formData.educationalDetails.gujcetMarks) : '',
                    gujcetPercentile: formData.educationalDetails.gujcetPercentile ? Number(formData.educationalDetails.gujcetPercentile) : '',
                }
            };

            const submissionFormData = new FormData();
            submissionFormData.append("jsonData", JSON.stringify(dataToSend));
            submissionFormData.append("candidatePhoto", candidatePhoto);
            submissionFormData.append("aadharCard", aadharCard);
            submissionFormData.append("sscMarksheet", sscMarksheet);
            submissionFormData.append("hscMarksheet", hscMarksheet);
            submissionFormData.append("gujcetMarksheet", gujcetMarksheet);
            submissionFormData.append("leavingCertificate", leavingCertificate);


            await authAxios.post(`/user/submit-form/${degreeFormId}`, submissionFormData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            alert('Form submitted successfully!');

            navigate('/user-dashboard');
        } catch (err) {
            console.error('Failed to submit form:', err);
            if (err.response) {
                if (err.response.status === 400 && err.response.data.message.includes("is not active")) {
                    setError("Submission failed: The form is not active.");
                } else if (err.response.status === 400 && err.response.data.message.includes("submission is closed")) {
                    setError("Submission failed: This form is no longer accepting submissions.");
                } else if (err.response.status === 409 && err.response.data.message.includes("already submitted")) {
                    setError("Submission failed: You have already submitted this form.");
                } else if (err.response.status === 401 || err.response.status === 403) {
                    setError("Submission failed: You are not authorized.");
                } else {
                    setError(err.response.data.message || 'Submission failed. An unexpected error occurred.');
                }
            } else {
                setError("Network error or server unavailable. Please try again.");
            }

            alert('Submission failed.');
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


    if (form) return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
            <h1 className="text-3xl font-extrabold mb-3 text-gray-900 border-b-2 border-indigo-200 pb-2">
                Apply for: {form.title || 'Untitled Form'}
            </h1>
            <p className="text-gray-600 text-lg mb-6">{form.description}</p>

            <form onSubmit={handleSubmit} className="space-y-8">

                <div className="bg-indigo-50 p-6 rounded-md border border-indigo-200">
                    <h2 className="text-2xl font-semibold text-indigo-800 mb-4 border-b border-indigo-300 pb-2">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.personalDetails.fullName}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                placeholder="Date of Birth"
                                value={formData.personalDetails.dob}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.personalDetails.gender}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={formData.personalDetails.email}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile No</label>
                            <input
                                type="text"
                                id="mobileNo"
                                name="mobileNo"
                                placeholder="Mobile Number"
                                value={formData.personalDetails.mobileNo}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">Guardian Name</label>
                            <input
                                type="text"
                                id="guardianName"
                                name="guardianName"
                                placeholder="Guardian Name"
                                value={formData.personalDetails.guardianName}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="guardianMobileNo" className="block text-sm font-medium text-gray-700">Guardian Mobile No</label>
                            <input
                                type="text"
                                id="guardianMobileNo"
                                name="guardianMobileNo"
                                placeholder="Guardian Mobile Number"
                                value={formData.personalDetails.guardianMobileNo}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="guardianEmail" className="block text-sm font-medium text-gray-700">Guardian Email</label>
                            <input
                                type="email"
                                id="guardianEmail"
                                name="guardianEmail"
                                placeholder="Guardian Email"
                                value={formData.personalDetails.guardianEmail}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                placeholder="Address"
                                value={formData.personalDetails.address}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                rows={2}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                placeholder="City"
                                value={formData.personalDetails.city}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                placeholder="State"
                                value={formData.personalDetails.state}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                            <input
                                type="text"
                                id="pincode"
                                name="pincode"
                                placeholder="Pincode"
                                value={formData.personalDetails.pincode}
                                onChange={(e) => handleTextChange(e, "personalDetails")}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>


                <div className="bg-emerald-50 p-6 rounded-md border border-emerald-200">
                    <h2 className="text-2xl font-semibold text-emerald-800 mb-4 border-b border-emerald-300 pb-2">Educational Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-2 border-b border-emerald-300 pb-1">SSC Details:</h3>
                        <div>
                            <label htmlFor="sscSchoolName" className="block text-sm font-medium text-gray-700">SSC School Name</label>
                            <input type="text" id="sscSchoolName" name="sscSchoolName" placeholder="SSC School Name" value={formData.educationalDetails.sscSchoolName} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="sscBoard" className="block text-sm font-medium text-gray-700">SSC Board</label>
                            <input type="text" id="sscBoard" name="sscBoard" placeholder="SSC Board" value={formData.educationalDetails.sscBoard} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="sscPassingYear" className="block text-sm font-medium text-gray-700">SSC Passing Year</label>
                            <input type="number" id="sscPassingYear" name="sscPassingYear" placeholder="YYYY" value={formData.educationalDetails.sscPassingYear} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="sscPercentile" className="block text-sm font-medium text-gray-700">SSC Percentile</label>
                            <input type="number" step="0.01" id="sscPercentile" name="sscPercentile" placeholder="Percentile" value={formData.educationalDetails.sscPercentile} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>

                        <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-4 border-b border-emerald-300 pb-1">HSC Details:</h3>
                        <div>
                            <label htmlFor="hscStream" className="block text-sm font-medium text-gray-700">HSC Stream</label>
                            <input type="text" id="hscStream" name="hscStream" placeholder="HSC Stream" value={formData.educationalDetails.hscStream} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscSchoolName" className="block text-sm font-medium text-gray-700">HSC School Name</label>
                            <input type="text" id="hscSchoolName" name="hscSchoolName" placeholder="HSC School Name" value={formData.educationalDetails.hscSchoolName} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscBoard" className="block text-sm font-medium text-gray-700">HSC Board</label>
                            <input type="text" id="hscBoard" name="hscBoard" placeholder="HSC Board" value={formData.educationalDetails.hscBoard} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscPassingYear" className="block text-sm font-medium text-gray-700">HSC Passing Year</label>
                            <input type="number" id="hscPassingYear" name="hscPassingYear" placeholder="YYYY" value={formData.educationalDetails.hscPassingYear} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscTotalPercentile" className="block text-sm font-medium text-gray-700">HSC Total Percentile</label>
                            <input type="number" step="0.01" id="hscTotalPercentile" name="hscTotalPercentile" placeholder="Total Percentile" value={formData.educationalDetails.hscTotalPercentile} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="hscSciencePercentile" className="block text-sm font-medium text-gray-700">HSC Science Percentile</label>
                            <input type="number" step="0.01" id="hscSciencePercentile" name="hscSciencePercentile" placeholder="Science Percentile" value={formData.educationalDetails.hscSciencePercentile} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>

                        <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-4 border-b border-emerald-300 pb-1">GUJCET Details:</h3>
                        <div>
                            <label htmlFor="gujcetRollNo" className="block text-sm font-medium text-gray-700">GUJCET Roll No</label>
                            <input type="text" id="gujcetRollNo" name="gujcetRollNo" placeholder="GUJCET Roll No" value={formData.educationalDetails.gujcetRollNo} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="gujcetPassingYear" className="block text-sm font-medium text-gray-700">GUJCET Passing Year</label>
                            <input type="number" id="gujcetPassingYear" name="gujcetPassingYear" placeholder="YYYY" value={formData.educationalDetails.gujcetPassingYear} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="gujcetMarks" className="block text-sm font-medium text-gray-700">GUJCET Marks</label>
                            <input type="number" step="0.01" id="gujcetMarks" name="gujcetMarks" placeholder="Marks" value={formData.educationalDetails.gujcetMarks} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label htmlFor="gujcetPercentile" className="block text-sm font-medium text-gray-700">GUJCET Percentile</label>
                            <input type="number" step="0.01" id="gujcetPercentile" name="gujcetPercentile" placeholder="Percentile" value={formData.educationalDetails.gujcetPercentile} onChange={(e) => handleTextChange(e, "educationalDetails")} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                    </div>
                </div>


                <div className="bg-orange-50 p-6 rounded-md border border-orange-200">
                    <h2 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-300 pb-2">Upload Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="candidatePhoto" className="block text-sm font-medium text-gray-700">Candidate Photo <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="candidatePhoto"
                                accept="image/*,application/pdf"
                                onChange={(e) => setCandidatePhoto(e.target.files[0])}
                                required
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="aadharCard" className="block text-sm font-medium text-gray-700">Aadhar Card <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="aadharCard"
                                accept="application/pdf,image/*"
                                onChange={(e) => setAadharCard(e.target.files[0])}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="sscMarksheet" className="block text-sm font-medium text-gray-700">SSC Marksheet <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="sscMarksheet"
                                accept="application/pdf,image/*"
                                onChange={(e) => setSSCMarksheet(e.target.files[0])}
                                required
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="hscMarksheet" className="block text-sm font-medium text-gray-700">HSC Marksheet <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="hscMarksheet"
                                accept="application/pdf,image/*"
                                onChange={(e) => setHSCMarksheet(e.target.files[0])}
                                required
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="gujcetMarksheet" className="block text-sm font-medium text-gray-700">GUJCET Marksheet <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="gujcetMarksheet"
                                accept="application/pdf,image/*"
                                onChange={(e) => setGUJCETMarksheet(e.target.files[0])}
                                required
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="leavingCertificate" className="block text-sm font-medium text-gray-700">Leaving Certificate</label>
                            <input
                                type="file"
                                id="leavingCertificate"
                                accept="application/pdf,image/*"
                                onChange={(e) => setLeavingCertificate(e.target.files[0])}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
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
                                        value={formData.branchPreferences[prefKey]}
                                        onChange={(e) => handleTextChange(e, "branchPreferences")}
                                        disabled={isDisabled}
                                        className={`mt-1 block w-full border ${isDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                            } border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                    >
                                        <option value="">Select Branch</option>
                                        {availableOptions.map((opt) => (
                                            <option key={opt} value={opt}>
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
                    Submit Application
                </button>
            </form>
        </div>
    );
}

export default ApplyFormPage;
