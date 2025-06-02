import { asyncHandler } from "../utils/asyncHandler.js";
import { SubmissionForm } from "../models/submissionForm.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DegreeForm } from "../models/degreeForm.model.js";

const addUploadPromise = async (req, fileField, documents, uploadPromises, isRequired = true) => {
    const userId = req.user._id;

    if (req.files[fileField] && req.files[fileField][0]) {
        const filePath = req.files[fileField][0].path;

        uploadPromises.push(
            uploadOnCloudinary(filePath, userId, fileField)
                .then(response => {
                    if (response && response.secure_url) {
                        documents[fileField] = response.secure_url;
                    } else {
                        throw new ApiError(400, `Upload to Cloudinary returned no secure_url for ${fileField}.`);
                    }
                })
                .catch(uploadError => {
                    console.error(`Error uploading ${fileField} for user ${userId}: ${uploadError.message}`);
                    if (isRequired) {
                        throw uploadError;
                    } else {
                        documents[fileField] = null;
                        return null;
                    }
                })
        );
    } else if (isRequired) {
        uploadPromises.push(Promise.reject(new ApiError(400, `Required document missing: ${fileField}.`)));
    }
};

const submitForm = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const degreeFormId = req.params.degreeFormId;
    if (!userId) {
        throw new ApiError(404, "User not found.");
    }

    const userForm = await SubmissionForm.findOne({ userId: userId, degreeFormId: degreeFormId });
    if (userForm) {
        throw new ApiError(400, "Form already submitted.");
    }

    const degreeForm = await DegreeForm.findById(degreeFormId);
    const jsonData = JSON.parse(req.body.jsonData);
    const { personalDetails, educationalDetails, branchPreferences } = jsonData;

    const documents = {};
    try {
        const uploadPromises = [];

        await addUploadPromise(req, "candidatePhoto", documents, uploadPromises);
        await addUploadPromise(req, "aadharCard", documents, uploadPromises);
        await addUploadPromise(req, "sscMarksheet", documents, uploadPromises);
        await addUploadPromise(req, "hscMarksheet", documents, uploadPromises);
        await addUploadPromise(req, "gujcetMarksheet", documents, uploadPromises);
        await addUploadPromise(req, "leavingCertificate", documents, uploadPromises, false);
        await Promise.all(uploadPromises);
    } catch (error) {
        throw new ApiError(400, error.message);
    }

    const submissionForm = new SubmissionForm({
        degreeFormId: degreeFormId,
        degreeFormTitle: degreeForm.title,
        degreeFormDescription: degreeForm.description ? degreeForm.description : "",
        userId: userId,
        personalDetails: personalDetails,
        educationalDetails: educationalDetails,
        documents: documents,
        branchPreferences: branchPreferences,
    })

    const createdSubmissionForm = await submissionForm.save();
    if (!createdSubmissionForm) {
        throw new ApiError(500, "Something went wrong while submitting the form")
    }
    return res.status(200).json(new ApiResponse(200, "Form submitted successfully", createdSubmissionForm));

});

const filledForms = asyncHandler(async (req, res) => {
    const forms = (await SubmissionForm.find({ userId: req.user._id }));
    // console.log(forms);
    return res.status(200).json(new ApiResponse(200, forms));
});

const getForm = asyncHandler(async (req, res) => {
    const form = await SubmissionForm.findById(req.params.submissionFormId);
    if (!form) {
        return res.status(404).json(new ApiError(404, "Form not found"));
    }
    if (req.user.role === "user" && req.user._id.toString() !== form.userId.toString()) {
        return res.status(403).json(new ApiError(403, "Unauthorized Access"));
    }
    console.log(form)
    return res.status(200).json(new ApiResponse(200, form));
});

const getAllDegreeForms = asyncHandler(async (req, res) => {
    const degreeForms = await DegreeForm.find();
    return res.status(200).json(new ApiResponse(200, degreeForms));
});

const getDegreeForm = asyncHandler(async (req, res) => {
    const degreeFormId = req.params.degreeFormId;
    const degreeForm = await DegreeForm.findById(degreeFormId);
    if (!degreeForm) {
        throw new ApiError(404, "Form not found")
    }

    return res.status(200).json(new ApiResponse(200, degreeForm, "Form fetched successfully"));
});

const updateDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const submissionFormId = req.params.submissionFormId;
    const submissionForm = await SubmissionForm.findById(submissionFormId);

    if (!submissionForm) {
        return res.status(404).json(new ApiError(404, "Form not found"));
    }
    if (submissionForm.userId.toString() !== userId.toString()) {
        return res.status(401).json(new ApiError(403, "Unauthorized Access"));
    }

    const { personalDetails, educationalDetails, branchPreferences } = req.body;

    submissionForm.personalDetails = personalDetails;
    submissionForm.educationalDetails = educationalDetails;
    submissionForm.branchPreferences = branchPreferences;
    submissionForm.submittedAt = new Date().toISOString();
    const updatedSubmissionForm = await submissionForm.save();
    return res.status(200).json(new ApiResponse(200, updatedSubmissionForm));
})

const updateDocuments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const submissionFormId = req.params.submissionFormId;
    const submissionForm = await SubmissionForm.findById(submissionFormId);

    if (!submissionForm) {
        return res.status(404).json(new ApiError(404, "Form not found"));
    }
    if (submissionForm.userId.toString() !== userId.toString()) {
        return res.status(403).json(new ApiError(403, "Unauthorized Access"));
    }

    const documents = {};
    try {
        const uploadPromises = [];

        await addUploadPromise(req, "candidatePhoto", documents, uploadPromises, false);
        await addUploadPromise(req, "aadharCard", documents, uploadPromises, false);
        await addUploadPromise(req, "sscMarksheet", documents, uploadPromises, false);
        await addUploadPromise(req, "hscMarksheet", documents, uploadPromises, false);
        await addUploadPromise(req, "gujcetMarksheet", documents, uploadPromises, false);
        await addUploadPromise(req, "leavingCertificate", documents, uploadPromises, false);
        await Promise.all(uploadPromises);
    } catch (error) {
        throw new ApiError(400, error.message);
    }
    submissionForm.documents = documents;
    submissionForm.submittedAt = new Date().toISOString();
    const updatedSubmissionForm = await submissionForm.save();
    return res.status(200).json(new ApiResponse(200, updatedSubmissionForm));
})

export { submitForm, getAllDegreeForms, filledForms, getForm, updateDetails, updateDocuments, getDegreeForm };