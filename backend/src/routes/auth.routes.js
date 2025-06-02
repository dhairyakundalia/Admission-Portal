import {Router} from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, verifyUser, getCurrentUser, clearCookies } from "../controllers/auth.controller.js";
import { authorizeRole, verifyAccessToken, verifyOtpToken } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { ApiError } from "../utils/ApiError.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/verify-otp").post(verifyOtpToken, verifyUser)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyAccessToken, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyAccessToken, getCurrentUser)
router.route("/dashboard/user-data").get(verifyAccessToken, authorizeRole("user"), (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user))
})
router.route("/dashboard/admin-data").get(verifyAccessToken, authorizeRole("admin"), (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user))
})
router.route("/clear-cookies").post(clearCookies)
export default router;