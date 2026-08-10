import { useState } from "react";

import Header from "./components/Header";
import Webcam from "./components/Webcam";
import StatusCard from "./components/StatusCard";
import DetectionList from "./components/DetectionList";

function App() {
  const [cameraStarted, setCameraStarted] =
    useState(false);

  const [status, setStatus] =
    useState("Camera not started");

  const [duration, setDuration] =
    useState(0);

  const [personDetected, setPersonDetected] =
    useState(false);

  const [phoneDetected, setPhoneDetected] =
    useState(false);

  const [detections, setDetections] =
    useState([]);

  const [error, setError] =
    useState("");

  return (
    <div className="min-h-screen bg-slate-50">

      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Webcam */}
          <div>
            <Webcam
              cameraStarted={cameraStarted}
              setCameraStarted={setCameraStarted}
              setStatus={setStatus}
              setDuration={setDuration}
              setPersonDetected={setPersonDetected}
              setPhoneDetected={setPhoneDetected}
              setDetections={setDetections}
              setError={setError}
            />
          </div>

          {/* Results */}
          <div className="space-y-8">

            <StatusCard
              status={status}
              duration={duration}
              personDetected={personDetected}
              phoneDetected={phoneDetected}
            />

            <DetectionList
              detections={detections}
            />

          </div>

        </div>

      </main>

    </div>
  );
}

export default App;