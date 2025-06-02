import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendOtpEmail } from "../utils/nodemailer.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// import { use } from "react";

const accessTokenOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 60 * 1000
}
const refreshTokenOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const generateOtp = (length = 6) => {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        otp += digits[randomIndex];
    }

    return otp;
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, mobile_no, password } = req.body
    // console.log(req.body)

    if (
        [name, email, mobile_no, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.isVerified) {
        throw new ApiError(409, "User with this email already exists")
    }
    else if (existingUser && !existingUser.isVerified) {
        await User.findByIdAndDelete(existingUser._id)
    }

    const user = await User.create({
        name,
        email,
        mobile_no,
        password,
        role: "user"
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -otp -otpExpiresAt"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    const otp = generateOtp();
    createdUser.otp = otp;
    createdUser.otpExpiresAt = Date.now() + 300000; // 5 minutes
    await createdUser.save({ validateBeforeSave: false })

    await sendOtpEmail(email, otp)

    const otpToken = createdUser.generateOtpToken()
    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 5*60*1000
    }

    return res
        .status(201)
        .cookie("otpToken", otpToken, options)
        .json(new ApiResponse(200, createdUser, "OTP sent for verification"));
})

const verifyUser = asyncHandler(async (req, res) => {
    // const user = await User.findById(req.user._id)
    const { otp } = req.body
    if (!otp) {
        throw new ApiError(400, "OTP is required")
    }

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.otp !== otp) {
        throw new ApiError(400, "Invalid OTP")
    }

    if (user.otpExpiresAt < Date.now()) {
        throw new ApiError(400, "OTP has expired")
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save({ validateBeforeSave: false })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -otp -otpExpiresAt"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("otpToken", options)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(200,
                loggedInUser,
                "User verified and logged in successfully"
            )
        )
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens", error)
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const passwordCorrect = await user.isPasswordCorrect(password)
    if (!passwordCorrect) {
        throw new ApiError(401, "Incorrect email or password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -otp -otpExpiresAt"
    )

    const accessTokenOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000
    }
    const refreshTokenOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }

    return res.status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken

                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return res.status(401).json(new ApiError(401, "Refresh Token not found."))
    }

    try {
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "User associated with refresh token not found")
        }
        if (refreshToken !== user?.refreshToken) {
            user.refreshToken = null
            await user.save({ validateBeforeSave: false })
            throw new ApiError(401, "Invalid refresh token. Please login again.")
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        
        return res.status(200)
            .cookie("accessToken", newAccessToken, accessTokenOptions)
            .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken: newAccessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        return res.status(401).json(new ApiError(401, error?.message || "Invalid refresh token"))
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // req.user is populated by verifyAccessToken middleware
    // We already have the user object from the database lookup in the middleware
    return res.status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully."));
});

const clearCookies = asyncHandler(async (req, res) => {
    try {
        const options = {
            httpOnly: true,
            secure: true,
        }
        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, null, "Cookies cleared successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, error))
    }
})
export { registerUser, loginUser, logoutUser, refreshAccessToken, verifyUser, getCurrentUser, clearCookies }