
import { useEffect, useRef, useState } from "react";

function SpeechToText({ audioStream, onTranscript, onQuestion }) {
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const pendingTextRef = useRef("");
  const questionCountRef = useRef(0);

  // Keep the latest callbacks without restarting speech recognition.
  const onTranscriptRef = useRef(onTranscript);
  const onQuestionRef = useRef(onQuestion);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onQuestionRef.current = onQuestion;
  }, [onQuestion]);

  useEffect(() => {
    if (!audioStream) {
      setIsListening(false);
      setError("");
      pendingTextRef.current = "";
      clearTimeout(silenceTimerRef.current);
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
    let finalParts = [];
    let interimText = "";

    const finalizeSegment = () => {
      clearTimeout(silenceTimerRef.current);

      const text = pendingTextRef.current.trim();
      if (!text) return;

      // Clear only the current segment, not the saved question history.
      pendingTextRef.current = "";
      finalParts = [];
      interimText = "";

      questionCountRef.current += 1;

      const segment = {
        id: `${Date.now()}-${questionCountRef.current}`,
        number: questionCountRef.current,
        text: /[.!?]$/.test(text) ? text : `${text}?`,
      };

      // Save the completed question in the parent component first.
      onQuestionRef.current?.(segment);

      // Clear only the temporary live transcript.
      onTranscriptRef.current?.("");
    };

    const resetSilenceTimer = () => {
      clearTimeout(silenceTimerRef.current);

      silenceTimerRef.current = setTimeout(() => {
        if (active) {
          finalizeSegment();
        }
      }, 2500);
    };

    recognition.onstart = () => {
      if (!active) return;
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      if (!active) return;

      interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const recognizedText = result[0]?.transcript?.trim();

        if (!recognizedText) continue;

        if (result.isFinal) {
          finalParts.push(recognizedText);
        } else {
          interimText += `${recognizedText} `;
        }
      }

      pendingTextRef.current = [
        ...finalParts,
        interimText.trim(),
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      onTranscriptRef.current?.(pendingTextRef.current);

      if (pendingTextRef.current) {
        resetSilenceTimer();
      }
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
      // Preserve your existing audio-track recognition approach.
      recognition.start(audioTrack);
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setError(
        "This browser may not support recognition from a shared audio track."
      );
      setIsListening(false);
    }

    return () => {
      active = false;
      clearTimeout(silenceTimerRef.current);

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
}

export default SpeechToText;
