import { DegreeForm } from "../models/degreeForm.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { SubmissionForm } from "../models/submissionForm.model.js"
// import {User} from "../models/user.model.js"

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json(new ApiError(401, "Access token not found. Please login."))
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -otp -otpExpiresAt"
        )

        if (!user) {
            return res.status(401).json(new ApiError(401, "Invalid Access Token"))
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json(new ApiError(401, error?.message || "Invalid or expired Access Token"))
    }
})

const verifyOtpToken = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.otpToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "OTP verification token not found. Pleasr register again.")
        }

        const decodedToken = jwt.verify(token, process.env.OTP_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -otp -otpExpiresAt"
        )

        if (!user) {
            throw new ApiError(401, "Invalid OTP Token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid or expired OTP Token")
    }
})

const authorizeRole = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json(new ApiError(403, "User not logged in."));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(new ApiError(403, "Unauthorized access."));
        }

        next();
    })
}

const isFormActive = asyncHandler(async (req, res, next) => {  
    // const degreeFormId = req.params.degreeFormId;
    // console.log(degreeFormId);
    let degreeFormId;
    if(req.params.submissionFormId){
        const submissionFormId = req.params.submissionFormId;
        const submissionForm = await SubmissionForm.findById(submissionFormId);
        if (!submissionForm) {
            return res.status(404).json(new ApiError(404, "Submission Form not found"))
        }

        if(submissionForm.userId.toString() !== req.user._id.toString()){
            return res.status(403).json(new ApiError(403, "Unauthorized access."));
        }
        degreeFormId = submissionForm.degreeFormId;
    }
    else{
        degreeFormId = req.params.degreeFormId;
    }
    
    const degreeForm = await DegreeForm.findById(degreeFormId);
    if (!degreeForm) {
        return res.status(404).json(new ApiError(404, "Form not found"))
    }

    const now = new Date();

    if (now < degreeForm.activeFrom) {
        return res.status(400).json(new ApiError(400, "Form is not active"))
    }
    else if (now > degreeForm.lastDate) {
        return res.status(400).json(new ApiError(400, "Form submission is closed"))
    }
    req.degreeFormId = degreeFormId
    next();
})

const isSubmitted = (isNeeded) => {
    return asyncHandler(async (req, res, next) => {
        const degreeFormId = req.degreeFormId; // Get formId from params or body
        const userId = req.user._id; // Assuming req.user is populated by verifyAccessToken

        if (!degreeFormId || !userId) {
            return res.status(400).json(new ApiError(400, "Form ID or User ID is missing for submission check."));
        }

        const existingSubmission = await SubmissionForm.findOne({
            degreeFormId: degreeFormId,
            userId: userId
        });

        if (existingSubmission && !isNeeded) {
            // If a submission exists, prevent further processing
            return res.status(409).json(new ApiError(409, "You have already submitted this form.")); // 409 Conflict is appropriate
        }
        else if (!existingSubmission && isNeeded) {
            // If no submission exists, prevent further processing
            return res.status(409).json(new ApiError(409, "You have not submitted this form.")); // 409 Conflict is appropriate
        }
        else {
            next();
        }

        // If no submission exists, proceed to the next middleware/controller
    })
}

export { verifyAccessToken, verifyOtpToken, authorizeRole, isFormActive, isSubmitted };