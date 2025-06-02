import { Router } from "express";
import { createDegreeForm, grantAdminAccess, updateDegreeForm, getSubmissions, deleteDegreeForm, exportToXlsx } from "../controllers/admin.controller.js";
import { verifyAccessToken, authorizeRole } from "../middlewares/auth.middleware.js";
import { getDegreeForm } from "../controllers/user.controller.js";

const router = Router();

// router.route("/").get(verifyAccessToken, authorizeRole("admin"), getAdminDashboard);
router.route("/grant-admin-access").patch(verifyAccessToken, authorizeRole("admin"), grantAdminAccess);
router.route("/degree-form").post(verifyAccessToken, authorizeRole("admin"), createDegreeForm);
router.route("/degree-form/:degreeFormId").get(verifyAccessToken, authorizeRole("admin"), getDegreeForm);
router.route("/degree-form/:degreeFormId").put(verifyAccessToken, authorizeRole("admin"), updateDegreeForm);
router.route("/view-submissions/:degreeFormId").get(verifyAccessToken, authorizeRole("admin"), getSubmissions);
router.route("/degree-form/:degreeFormId").delete(verifyAccessToken, authorizeRole("admin"), deleteDegreeForm);
router.route("/export-to-xlsx").post(verifyAccessToken, authorizeRole("admin"), exportToXlsx);

export default router;