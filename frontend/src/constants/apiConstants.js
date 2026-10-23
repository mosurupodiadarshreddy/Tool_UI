
 // Backend API base URL
export const API_BASE_URL = "http://localhost:8080/api";

// Authentication and other API endpoints
export const AUTH_API = {
  SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  RESUME_UPLOAD_API: `${API_BASE_URL}/resume/upload`,
  AI_API_GENERATE_ANSWER: `${API_BASE_URL}/ai/answer`,
  SPEECH_TRANSCRIBE: `${API_BASE_URL}/speech/transcribe`,
};
