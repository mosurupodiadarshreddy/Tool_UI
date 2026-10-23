const sendMail = require("../utils/sendMail");
const redisClient = require("../config/redisClient");

// Generates OTP, stores it in Redis, and sends it via email
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    await redisClient.set(email, otp, {
      EX: 300,
    });

    await sendMail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// Verifies the OTP entered by the user
const verifyOtp = async (req, res) => {
  try {
    // Extract email and OTP from request body
    const { email, otp } = req.body;

    // Get stored OTP from Redis
    const storedOtp = await redisClient.get(email);

    // Check if OTP exists
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    // Compare entered OTP with stored OTP
    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Remove OTP after successful verification
    await redisClient.del(email);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};