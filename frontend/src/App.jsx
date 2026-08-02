import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoRef.current.srcObject = stream;

      setCameraActive(true);
    } catch (error) {
      console.error(error);
      setError("Unable to access webcam.");
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;

    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      video.srcObject = null;
    }

    setCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    const video = videoRef.current;

    if (!video || !cameraActive) {
      setError("Please start the camera first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      });

      const formData = new FormData();

      formData.append("file", blob, "webcam.jpg");

      const response = await fetch(
        "http://127.0.0.1:8000/detect",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze webcam image.");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="app">
      <div className="container">

        <h1>FocusGuard AI</h1>

        <p className="subtitle">
          AI-powered digital distraction detection
        </p>

        <div className="camera-section">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-preview"
          />

          {!cameraActive && (
            <div className="camera-placeholder">
              Camera is not active
            </div>
          )}

        </div>

        <div className="button-group">

          {!cameraActive ? (
            <button
              className="camera-button"
              onClick={startCamera}
            >
              Start Camera
            </button>
          ) : (
            <button
              className="camera-button"
              onClick={stopCamera}
            >
              Stop Camera
            </button>
          )}

          <button
            className="analyze-button"
            onClick={captureAndAnalyze}
            disabled={!cameraActive || loading}
          >
            {loading ? "Analyzing..." : "Analyze Camera"}
          </button>

        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {result && (
          <div className="result-card">

            <h2>FocusGuard Result</h2>

            <p>
              <strong>Status:</strong>{" "}
              {result.status}
            </p>

            <h3>Detections</h3>

            {result.detections.length === 0 ? (
              <p>No objects detected.</p>
            ) : (
              result.detections.map((detection, index) => (
                <p key={index}>
                  {detection.name} —{" "}
                  {(detection.confidence * 100).toFixed(1)}%
                </p>
              ))
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;