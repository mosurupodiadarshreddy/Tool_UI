import { useState } from "react";
import "../styles/InterviewSetupModal.css";

function InterviewSetupModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [round, setRound] = useState("L1");
  const [duration, setDuration] = useState("60");

  // Submit button click
  const handleSubmit = () => {
    // Basic validation
    if (name.trim() === "" || email.trim() === "" || company.trim() === "") {
      alert("Please fill all required fields");
      return;
    }

    // Create object and send to parent component
    const interviewDetails = {
      name,
      email,
      company,
      round,
      duration,
    };

    onSubmit(interviewDetails);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Interview Setup</h2>

        {/* Name */}
        <div className="form-group">
          <label>Name *</label>

          <input
            type="text"
            placeholder="Enter candidate name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email *</label>

          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Company */}
        <div className="form-group">
          <label>Company *</label>

          <input
            type="text"
            placeholder="Enter company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        {/* Round */}
        <div className="form-group">
          <label>Interview Round</label>

          <select value={round} onChange={(e) => setRound(e.target.value)}>
            <option>L1</option>
            <option>L2</option>
            <option>L3</option>
            <option>HR</option>
          </select>
        </div>

        {/* Duration */}
        <div className="form-group">
          <label>Duration</label>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="30">30 Minutes</option>
            <option value="45">45 Minutes</option>
            <option value="60">60 Minutes</option>
            <option value="90">90 Minutes</option>
          </select>
        </div>

        {/* Footer Buttons */}
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="submit-btn" onClick={handleSubmit}>
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetupModal;
