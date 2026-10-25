
import { useEffect, useRef, useState } from "react";
import { FaDesktop } from "react-icons/fa";
import "../styles/ScreenShare.css";

function ScreenShare({ onStreamChange }) {
  const [isSharing, setIsSharing] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  const streamRef = useRef(null);

  const stopSharing = () => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    }

    onStreamChange?.(null);
    setIsSharing(false);
    setIsAudioActive(false);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      setIsSharing(Boolean(videoTrack?.readyState === "live"));

      if (audioTrack) {
        const updateAudioStatus = () => {
          setIsAudioActive(
            audioTrack.readyState === "live" &&
              audioTrack.enabled &&
              !audioTrack.muted
          );
        };

        updateAudioStatus();
        onStreamChange?.(stream);

        audioTrack.onended = updateAudioStatus;
        audioTrack.onmute = updateAudioStatus;
        audioTrack.onunmute = updateAudioStatus;
      } else {
        setIsAudioActive(false);
        onStreamChange?.(null);
      }

      if (videoTrack) {
        videoTrack.onended = stopSharing;
      }
    } catch (error) {
      console.error("Screen sharing failed:", error);
      setIsSharing(false);
      setIsAudioActive(false);
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    };
  }, []);

  return (
    <div className="screen-share-control">
      <button
        type="button"
        className={`screen-share-btn ${
          isSharing ? "sharing-active" : "sharing-inactive"
        }`}
        onClick={isSharing ? stopSharing : startScreenShare}
        title={
          isSharing
            ? isAudioActive
              ? "Screen sharing active — audio available"
              : "Screen sharing active — no audio"
            : "Share screen"
        }
        aria-label={isSharing ? "Stop screen sharing" : "Share screen"}
      >
        <FaDesktop /> Screen
      </button>
    </div>
  );
}

export default ScreenShare;
