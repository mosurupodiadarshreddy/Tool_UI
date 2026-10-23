
import { useEffect, useRef, useState } from "react";

function SpeechToText({ audioStream, onTranscript, onQuestion }) {
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const pendingTextRef = useRef("");
  const questionCountRef = useRef(0);

  useEffect(() => {
    if (!audioStream) {
      setIsListening(false);
      setError("");
      pendingTextRef.current = "";
      onTranscript?.("");
      return;
    }

    const audioTrack = audioStream.getAudioTracks()[0];

    if (!audioTrack || audioTrack.readyState !== "live") {
      setError("No active audio track. Check your screen-sharing audio.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
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

      pendingTextRef.current = "";
      finalParts = [];
      interimText = "";

      questionCountRef.current += 1;

      const segment = {
        id: `${Date.now()}-${questionCountRef.current}`,
        number: questionCountRef.current,
        text: /[.!?]$/.test(text) ? text : `${text}?`,
      };

      onQuestion?.(segment);
      onTranscript?.("");
    };

    const resetSilenceTimer = () => {
      clearTimeout(silenceTimerRef.current);

      silenceTimerRef.current = setTimeout(() => {
        if (active) finalizeSegment();
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

      // Keep all finalized words and append the current interim phrase.
      pendingTextRef.current = [
        ...finalParts,
        interimText.trim(),
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ");

      onTranscript?.(pendingTextRef.current);

      if (pendingTextRef.current.trim()) {
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
      // Audio-track input is not supported by every browser.
      recognition.start(audioTrack);
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setError(
        "This browser may not support recognition from a shared audio track."
      );
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

      recognitionRef.current = null;
    };
  }, [audioStream, onTranscript, onQuestion]);

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
