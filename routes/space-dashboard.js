const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const router = express.Router();
const spaceModel = require("../models/space");
const User = require("../models/user");  // ✅ Fixed duplicate import
const Space = require("../models/space")

router.get("/spaces/:id/space-dashboard", async function (req, res) {
    try {
        const token = req.cookies.token;
        if (!token) return res.redirect("/register");

        let decoded;
        try {
            decoded = jwt.verify(token, "bhamare");
        } catch (err) {
            return res.redirect("/register");
        }

        const currentUser = await User.findById(decoded.userId).populate("mySpaces");
        if (!currentUser) return res.redirect("/register");

        req.user = currentUser;

        const space = await spaceModel.findById(req.params.id)
            .populate("members", "username nickname auraPoints")
            .populate("pendingRequests", "username email")
            .populate("admin", "_id");

        if (!space) return res.status(404).json({ error: "Space not found" });

        // Check if user is an admin of this space
        const isAdminn = currentUser.mySpaces.some(space => space._id.toString() === req.params.id);

        space.pendingRequests = space.pendingRequests || [];
        // space.members.sort((a, b) => (b.auraPoints || 0) - (a.auraPoints || 0));
        const topPerformers = space.members
            .sort((a, b) => (b.auraPoints || 0) - (a.auraPoints || 0))
            .slice(0, 3);

        res.render("space-dashboard", { 
            space, 
            pendingRequests: space.pendingRequests, 
            user: currentUser,
            isAdminn,
            topPerformers
        });

    } catch (error) {
        res.status(500).json({ error: "Error fetching dashboard data" });
    }
});


router.post("/accept-request/:userId/:spaceId", async (req, res) => {
    try {
        const { userId, spaceId } = req.params;

        const space = await Space.findById(spaceId);
        const user = await User.findById(userId);

        if (!space || !user) {
            return res.status(404).json({ error: "Space or User not found" });
        }

        if (!space.pendingRequests.includes(userId)) {
            return res.status(400).json({ error: "User is not in pending requests" });
        }

        space.pendingRequests = space.pendingRequests.filter(id => id.toString() !== userId);

        space.members.push(userId);

        user.joinedSpaces.push(spaceId);

        await space.save();
        await user.save();

        res.redirect(`/spaces/${spaceId}/space-dashboard`);
    } catch (error) {
        res.status(500).json({ error: "Error approving request", details: error.message });
    }
});

router.post("/deny-request/:userId/:spaceId", async (req, res) => {
    try {
        const { userId, spaceId } = req.params;

        await spaceModel.findByIdAndUpdate(spaceId, {
            $pull: { pendingRequests: userId }
        });

        res.redirect(`/spaces/${spaceId}/space-dashboard`); 
    } catch (error) {
        res.status(500).json({ error: "Error denying request" });
    }
});


module.exports = router;
