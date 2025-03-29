const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/aura", {
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    nickname: { type: String, required: true },
    contactNumber: { type: String, required: true }, 
    email: { type: String, unique: true, required: true },
    otp: { type: Number },
    otpExpires: { type: Date },  
    password: { type : String },
    verified: { type: Boolean, default: false },
    mySpaces: [{ type: mongoose.Schema.Types.ObjectId, ref: "space" }],  
    joinedSpaces: [{ type: mongoose.Schema.Types.ObjectId, ref: "space" }],  
    auraPoints : { type : Number, default: 0}
});

module.exports = mongoose.model("user", userSchema);
