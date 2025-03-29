const nodemailer = require("nodemailer");
require("dotenv").config(); 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Function to send OTP
const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP" };
  }
};

module.exports = { sendOTP };
