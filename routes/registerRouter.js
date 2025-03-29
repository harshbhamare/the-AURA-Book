const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userModel = require("../models/user");
const { sendOTP } = require("../services/mailService");
require("dotenv").config();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/user", async (req, res) => {
    try {
        let { username, nickname, email, contactNumber } = req.body;

        if (!username || !nickname || !email || !contactNumber) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        let existingUser = await userModel.findOne({ email }).lean();
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User already exists!" });
        }

        let otp = generateOTP();
        let otpExpires = new Date(Date.now() + 5 * 60000); 

        await userModel.create({
            username,
            nickname,
            email,
            contactNumber,
            otp,
            otpExpires,
            verified: false
        });

        await sendOTP(email, otp.toString());

        return res.status(200).json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.post("/verify-otp", async (req, res) => {
    try {
        let { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        if (user.otpExpires && user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, error: "OTP has expired. Please request a new one." });
        }

        if (user.otp !== Number(otp)) {
            return res.status(400).json({ success: false, error: "Invalid OTP!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.verified = true;
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "bhamare", { expiresIn: "7d" });
        res.cookie("token", token);

        return res.status(200).json({ success: true, message: "OTP verified successfully!", token });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
