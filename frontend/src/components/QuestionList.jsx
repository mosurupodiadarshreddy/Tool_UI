
import "../styles/QuestionList.css";

function QuestionList({ questions = [], transcript = "" }) {
  return (
    <div className="question-list-container">
      <div className="question-list">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div className="detected-question" key={question.id}>
              <strong>Q{index + 1}:</strong>
              <span>{question.text}</span>
            </div>
          ))
        ) : (
          <p className="empty-questions">
            {transcript || "Waiting for speech..."}
          </p>
        )}
      </div>
    </div>
  );
}

export default QuestionList;
