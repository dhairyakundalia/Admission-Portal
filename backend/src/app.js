import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit: "16kb", extended: true}))
app.use(express.static("public"));
app.use(cookieParser());

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import { verifyAccessToken } from "./middlewares/auth.middleware.js";
import { getAllDegreeForms, getDegreeForm } from "./controllers/user.controller.js";

app.use("/api/authentication", authRouter)
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.get("/api/degree-forms",verifyAccessToken, getAllDegreeForms)
app.get("/api/degree-form/:degreeFormId",verifyAccessToken, getDegreeForm)

export {app};