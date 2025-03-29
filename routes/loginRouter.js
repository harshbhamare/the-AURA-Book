const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

router.get("/login", function (req, res) {
    res.render("login");
});

router.post("/login-user", async function (req, res) {
    let { email, password } = req.body;

    if (!email || !password) {  
        return res.send("Please fill the complete registration form");
    }

    let existingUser = await userModel.findOne({ email });
    if (!existingUser) {
        return res.redirect("/register");
    }

    const match = await bcrypt.compare(password, existingUser.password);  
    if (!match) {
        return res.status(401).send("Invalid password");
    }

    const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET || "bhamare",
        { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true });  
    res.redirect("/user-dashboard");
});

module.exports = router;
