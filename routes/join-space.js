const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const router = express.Router();
const spaceModel = require("../models/space");

router.post("/join-space", async function (req, res) {
    try {
        const token = req.cookies.token; // Get token from cookies

        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, "bhamare"); // Verify JWT token
        } catch (error) {
            return res.status(403).json({ error: "Invalid Token" });
        }

        const { spaceCode } = req.body;

        if (!spaceCode) {
            return res.status(400).json({ error: "Space code is required" });
        }

        const space = await spaceModel.findOne({ spaceCode });

        if (!space) {
            return res.status(404).json({ error: "Space not found" });
        }

        // Check if user is already a member
        if (space.members.includes(decoded.userId)) {
            return res.status(400).json({ error: "You are already a member of this space" });
        }

        // Check if user has already requested to join
        if (space.joinRequests.includes(decoded.userId)) {
            return res.status(400).json({ error: "Join request already sent" });
        }

        // Add user's ID to joinRequests array
        space.joinRequests.push(decoded.userId);
        await space.save();

        res.status(201).json({
            message: "Join request sent to admin successfully",
        });

    } catch (error) {
        console.error("Error joining space:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
