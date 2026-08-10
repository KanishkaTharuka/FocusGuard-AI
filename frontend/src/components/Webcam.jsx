import { useEffect, useRef } from "react";

function Webcam({
  cameraStarted,
  setCameraStarted,
  setStatus,
  setDuration,
  setPersonDetected,
  setPhoneDetected,
  setDetections,
  setError,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  // --------------------------------
  // Start Camera
  // --------------------------------
  const startCamera = async () => {
    try {
      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
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

    } catch (error) {
      console.error(error);

      setError(
        "Unable to access webcam. Please allow camera permission."
      );
    }
  };

  // --------------------------------
  // Capture and Send Frame
  // --------------------------------
  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (video.readyState !== 4) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          return;
        }

        const formData = new FormData();

        formData.append(
          "file",
          blob,
          "webcam-frame.jpg"
        );

        try {
          const response = await fetch(
            `${API_URL}/detect`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(
              `API Error: ${response.status}`
            );
          }

          const result =
            await response.json();

          console.log(
            "Detection result:",
            result
          );

          // Update UI
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

          setError("");

        } catch (error) {
          console.error(error);

          setError(
            "Failed to connect to FocusGuard API."
          );
        }
      },
      "image/jpeg",
      0.8
    );
  };

  // --------------------------------
  // Detection Loop
  // --------------------------------
  useEffect(() => {
    if (!cameraStarted) {
      return;
    }

    // First frame immediately
    captureAndSendFrame();

    // Every 1 second
    intervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 5000);

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

    clearInterval(intervalRef.current);

    setCameraStarted(false);

    setStatus("Camera stopped");

    setDuration(0);
    setPersonDetected(false);
    setPhoneDetected(false);
    setDetections([]);
  };

  return (
    <section>
      {/* Webcam Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="aspect-video w-full object-cover"
        />

        {/* Camera Overlay */}
        {!cameraStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <div className="text-center">
              
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <span className="text-2xl">
                  📷
                </span>
              </div>

              <p className="text-sm font-medium text-slate-300">
                Camera is not running
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Start the camera to begin detection
              </p>
            </div>
          </div>
        )}

        {/* Live Indicator */}
        {cameraStarted && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>

            <span className="text-xs font-semibold text-white">
              LIVE
            </span>
          </div>
        )}

      </div>

      {/* Hidden Canvas */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Camera Buttons */}
      <div className="mt-5 flex justify-center">

        {!cameraStarted ? (
          <button
            onClick={startCamera}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Stop Camera
          </button>
        )}

      </div>
    </section>
  );
}

export default Webcam;