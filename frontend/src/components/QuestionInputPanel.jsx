
import {
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import "../styles/QuestionInputPanel.css";
import { FaSearch } from "react-icons/fa";
import { AUTH_API } from "../constants/apiConstants";

const QuestionInputPanel = forwardRef(function QuestionInputPanel(
  { onAnswerGenerated, onLoadingChange },
  ref
) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateAnswer = useCallback(
    async (questionText) => {
      // An argument means the request came from a finalized audio question.
      // No argument means it came from the manual textarea's search button.
      const isAudioQuestion = typeof questionText === "string";
      const questionToSend = (
        isAudioQuestion ? questionText : question
      ).trim();

      if (!questionToSend || isLoading) {
        return;
      }

      setIsLoading(true);
      onLoadingChange?.(true);
      setError("");

      try {
        const response = await fetch(AUTH_API.AI_API_GENERATE_ANSWER, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: questionToSend }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to generate answer");
        }

        onAnswerGenerated({
          question: result.question || questionToSend,
          answer: result.answer,
        });

        // Clear the textarea only for a manually submitted question.
        if (!isAudioQuestion) {
          setQuestion("");
        }
      } catch (error) {
        console.error("AI answer generation failed:", error);
        setError(error.message || "Unable to generate answer");
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    },
    [question, isLoading, onAnswerGenerated, onLoadingChange]
  );

  useImperativeHandle(
    ref,
    () => ({
      generateAnswer: handleGenerateAnswer,
    }),
    [handleGenerateAnswer]
  );

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
          type="button"
          className="generate-btn"
          onClick={() => handleGenerateAnswer()}
          disabled={!question.trim() || isLoading}
          aria-label="Generate answer for manually typed question"
        >
          <FaSearch />
        </button>
      </div>
    </div>
  );
});

export default QuestionInputPanel;
