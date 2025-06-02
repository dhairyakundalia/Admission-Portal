import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
// import { ApiResponse } from "./ApiResponse";
import { otpTemplate } from "./emailTemplates.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const verifySMTPConnection = async () => {
    try {
        const info = await transporter.verify();
        console.log("SMTP connection verified", info);
    } catch (error) {
        throw new ApiError(500, "SMTP connection failed: " + error.message);
    }
};

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: {
        name: 'Admission Portal',
        address: process.env.EMAIL_USERNAME
      },
      to: to,
      subject: subject,
      text: text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    throw new ApiError(500, "Failed to send email: " + error.message);
  }
};

const sendOtpEmail = async (email, otp) => {
  const subject = 'Your OTP for Verification';
  const text = `Your OTP is: ${otp}. It will expire in 5 minutes.`;
  const html = otpTemplate(otp);
  
  return await sendEmail(email, subject, text, html);
};

export { transporter, verifySMTPConnection, sendEmail, sendOtpEmail };