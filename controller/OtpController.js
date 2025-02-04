const twilio = require("twilio");
const otpGenerator = require("otp-generator");
const Otp = require("../Model/OtpSchema.js");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Twilio Client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP Controller
const otpgenController = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required!" });
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      // body: "i know you and isha are together",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    // Store OTP in MongoDB with a timestamp
    await Otp.create({ phone, otp, createdAt: new Date() });

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("OTP sending error:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP Controller
const verifyOtpController = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone number and OTP are required!" });
  }

  try {
    const otpRecord = await Otp.findOne({ phone }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired!" });
    }

    // Check if OTP is expired (5 min expiration)
    const timeDiff = (new Date() - otpRecord.createdAt) / 1000; // Time in seconds
    if (timeDiff > 300) {
      await Otp.deleteOne({ phone });
      return res.status(400).json({ message: "OTP expired! Please request a new one." });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP! Please try again." });
    }

    // OTP is valid, delete it
    await Otp.deleteOne({ phone });

    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Failed to verify OTP", error: error.message });
  }
};

module.exports = { otpgenController, verifyOtpController };
