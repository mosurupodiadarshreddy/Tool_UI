
import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import "../styles/QuestionInputPanel.css";
import { FaSearch } from "react-icons/fa";
import { AUTH_API } from "../constants/apiConstants";

const QuestionInputPanel = forwardRef(function QuestionInputPanel(
  { onAnswerGenerated, onLoadingChange, transcript },
  ref
) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fill the input when new speech is recognized.
  useEffect(() => {
    if (transcript?.trim()) {
      setQuestion(transcript);
      setError("");
    }
  }, [transcript]);

  const handleGenerateAnswer = async () => {
    if (!question.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    onLoadingChange?.(true);
    setError("");

    try {
      // Send the question to the existing AI answer API.
      const response = await fetch(AUTH_API.AI_API_GENERATE_ANSWER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to generate answer");
      }

      // Display the generated answer in the Answer Panel.
      onAnswerGenerated({
        question: result.question,
        answer: result.answer,
      });

      setQuestion("");
    } catch (error) {
      console.error("AI answer generation failed:", error);
      setError(error.message || "Unable to generate answer");
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  // Allow the parent Create Answer button to trigger generation.
  useImperativeHandle(ref, () => ({
    generateAnswer: handleGenerateAnswer,
  }));

  return (
    <div className="question-input-container">
      <textarea
        className="question-input"
        placeholder="Type interview question here..."
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        disabled={isLoading}
      />

      <div className="input-footer">
        {error && <span className="error-message">{error}</span>}

        <button
          className="generate-btn"
          onClick={handleGenerateAnswer}
          disabled={!question.trim() || isLoading}
          aria-label="Generate answer"
        >
          <FaSearch />
        </button>
      </div>
    </div>
  );
});

export default QuestionInputPanel;
