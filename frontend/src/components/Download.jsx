
import { FaDownload } from "react-icons/fa";

function Download({ history }) {
  const handleDownload = () => {
    if (!history || history.length === 0) {
      alert("No answers available to download.");
      return;
    }

    // Format all generated questions and answers.
    const content = history
      .map(
        (item, index) =>
          `Question ${index + 1}:\n${item.question}\n\nAI Answer:\n${item.answer}`
      )
      .join("\n\n----------------------------------------\n\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    // Download the complete interview answer history.
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "interview-answers.txt";
    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="action-btn"
      onClick={handleDownload}
      disabled={!history || history.length === 0}
    >
      <FaDownload /> Download
    </button>
  );
}

export default Download;
