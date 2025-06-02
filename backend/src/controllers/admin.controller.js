import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DegreeForm } from "../models/degreeForm.model.js";
import { User } from "../models/user.model.js";
import { SubmissionForm } from "../models/submissionForm.model.js";
import { generateExcel } from "../utils/excelGenerator.js";
import { SUBMISSION_COLUMNS } from "../constants.js";

const istToUtc = (dateStr) => {
    const date = new Date(dateStr);
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() - IST_OFFSET);
}

const utcToIst = (utcDate) => {
    const date = new Date(utcDate);
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + IST_OFFSET);
    return istDate
}

const createDegreeForm = asyncHandler(async (req, res) => {
    const { title, description, activeFrom, lastDate } = req.body;

    if (!title || !activeFrom || !lastDate) {
        throw new ApiError(400, "Title, activeFrom and lastDate are required")
    }

    const activeFromUtc = istToUtc(activeFrom).toISOString();
    const lastDateUtc = istToUtc(lastDate).toISOString();

    const degreeForm = await DegreeForm.create({
        title: title,
        description: description ? description : "",
        createdBy: req.user._id,
        activeFrom: activeFromUtc,
        lastDate: lastDateUtc
    })

    if (!degreeForm) {
        throw new ApiError(500, "Failed to create degree form")
    }

    return res.status(201).json(new ApiResponse(201, degreeForm));
});

const updateDegreeForm = asyncHandler(async (req, res) => {
    const degreeFormId = req.params.degreeFormId;
    const degreeForm = await DegreeForm.findById(degreeFormId);
    if (!degreeForm) {
        throw new ApiError(404, "Degree form not found")
    }
    const { title, description, activeFrom, lastDate } = req.body;

    if (!title || !activeFrom || !lastDate) {
        throw new ApiError(400, "Title, activeFrom and lastDate are required")
    }

    const activeFromUtc = istToUtc(activeFrom);
    const lastDateUtc = istToUtc(lastDate);

    degreeForm.title = title;
    degreeForm.description = description ? description : "";
    degreeForm.activeFrom = activeFromUtc;
    degreeForm.lastDate = lastDateUtc;

    const updateDegreeForm = await degreeForm.save();
    return res.status(200).json(new ApiResponse(200, updateDegreeForm, "Degree form updated successfully"));
});

const grantAdminAccess = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    user.role = "admin";
    await user.save();
    const updatedUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiresAt");
    return res.status(201).json(new ApiResponse(201, updatedUser, "Admin access granted successfully"));
});

const getSubmissions = asyncHandler(async (req, res) => {
    const degreeFormId = req.params.degreeFormId
    const { branches, limit } = req.query


    if (!degreeFormId) {
        throw new ApiResponse(404, "Form Id required");
    }

    const findQuery = {
        degreeFormId: degreeFormId
    }

    try {
        const selectedBranches = branches ? branches.split(",") : [];

        if (selectedBranches) {
            findQuery.$or = [
                { "branchPreferences.pref1": { $in: selectedBranches } },
                { "branchPreferences.pref2": { $in: selectedBranches } },
                { "branchPreferences.pref3": { $in: selectedBranches } },
                { "branchPreferences.pref4": { $in: selectedBranches } },
                { "branchPreferences.pref5": { $in: selectedBranches } },
                { "branchPreferences.pref6": { $in: selectedBranches } },
                { "branchPreferences.pref7": { $in: selectedBranches } },
            ]
        }
        let submissions;
        if (limit) {
            const parsedLimit = parseInt(limit, 10);
            submissions = await SubmissionForm.find(findQuery)
                .sort({ "educationalDetails.gujcetPercentile": -1 })
                .limit(parsedLimit)
                .lean();
        }
        else {
            submissions = await SubmissionForm.find(findQuery)
                .sort({ "educationalDetails.gujcetPercentile": -1 })
                .lean();
        }

        const rankedSubmissions = submissions.map((submission, index) => ({
            ...submission,
            rank: index + 1,
            limit: limit ?? 0,
            branchPreferences: [
                submission.branchPreferences.pref1,
                submission.branchPreferences.pref2,
                submission.branchPreferences.pref3,
                submission.branchPreferences.pref4,
                submission.branchPreferences.pref5,
                submission.branchPreferences.pref6,
                submission.branchPreferences.pref7
            ].filter(Boolean)
        }))
        return res.status(200).json(new ApiResponse(200, rankedSubmissions, "List fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, error))
    }


})

const deleteDegreeForm = asyncHandler(async (req, res) => {
    const { degreeFormId } = req.params;
    const degreeFormToDelete = await DegreeForm.findById(degreeFormId);

    if (!degreeFormToDelete) {
        throw new ApiError(404, "Degree form not found.");
    }

    await SubmissionForm.deleteMany({ degreeFormId: degreeFormId });

    await degreeFormToDelete.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Form and associated submissions deleted successfully."));
})

const exportToXlsx = asyncHandler(async (req, res) => {
    const {data} = req.body
    try {
        const excelData = data.map((s) => {
            const p = s.personalDetails || {};
            const e = s.educationalDetails || {};
            const d = s.documents || {};
    
            return {
                rank: s.rank,
                fullName: p.fullName,
                dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '',
                gender: p.gender,
                email: p.email,
                mobileNo: p.mobileNo,
                guardianName: p.guardianName,
                guardianMobileNo: p.guardianMobileNo,
                guardianEmail: p.guardianEmail,
                address: p.address,
                city: p.city,
                state: p.state,
                pincode: p.pincode,
                sscSchoolName: e.sscSchoolName,
                sscBoard: e.sscBoard,
                sscPassingYear: e.sscPassingYear ? new Date(e.sscPassingYear).getFullYear() : '',
                sscPercentile: e.sscPercentile,
                hscStream: e.hscStream,
                hscSchoolName: e.hscSchoolName,
                hscBoard: e.hscBoard,
                hscPassingYear: e.hscPassingYear ? new Date(e.hscPassingYear).getFullYear() : '',
                hscTotalPercentile: e.hscTotalPercentile,
                hscSciencePercentile: e.hscSciencePercentile,
                gujcetRollNo: e.gujcetRollNo,
                gujcetPassingYear: e.gujcetPassingYear ? new Date(e.gujcetPassingYear).getFullYear() : '',
                gujcetMarks: e.gujcetMarks,
                gujcetPercentile: e.gujcetPercentile,
                branchPreferences: s.branchPreferences.join(', '),
                photo: d.candidatePhoto,
                aadharCard: d.aadharCard,
                sscMarksheet: d.sscMarksheet,
                hscMarksheet: d.hscMarksheet,
                gujcetMarksheet: d.gujcetMarksheet,
                leavingCertificate: d.leavingCertificate ?? "",
                submittedAt: s.submittedAt ? utcToIst(new Date(s.submittedAt).toUTCString()).toLocaleString() : ''
            };
        })
        const filename = `${data[0].degreeFormTitle}_${data[0].limit}`;
        const workbook = await generateExcel(SUBMISSION_COLUMNS, excelData, filename, req.user.name)
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename.replace(/\s/g, '_')}.xlsx`
        );
    
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, error))
    }
})

export { createDegreeForm, updateDegreeForm, grantAdminAccess, getSubmissions, deleteDegreeForm, exportToXlsx };