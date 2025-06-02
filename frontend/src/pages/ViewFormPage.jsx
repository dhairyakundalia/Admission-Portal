import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function ViewFormPage() {
  const { submissionId } = useParams();
  const { axios: authAxios } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await authAxios.get(`/user/filled-form/${submissionId}`);
        setSubmission(res.data.data);
      } catch (err) {
        console.error('Failed to fetch submission:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId, authAxios]);

  if (loading) return <p className="text-center mt-8 text-gray-600">Loading submission...</p>;
  if (!submission) return <p className="text-center mt-8 text-red-600">Submission not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-3xl font-extrabold mb-3 text-gray-900 border-b-2 border-indigo-200 pb-2">
        {submission.degreeFormTitle || 'Untitled Form Submission'}
      </h1>
      {submission.degreeFormDescription && (
        <p className="text-gray-600 text-lg mb-6">{submission.degreeFormDescription}</p>
      )}

      <div className="mb-6 bg-gray-50 p-3 rounded-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Submission Details</h2>
        <p className="text-gray-700">Submitted On: {new Date(submission.submittedAt).toLocaleString()}</p>
      </div>

      {submission.personalDetails && (
        <div className="mb-6 bg-indigo-50 p-4 rounded-md border border-indigo-200">
          <h2 className="text-xl font-semibold text-indigo-800 mb-3">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-gray-700">
            <p><strong>Full Name:</strong> {submission.personalDetails.fullName}</p>
            <p><strong>Date of Birth:</strong> {new Date(submission.personalDetails.dob).toDateString()}</p>
            <p><strong>Gender:</strong> {submission.personalDetails.gender}</p>
            <p><strong>Email:</strong> {submission.personalDetails.email}</p>
            <p><strong>Mobile No:</strong> {submission.personalDetails.mobileNo}</p>
            <p><strong>Guardian Name:</strong> {submission.personalDetails.guardianName}</p>
            <p><strong>Guardian Mobile No:</strong> {submission.personalDetails.guardianMobileNo}</p>
            <p><strong>Guardian Email:</strong> {submission.personalDetails.guardianEmail}</p>
            <p className="md:col-span-2"><strong>Address:</strong> {submission.personalDetails.address}, {submission.personalDetails.city}, {submission.personalDetails.state} - {submission.personalDetails.pincode}</p>
          </div>
        </div>
      )}

      {submission.educationalDetails && (
        <div className="mb-6 bg-emerald-50 p-4 rounded-md border border-emerald-200">
          <h2 className="text-xl font-semibold text-emerald-800 mb-3">Educational Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-gray-700">
            <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-2 border-b border-emerald-300 pb-1">SSC Details:</h3>
            <p><strong>School Name:</strong> {submission.educationalDetails.sscSchoolName}</p>
            <p><strong>Board:</strong> {submission.educationalDetails.sscBoard}</p>
            <p><strong>Passing Year:</strong>{new Date(submission.educationalDetails.sscPassingYear).getFullYear()}</p>
            <p><strong>Percentile:</strong> {submission.educationalDetails.sscPercentile}%</p>

            <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-4 border-b border-emerald-300 pb-1">HSC Details:</h3>
            <p><strong>Stream:</strong> {submission.educationalDetails.hscStream}</p>
            <p><strong>School Name:</strong> {submission.educationalDetails.hscSchoolName}</p>
            <p><strong>Board:</strong> {submission.educationalDetails.hscBoard}</p>
            <p><strong>Passing Year:</strong> {new Date(submission.educationalDetails.hscPassingYear).getFullYear()}</p>
            <p><strong>Total Percentile:</strong> {submission.educationalDetails.hscTotalPercentile}%</p>
            <p><strong>Science Percentile:</strong> {submission.educationalDetails.hscSciencePercentile}%</p>

            <h3 className="col-span-full text-lg font-medium text-emerald-700 mt-4 border-b border-emerald-300 pb-1">GUJCET Details:</h3>
            <p><strong>Roll No:</strong> {submission.educationalDetails.gujcetRollNo}</p>
            <p><strong>Passing Year:</strong> {new Date(submission.educationalDetails.gujcetPassingYear).getFullYear()}</p>
            <p><strong>Marks:</strong> {submission.educationalDetails.gujcetMarks}</p>
            <p><strong>Percentile:</strong> {submission.educationalDetails.gujcetPercentile}%</p>
          </div>
        </div>
      )}

      {submission.documents && (
        <div className="mb-6 bg-orange-50 p-4 rounded-md border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-800 mb-3">Uploaded Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-gray-700">
            {submission.documents.candidatePhoto && <p><a href={submission.documents.candidatePhoto} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Candidate Photo</a></p>}
            {submission.documents.aadharCard && <p><a href={submission.documents.aadharCard} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Aadhar Card</a></p>}
            {submission.documents.sscMarksheet && <p><a href={submission.documents.sscMarksheet} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">SSC Marksheet</a></p>}
            {submission.documents.hscMarksheet && <p><a href={submission.documents.hscMarksheet} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">HSC Marksheet</a></p>}
            {submission.documents.gujcetMarksheet && <p><a href={submission.documents.gujcetMarksheet} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">GUJCET Marksheet</a></p>}
            {submission.documents.leavingCertificate && <p><a href={submission.documents.leavingCertificate} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Leaving Certificate</a></p>}
          </div>
          <p className="text-sm text-gray-500 mt-2">Click on links to view documents.</p>
        </div>
      )}

      {submission.branchPreferences && (
        <div className="mb-6 bg-indigo-50 p-4 rounded-md border border-indigo-200">
          <h2 className="text-xl font-semibold text-indigo-800 mb-3">Branch Preferences</h2>
          <ol className="list-decimal list-inside text-gray-700">
            {submission.branchPreferences.pref1 && <li>{submission.branchPreferences.pref1}</li>}
            {submission.branchPreferences.pref2 && <li>{submission.branchPreferences.pref2}</li>}
            {submission.branchPreferences.pref3 && <li>{submission.branchPreferences.pref3}</li>}
            {submission.branchPreferences.pref4 && <li>{submission.branchPreferences.pref4}</li>}
            {submission.branchPreferences.pref5 && <li>{submission.branchPreferences.pref5}</li>}
            {submission.branchPreferences.pref6 && <li>{submission.branchPreferences.pref6}</li>}
            {submission.branchPreferences.pref7 && <li>{submission.branchPreferences.pref7}</li>}
          </ol>
        </div>
      )}
    </div>
  );
}

export default ViewFormPage;
