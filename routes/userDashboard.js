const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const { sendOTP } = require("../services/mailService");

const userModel = require("../models/user");

router.get("/user-dashboard", function(req, res){
    const token = req.cookies.token; // Get token from cookies

        if (!token) {
            // return res.status(401).json({ error: "Unauthorized: No token provided" });
            return res.redirect("/register")
        }
    res.render("userDashboard")
})





module.exports = router;