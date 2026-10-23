
import "../styles/Answer.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Answer({ history, currentIndex, onPrevious, onNext }) {
  const currentItem = history[currentIndex];

  return (
    <div className="answer-panel">
      <div className="answer-header">
        <h3>AI Answer Panel</h3>

        <div className="page-navigation">
          <button
            onClick={onPrevious}
            disabled={currentIndex <= 0}
            aria-label="Previous question"
          >
            <FaChevronLeft />
          </button>

          <span>
            {history.length ? currentIndex + 1 : 0} / {history.length}
          </span>

          <button
            onClick={onNext}
            disabled={currentIndex >= history.length - 1}
            aria-label="Next question"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {currentItem ? (
        <div className="answer-content">
          <h4>Question {currentIndex + 1}</h4>
          <p className="answer-question">{currentItem.question}</p>

          <h4>AI Answer</h4>
          <div className="answer-text">{currentItem.answer}</div>
        </div>
      ) : (
        <div className="answer-placeholder">
          <h3>No answers yet</h3>
          <p>Enter an interview question and click Generate.</p>
        </div>
      )}
    </div>
  );
}

export default Answer;
