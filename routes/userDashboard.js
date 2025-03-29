const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const { sendOTP } = require("../services/mailService");
const userModel = require("../models/user");

router.get("/user-dashboard", async function (req, res) {
    try {
        const token = req.cookies.token; 
        if (!token) {
            return res.redirect("/register");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, "bhamare");
        } catch (err) {
            console.error("Invalid Token:", err);
            return res.redirect("/register");
        }

        const userId = decoded.userId;

        const user = await userModel.findById(userId)
            .populate("mySpaces")
            .populate("joinedSpaces");

        if (!user) {
            return res.redirect("/register");
        }

        res.render("userDashboard", { 
            mySpaces: user.mySpaces, 
            joinedSpaces: user.joinedSpaces,
            user
        });

    } catch (error) {
        console.error("Error fetching dashboard:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;






module.exports = router;