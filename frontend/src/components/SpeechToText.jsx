
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const SpeechToText = forwardRef(function SpeechToText(
  { audioStream, onTranscript },
  ref
) {
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const pendingTextRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);

  // The index of the first recognition result for the active question.
  const questionStartIndexRef = useRef(0);
  const latestResultCountRef = useRef(0);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useImperativeHandle(ref, () => ({
    getCurrentTranscript() {
      return pendingTextRef.current.trim();
    },

    clearCurrentTranscript() {
      // Start the next question after all results received so far.
      questionStartIndexRef.current = latestResultCountRef.current;
      pendingTextRef.current = "";
      onTranscriptRef.current?.("");
    },
  }));

  useEffect(() => {
    if (!audioStream) {
      setIsListening(false);
      setError("");
      pendingTextRef.current = "";
      questionStartIndexRef.current = 0;
      latestResultCountRef.current = 0;
      onTranscriptRef.current?.("");
      return;
    }

    const audioTrack = audioStream.getAudioTracks()[0];

    if (!audioTrack || audioTrack.readyState !== "live") {
      setError("No active audio track. Check your screen-sharing audio.");
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let active = true;

    recognition.onstart = () => {
      if (!active) return;
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      if (!active) return;

      latestResultCountRef.current = event.results.length;

      // If the browser resets its results list, reset our boundary too.
      if (
        questionStartIndexRef.current > event.results.length
      ) {
        questionStartIndexRef.current = 0;
      }

      const finalParts = [];
      let interimText = "";

      // Rebuild the active question from all results since its boundary.
      // This preserves earlier finalized words across recognition updates.
      for (
        let i = questionStartIndexRef.current;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];
        const recognizedText = result[0]?.transcript?.trim();

        if (!recognizedText) continue;

        if (result.isFinal) {
          finalParts.push(recognizedText);
        } else {
          interimText += `${recognizedText} `;
        }
      }

      const updatedText = [...finalParts, interimText.trim()]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pendingTextRef.current = updatedText;
      onTranscriptRef.current?.(updatedText);
    };

    recognition.onerror = (event) => {
      if (!active) return;

      console.error("Speech recognition error:", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (!active) return;
      setIsListening(false);
    };

    try {
      // Preserving your current startup approach for this iteration.
      recognition.start(audioTrack);
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setError("Could not start speech recognition.");
      setIsListening(false);
    }

    return () => {
      active = false;

      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onstart = null;

      try {
        recognition.abort();
      } catch {
        // Recognition may already have stopped.
      }

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };
  }, [audioStream]);

  return (
    <div className="speech-to-text">
      {error && <p role="status">{error}</p>}

      {audioStream && !error && (
        <span
          className={`audio-indicator ${
            isListening ? "audio-active" : "audio-inactive"
          }`}
          title={isListening ? "Recognition active" : "Recognition inactive"}
          role="status"
        />
      )}
    </div>
  );
});

export default SpeechToText;
