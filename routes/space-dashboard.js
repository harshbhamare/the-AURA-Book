const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const router = express.Router();
const spaceModel = require("../models/space");

const Space = require("../models/space");
const User = require("../models/user");

router.get("/spaces/:id/space-dashboard", async function (req, res) {
    try {
        const space = await spaceModel.findById(req.params.id)
            .populate("pendingRequests", "username email");

        if (!space) return res.status(404).json({ error: "Space not found" });

        res.render("space-dashboard", { space, pendingRequests: space.pendingRequests });
    } catch (error) {
        res.status(500).json({ error: "Error fetching pending requests" });
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
