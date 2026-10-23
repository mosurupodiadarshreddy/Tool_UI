
import AnswerPanel from "../components/Answer";
import QuestionInputPanel from "../components/QuestionInputPanel";
import SpeechToText from "../components/SpeechToText";
import InterviewSetupModal from "../components/InterviewSetupModal";
import ScreenShare from "../components/ScreenShare";
import Download from "../components/Download";

import "../styles/Panel.css";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { AUTH_API } from "../constants/apiConstants";

function Panel() {
  const navigate = useNavigate();
  const questionInputRef = useRef(null);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);

  // Current, unfinished speech segment.
  const [transcript, setTranscript] = useState("");

  // Completed questions stay visible when the transcript clears.
  const [questions, setQuestions] = useState([]);

  // Shared audio stream from ScreenShare.
  const [audioStream, setAudioStream] = useState(null);

  const [answerHistory, setAnswerHistory] = useState([]);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);

  useEffect(() => {
    if (!interviewStarted || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousValue) => Math.max(0, previousValue - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, timeLeft]);

  // Stable callbacks prevent SpeechToText from restarting recognition
  // on every Panel render.
  const handleTranscript = useCallback((text) => {
    setTranscript(text);
  }, []);

  const handleNewQuestion = useCallback((question) => {
    setQuestions((previousQuestions) => {
      // Prevent accidental duplicate insertion.
      if (
        previousQuestions.some(
          (existingQuestion) => existingQuestion.id === question.id
        )
      ) {
        return previousQuestions;
      }

      return [
        ...previousQuestions,
        {
          ...question,
          number: previousQuestions.length + 1,
        },
      ];
    });
  }, []);

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
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
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

  const handleAnswerGenerated = (item) => {
    setAnswerHistory((previousHistory) => {
      const updatedHistory = [...previousHistory, item];
      setCurrentAnswerIndex(updatedHistory.length - 1);
      return updatedHistory;
    });
  };

  const handlePreviousAnswer = () => {
    setCurrentAnswerIndex((index) => Math.max(0, index - 1));
  };

  const handleNextAnswer = () => {
    setCurrentAnswerIndex((index) =>
      Math.min(answerHistory.length - 1, index + 1)
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

              {!resumeFile ? (
                <label className="resume-btn">
                  {isUploading ? (
                    <span className="upload-loading">
                      Uploading<span className="loading-dots"></span>
                    </span>
                  ) : (
                    "Upload Resume"
                  )}

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={isUploading}
                    hidden
                  />
                </label>
              ) : (
                <button className="resume-success-btn" disabled>
                  Resume Uploaded ✓
                </button>
              )}

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
                audioStream={audioStream}
                onTranscript={handleTranscript}
                onQuestion={handleNewQuestion}
              />

              <div className="transcript-content">
                {questions.map((question) => (
                  <p key={question.id}>
                    <strong>Q{question.number}:</strong> {question.text}
                  </p>
                ))}

                {transcript && (
                  <p className="current-transcript">{transcript}</p>
                )}

                {questions.length === 0 && !transcript && (
                  <p>Waiting for speech...</p>
                )}
              </div>
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

              <button
                className="action-btn"
                onClick={() => questionInputRef.current?.generateAnswer()}
                disabled={isGeneratingAnswer}
              >
                {isGeneratingAnswer ? (
                  <span className="loading-dots">Generating</span>
                ) : (
                  "Create Answer"
                )}
              </button>

              <Download history={answerHistory} />
            </div>

            <div className="input-section">
              <QuestionInputPanel
                ref={questionInputRef}
                onAnswerGenerated={handleAnswerGenerated}
                onLoadingChange={setIsGeneratingAnswer}
                transcript={transcript}
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
