const express = require("express");
const router = express.Router();
const spaceModel = require("../models/space");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/create-space", async function (req, res) {
    try {
        const token = req.cookies.token;  // Get token from cookies
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "bhamare");  // Verify JWT token
        } catch (error) {
            return res.status(403).json({ error: "Invalid Token" });
        }

        const { spaceName } = req.body;
        if (!spaceName) {
            return res.status(400).json({ error: "Space name is required" });
        }

        const existingSpace = await spaceModel.findOne({ spaceName });
        if (existingSpace) {
            return res.status(400).json({ error: "Space name already exists" });
        }

        // Generate spaceCode separately
        const spaceCode = Math.random().toString(36).substr(2, 8);

        // Create new space
        const newSpace = new spaceModel({
            spaceName,
            spaceCode,
            admin: decoded.userId,  // Assign logged-in user as admin
            members: [decoded.userId],  // Add creator as first member
        });

        await newSpace.save();

        // Update user's `mySpaces` field
        await userModel.findByIdAndUpdate(
            decoded.userId,
            { $push: { mySpaces: newSpace._id } },  // Push the space ID into user's `mySpaces`
            { new: true }
        );

        res.status(201).json({
            message: "Space created successfully",
            space: newSpace,
        });

    } catch (error) {
        console.error("Error creating space:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
