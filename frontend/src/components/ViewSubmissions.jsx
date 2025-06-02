import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"

function ViewSubmissions({ activeTab, setActiveTab, viewingFormId, setViewingFormId }) {
    const { axios: authAxios } = useAuth();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [branchesSelected, setBranchesSelected] = useState([
        "CS", "IT", "EC", "CH", "MH", "IC", "CL"
    ]);
    const [limit, setLimit] = useState(0)

    const fetchSubmissions = async () => {
        if (!viewingFormId || activeTab !== 'viewSubmissions') return;

        try {
            const branchQuery = branchesSelected.join(',');
            let queryUrl = `/admin/view-submissions/${viewingFormId}?branches=${branchQuery}`
            if (limit)
                queryUrl += `&limit=${limit}`
            const res = await authAxios.get(queryUrl);
            setSubmissions(res.data.data || []);
        } catch (err) {
            console.error('Failed to load submissions:', err);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [viewingFormId, activeTab]);

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
    };

    const handleExportToExcel = async () => {
        if(submissions.length === 0){
            alert("No data")
            return;
        }
        try {
            const response = await authAxios.post(
                `/admin/export-to-xlsx`,
                {
                    data:submissions
                },
                {
                    responseType: 'blob',
                }
            );

            if (response.data && response.data.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const errorJson = JSON.parse(reader.result);
                        alert(errorJson.message || 'An unexpected error occurred during export.');
                    } catch (e) {
                        alert('Received non-Excel response from server.');
                    }
                };
                reader.readAsText(response.data);
                return;
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `submissions_export.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error during Excel export:', err);
            if (err.response && err.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const errorJson = JSON.parse(reader.result);
                        alert(errorJson.message || 'Failed to export data to Excel.');
                    } catch (e) {
                        alert('Failed to export data to Excel (unknown error format).');
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                alert('Failed to export data to Excel.');
            }
        }
    };


    return (
        <>
            <h2 className="text-xl font-bold mb-4">Submissions</h2>
            <div className="bg-white p-4 border rounded mb-4 flex flex-wrap items-center gap-4">
                {["CS", "IT", "EC", "CH", "MH", "IC", "CL"].map((branch) => (
                    <label key={branch} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={branchesSelected.includes(branch)}
                            onChange={() => {
                                setBranchesSelected((prev) => prev.includes(branch)
                                    ? prev.filter((b) => b !== branch) : [...prev, branch]
                                );
                            }}
                        />
                        {branch}
                    </label>
                ))}

                <div className="ml-auto flex items-center gap-2"> {/* Use ml-auto to push to right */}
                    <label htmlFor="limitInput" className="text-sm font-medium text-gray-700">Limit:</label>
                    <input
                        type="number"
                        id="limitInput"
                        value={limit}
                        onChange={handleLimitChange}
                        min="0"
                        className="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 text-center"
                    />
                </div>

                <button
                    className="ml-auto bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    onClick={() => fetchSubmissions()}
                >
                    Filter
                </button>
            </div>

            {submissions.length === 0 ? (
                <p className="text-gray-600">No submissions found.</p>
            ) : (
                <ul className="space-y-2">
                    {submissions.map((submission) => (
                        <li
                            key={submission._id}
                            className="bg-white p-4 shadow-sm rounded flex justify-between items-center"
                        >
                            <span>{submission.rank}</span>
                            <span className="font-semibold">{submission.personalDetails.fullName}</span>
                            <span>{submission.educationalDetails.gujcetPercentile}</span>
                            <span>{submission.branchPreferences.join(', ')}</span>
                            <button className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-400"
                                onClick={() => { navigate(`/admin-dashboard/view-submission/${submission._id}`) }}
                            >
                                View
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-6">
                <button
                    onClick={() => {
                        setSubmissions([]);
                        setViewingFormId(null);
                        setActiveTab('manageForms');
                    }}
                    className="bg-red-500 text-white px-4 py-2 mr-2 rounded hover:bg-red-600 "
                >
                    Cancel
                </button>
                <button className="bg-blue-500 rounded text-white px-4 py-2 hover:bg-blue-600"
                    onClick={handleExportToExcel}
                >
                    Download excel file
                </button>
            </div>
        </>
    )
}

export default ViewSubmissions