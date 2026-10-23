
import { useEffect, useRef, useState } from "react";
import { FaDesktop } from "react-icons/fa";

function ScreenShare({ onStreamChange }) {
  const [isSharing, setIsSharing] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  const streamRef = useRef(null);

  const stopSharing = () => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
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

      const audioTracks = stream.getAudioTracks();

      setIsSharing(true);

      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];

        setIsAudioActive(audioTrack.readyState === "live" && audioTrack.enabled);
        onStreamChange?.(stream);

        audioTrack.onended = () => {
          setIsAudioActive(false);
        };

        audioTrack.onmute = () => {
          setIsAudioActive(false);
        };

        audioTrack.onunmute = () => {
          setIsAudioActive(
            audioTrack.readyState === "live" && audioTrack.enabled
          );
        };
      } else {
        setIsAudioActive(false);
        onStreamChange?.(null);
      }

      const videoTrack = stream.getVideoTracks()[0];

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
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="screen-share-control">
      <button
        type="button"
        className="screen-share-btn"
        onClick={isSharing ? stopSharing : startScreenShare}
      >
        <FaDesktop />
        {isSharing ? "Stop Sharing" : "Share Screen"}
      </button>

      <span
        className={`audio-indicator ${
          isAudioActive ? "audio-active" : "audio-inactive"
        }`}
        title={isAudioActive ? "Audio track active" : "Audio track inactive"}
        role="status"
        aria-label={isAudioActive ? "Audio track active" : "Audio track inactive"}
      />
    </div>
  );
}

export default ScreenShare;
