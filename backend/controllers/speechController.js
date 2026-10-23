
const sdk = require("microsoft-cognitiveservices-speech-sdk");

// Transcribe a WAV audio buffer using Azure Speech.
const transcribeSpeech = async (req, res) => {
  try {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      return res.status(500).json({
        success: false,
        message: "Azure Speech configuration is missing",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "WAV audio file is required",
      });
    }

    // Configure Azure Speech using the backend credentials.
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      speechKey,
      speechRegion
    );

    speechConfig.speechRecognitionLanguage = "en-US";

    // Azure expects supported WAV audio for this upload flow.
    const audioConfig = sdk.AudioConfig.fromWavFileInput(req.file.buffer);
    const recognizer = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    // Recognize speech and return the transcribed text.
    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();

        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          return res.status(200).json({
            success: true,
            text: result.text,
          });
        }

        if (result.reason === sdk.ResultReason.NoMatch) {
          return res.status(200).json({
            success: true,
            text: "",
            message: "No speech was recognized",
          });
        }

        console.error("Speech recognition failed:", result.errorDetails);

        return res.status(502).json({
          success: false,
          message: "Azure could not recognize the audio",
        });
      },
      (error) => {
        recognizer.close();
        console.error("Azure Speech error:", error);

        if (!res.headersSent) {
          return res.status(502).json({
            success: false,
            message: "Speech transcription failed",
          });
        }
      }
    );
  } catch (error) {
    console.error("Speech transcription error:", error);

    return res.status(500).json({
      success: false,
      message: "Speech transcription failed",
    });
  }
};

module.exports = { transcribeSpeech };
