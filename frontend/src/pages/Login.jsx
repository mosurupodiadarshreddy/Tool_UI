import { useState } from "react";
import "../styles/Login.css";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { AUTH_API } from "../constants/apiConstants";

function Login() {
  // Stores the email entered by the user
  const [email, setEmail] = useState("");

  // Stores the OTP entered by the user
  const [otp, setOtp] = useState("");

  // Tracks whether the OTP has been sent successfully
  const [otpSent, setOtpSent] = useState(false);

  // Tracks whether an API request is in progress
  const [loading, setLoading] = useState(false);

  // Stores success and error messages
  const [message, setMessage] = useState("");

  // React Router navigation hook
  const navigate = useNavigate();

  // Sends OTP to the entered email address
  const handleSendOtp = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setMessage("Please enter a valid email address");
      return;
    }

    try {
      // Start loading and clear the previous message
      setLoading(true);
      setMessage("");

      // Call the send OTP API
      const response = await fetch(AUTH_API.SEND_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      // Read the backend response
      const data = await response.json();

      // Display the error if the API request fails
      if (!response.ok) {
        setMessage(data.message || "Failed to send OTP");
        return;
      }

      // Show the OTP input after successful delivery request
      setOtpSent(true);
      setMessage("OTP sent successfully! Please check your email.");
    } catch (error) {
      // Handle network errors
      console.error("Send OTP error:", error);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      // Stop loading
      setLoading(false);
    }
  };

  // Verifies the OTP entered by the user
  const handleVerifyOtp = async () => {
    // Validate that the OTP contains six digits
    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      // Start loading and clear the previous message
      setLoading(true);
      setMessage("");

      // Call the verify OTP API with email and OTP
      const response = await fetch(AUTH_API.VERIFY_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp,
        }),
      });

      // Read the backend response
      const data = await response.json();

      // Display the error if verification fails
      if (!response.ok) {
        setMessage(data.message || "OTP verification failed");
        return;
      }

      // Navigate to the panel after successful verification
      navigate("/panel");
    } catch (error) {
      // Handle network errors
      console.error("Verify OTP error:", error);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      // Stop loading
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>

        <p>Enter your email address to receive an OTP</p>

        {/* Email input field */}
        <input
          type="email"
          placeholder="Enter Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || otpSent}
        />

        {/* Send OTP button */}
        {!otpSent && (
          <button
            onClick={handleSendOtp}
            disabled={!email.trim() || loading}
          >
            <MdEmail className="button-icon" />
            <span>{loading ? "Sending OTP..." : "Send OTP"}</span>
          </button>
        )}

        {/* OTP input appears after successful OTP sending */}
        {otpSent && (
          <>
            <label htmlFor="otp-input">Enter the 6-digit OTP</label>

            <input
              id="otp-input"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value;

                if (/^\d{0,6}$/.test(value)) {
                  setOtp(value);
                }
              }}
              maxLength={6}
              inputMode="numeric"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
            >
              <span>{loading ? "Verifying..." : "Verify OTP"}</span>
            </button>
          </>
        )}

        {/* Success and error messages */}
        {message && (
          <p
            className={`status-message ${
              message.includes("successfully") ? "success" : "error"
            }`}
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;