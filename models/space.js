const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema({
    spaceName: { type: String, required: true },
    spaceCode: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],  
});

module.exports = mongoose.model("space", spaceSchema);