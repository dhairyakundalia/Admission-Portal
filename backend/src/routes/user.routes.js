import { Router } from "express";
import { verifyAccessToken, authorizeRole, isFormActive, isSubmitted } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { filledForms, getDegreeForm, getForm, submitForm, updateDetails, updateDocuments } from "../controllers/user.controller.js";

const router = Router()

router.route("/submit-form/:degreeFormId").post(verifyAccessToken, authorizeRole("user"), isFormActive, isSubmitted(false),
    upload.fields([
        { name: "candidatePhoto", maxCount: 1, },
        { name: "aadharCard", maxCount: 1 },
        { name: "sscMarksheet", maxCount: 1 },
        { name: "hscMarksheet", maxCount: 1 },
        { name: "gujcetMarksheet", maxCount: 1 },
        { name: "leavingCertificate", maxCount: 1 }
    ]), submitForm);
router.route("/filled-forms").get(verifyAccessToken, filledForms);
router.route("/filled-form/:submissionFormId").get(verifyAccessToken, authorizeRole("user", "admin"), getForm);
router.route("/degree-form/:degreeFormId").get(verifyAccessToken, isFormActive, isSubmitted(false), getDegreeForm);
router.route("/update-details/:submissionFormId").put(verifyAccessToken, authorizeRole("user"), isFormActive, isSubmitted(true), updateDetails);
router.route("/update-documents/:submissionFormId").patch(verifyAccessToken, authorizeRole("user"), isFormActive, isSubmitted(true),
    upload.fields([
        { name: "candidatePhoto", maxCount: 1, },
        { name: "aadharCard", maxCount: 1 },
        { name: "sscMarksheet", maxCount: 1 },
        { name: "hscMarksheet", maxCount: 1 },
        { name: "gujcetMarksheet", maxCount: 1 },
        { name: "leavingCertificate", maxCount: 1 }
    ]), updateDocuments);


export default router;