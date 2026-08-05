
import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [cameraStarted, setCameraStarted] = useState(false);

  const [status, setStatus] = useState("Camera not started");

  const [duration, setDuration] = useState(0);

  const [personDetected, setPersonDetected] = useState(false);

  const [phoneDetected, setPhoneDetected] = useState(false);

  const [detections, setDetections] = useState([]);

  const [error, setError] = useState("");

  // --------------------------------
  // Start Webcam
  // --------------------------------
  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoRef.current.srcObject = stream;

      setCameraStarted(true);
      setStatus("Camera started");

      // Reset previous result
      setDuration(0);
      setPersonDetected(false);
      setPhoneDetected(false);
      setDetections([]);

    } catch (err) {
      console.error(err);

      setError("Unable to access webcam.");
    }
  };

  // --------------------------------
  // Capture current webcam frame
  // --------------------------------
  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    // Make sure webcam has loaded
    if (video.readyState !== 4) {
      return;
    }

    // Set canvas size equal to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Get canvas context
    const context = canvas.getContext("2d");

    // Draw current webcam frame
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert canvas image to JPEG
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          return;
        }

        // --------------------------------
        // Create FormData
        // --------------------------------
        const formData = new FormData();

        formData.append(
          "file",
          blob,
          "webcam-frame.jpg"
        );

        try {
          // --------------------------------
          // Send image to FastAPI
          // --------------------------------
          const response = await fetch(
            "http://127.0.0.1:8000/detect",
            {
              method: "POST",
              body: formData,
            }
          );

          // Check API response
          if (!response.ok) {
            throw new Error(
              `API Error: ${response.status}`
            );
          }

          // Convert response to JSON
          const result = await response.json();

          console.log(
            "Detection result:",
            result
          );

          // --------------------------------
          // Update React state
          // --------------------------------

          setStatus(
            result.status || "Unknown"
          );

          setDuration(
            result.duration || 0
          );

          setPersonDetected(
            result.person_detected || false
          );

          setPhoneDetected(
            result.phone_detected || false
          );

          setDetections(
            result.detections || []
          );

          // Clear previous error
          setError("");

        } catch (err) {
          console.error(err);

          setError(
            "Failed to connect to FocusGuard API."
          );
        }
      },

      // Image format
      "image/jpeg",

      // JPEG quality
      0.8
    );
  };

  // --------------------------------
  // Start Detection Loop
  // --------------------------------
  useEffect(() => {
    if (!cameraStarted) {
      return;
    }

    // Capture first frame immediately
    captureAndSendFrame();

    // Capture every 1 second
    intervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 1000);

    // Cleanup interval
    return () => {
      clearInterval(intervalRef.current);
    };

  }, [cameraStarted]);

  // --------------------------------
  // Stop Camera
  // --------------------------------
  const stopCamera = () => {
    const video = videoRef.current;

    if (video && video.srcObject) {
      const tracks =
        video.srcObject.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      video.srcObject = null;
    }

    // Stop detection loop
    clearInterval(intervalRef.current);

    setCameraStarted(false);

    setStatus("Camera stopped");

    setDuration(0);

    setPersonDetected(false);

    setPhoneDetected(false);

    setDetections([]);
  };

  // --------------------------------
  // Status Helper
  // --------------------------------
  const getStatusColor = () => {
    if (status === "Focused Working") {
      return "green";
    }

    if (
      status === "Digital Distraction Detected"
    ) {
      return "red";
    }

    if (status === "Away Mode") {
      return "orange";
    }

    return "black";
  };

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >

      {/* -------------------------------- */}
      {/* Page Title */}
      {/* -------------------------------- */}

      <h1>FocusGuard AI</h1>

      <p>
        AI-Based Digital Distraction Detection
      </p>


      {/* -------------------------------- */}
      {/* Webcam */}
      {/* -------------------------------- */}

      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "640px",
            maxWidth: "100%",
            borderRadius: "10px",
            border: "2px solid #333",
          }}
        />
      </div>


      {/* -------------------------------- */}
      {/* Hidden Canvas */}
      {/* -------------------------------- */}

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />


      {/* -------------------------------- */}
      {/* Camera Buttons */}
      {/* -------------------------------- */}

      <div
        style={{
          marginTop: "20px",
        }}
      >

        {!cameraStarted ? (
          <button
            onClick={startCamera}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Stop Camera
          </button>
        )}

      </div>


      {/* -------------------------------- */}
      {/* Error */}
      {/* -------------------------------- */}

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}


      {/* -------------------------------- */}
      {/* Focus Result */}
      {/* -------------------------------- */}

      <div
        style={{
          marginTop: "30px",
        }}
      >

        <h2>FocusGuard Result</h2>


        {/* Status */}

        <p>
          <strong>Status:</strong>{" "}

          <span
            style={{
              color: getStatusColor(),
              fontWeight: "bold",
            }}
          >
            {status}
          </span>
        </p>


        {/* Duration */}

        <p>
          <strong>Phone Detection Duration:</strong>{" "}

          {duration.toFixed(1)} seconds
        </p>


        {/* Person */}

        <p>
          <strong>Person:</strong>{" "}

          {personDetected
            ? "Detected"
            : "Not Detected"}
        </p>


        {/* Phone */}

        <p>
          <strong>Phone:</strong>{" "}

          {phoneDetected
            ? "Detected"
            : "Not Detected"}
        </p>

      </div>


      {/* -------------------------------- */}
      {/* YOLO Detections */}
      {/* -------------------------------- */}

      <div
        style={{
          marginTop: "30px",
        }}
      >

        <h2>Detections</h2>


        {detections.length === 0 ? (

          <p>
            No objects detected.
          </p>

        ) : (

          <ul>

            {detections.map(
              (detection, index) => (

                <li key={index}>

                  {detection.name}

                  {" — "}

                  {(
                    detection.confidence * 100
                  ).toFixed(1)}

                  %

                </li>

              )
            )}

          </ul>

        )}

      </div>

    </div>
  );
}

export default App;

