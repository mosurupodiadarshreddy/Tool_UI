
import AnswerPanel from "../components/Answer";
import QuestionInputPanel from "../components/QuestionInputPanel";
import QuestionList from "../components/QuestionList";
import SpeechToText from "../components/SpeechToText";
import InterviewSetupModal from "../components/InterviewSetupModal";
import ScreenShare from "../components/ScreenShare";
import Download from "../components/Download";
import { FaFileAlt, FaPlay } from "react-icons/fa";

import "../styles/Panel.css";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_API } from "../constants/apiConstants";

function Panel() {
  const navigate = useNavigate();

  const questionInputRef = useRef(null);
  const speechToTextRef = useRef(null);
  const submittingQuestionRef = useRef(false);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [questions, setQuestions] = useState([]);
  const [audioStream, setAudioStream] = useState(null);

  const [answerHistory, setAnswerHistory] = useState([]);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);

  useEffect(() => {
    if (!interviewStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((previousValue) => Math.max(0, previousValue - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, timeLeft]);

  const handleTranscript = useCallback((text) => {
    setTranscript(text);
  }, []);

  const handleAudioQuestionAnswer = useCallback(() => {
    // Prevent duplicate clicks before React updates the UI.
    if (submittingQuestionRef.current) return;

    const questionText =
      speechToTextRef.current?.getCurrentTranscript()?.trim() ||
      transcript.trim();

    if (!questionText) return;

    submittingQuestionRef.current = true;

    const question = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: questionText,
    };

    setQuestions((previousQuestions) => [
      ...previousQuestions,
      {
        ...question,
        number: previousQuestions.length + 1,
      },
    ]);

    // Clear immediately so the next spoken question starts fresh.
    speechToTextRef.current?.clearCurrentTranscript();
    setTranscript("");

    // Submit the immutable text snapshot to the existing AI API.
    questionInputRef.current?.generateAnswer(questionText);

    // Release the click guard on the next event-loop turn.
    // The input panel's loading state still controls the button UI.
    window.setTimeout(() => {
      submittingQuestionRef.current = false;
    }, 0);
  }, [transcript]);

  const handleLogout = () => {
    if (window.confirm("Are you sure to logout?")) {
      setAudioStream(null);
      navigate("/");
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };

  const handleResumeUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("resume", selectedFile);
    setIsUploading(true);

    try {
      const response = await fetch(AUTH_API.RESUME_UPLOAD_API, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Resume upload failed");
      }

      setResumeFile(selectedFile);
      alert("Resume uploaded successfully!");
      console.log("Resume upload response:", result);
    } catch (error) {
      console.error("Resume upload failed:", error);
      alert(error.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleAnswerGenerated = useCallback((item) => {
    setAnswerHistory((previousHistory) => {
      const updatedHistory = [...previousHistory, item];
      setCurrentAnswerIndex(updatedHistory.length - 1);
      return updatedHistory;
    });
  }, []);

  const handlePreviousAnswer = () => {
    setCurrentAnswerIndex((index) => Math.max(0, index - 1));
  };

  const handleNextAnswer = () => {
    setCurrentAnswerIndex((index) =>
      Math.min(answerHistory.length - 1, index + 1),
    );
  };

  return (
    <>
      {showModal && (
        <InterviewSetupModal
          onClose={() => setShowModal(false)}
          onSubmit={(interviewDetails) => {
            setCandidateDetails(interviewDetails);
            setTimeLeft(Number(interviewDetails.duration) * 60);
            setInterviewStarted(true);
            setShowModal(false);
          }}
        />
      )}

      <div className="panel-container">
        <div className="panel-content">
          <div className="left-panel">
            <div className="panel-header">
              {!interviewStarted ? (
                <button
                  className="start-btn"
                  onClick={() => setShowModal(true)}
                >
                  <FaPlay />
                  Start
                </button>
              ) : (
                <button className="timer-btn">
                  ⏱ {formatTime(timeLeft)}
                </button>
              )}

              <ScreenShare onStreamChange={setAudioStream} />

              <label
                className={`resume-icon-btn ${
                  resumeFile ? "resume-uploaded" : "resume-not-uploaded"
                }`}
                title={
                  isUploading
                    ? "Uploading resume..."
                    : resumeFile
                      ? `Resume uploaded: ${resumeFile.name}`
                      : "Upload resume"
                }
                aria-label={resumeFile ? "Resume uploaded" : "Upload resume"}
              >
                {isUploading ? (
                  <span className="resume-spinner" />
                ) : (
                  <FaFileAlt />
                )}
                <span>Resume</span>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={isUploading || Boolean(resumeFile)}
                  hidden
                />
              </label>

              {interviewStarted && (
                <select className="speed-dropdown" defaultValue="Balanced">
                  <option value="Fastest">Fastest</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Accurate">Accurate</option>
                </select>
              )}

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div className="question-section">
              <SpeechToText
                ref={speechToTextRef}
                audioStream={audioStream}
                onTranscript={handleTranscript}
              />

              <QuestionList
                questions={questions}
                transcript={transcript}
                onGenerateAnswer={handleAudioQuestionAnswer}
                isGeneratingAnswer={isGeneratingAnswer}
              />
            </div>

            <div className="action-section">
              <button
                className="action-btn"
                onClick={handleNextAnswer}
                disabled={
                  answerHistory.length === 0 ||
                  currentAnswerIndex >= answerHistory.length - 1
                }
              >
                Next
              </button>

              <Download history={answerHistory} />
            </div>

            <div className="input-section">
              <QuestionInputPanel
                ref={questionInputRef}
                onAnswerGenerated={handleAnswerGenerated}
                onLoadingChange={setIsGeneratingAnswer}
              />
            </div>
          </div>

          <AnswerPanel
            history={answerHistory}
            currentIndex={currentAnswerIndex}
            onPrevious={handlePreviousAnswer}
            onNext={handleNextAnswer}
          />
        </div>
      </div>
    </>
  );
}

export default Panel;
