from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.detector import detect_objects
from app.focus_logic import FocusDecisionEngine


# -----------------------------------------
# FastAPI Application
# -----------------------------------------

app = FastAPI(
    title="FocusGuard AI API"
)


# -----------------------------------------
# CORS Configuration
# -----------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------
# Focus Decision Engine
# -----------------------------------------

focus_engine = FocusDecisionEngine()


# -----------------------------------------
# Root Endpoint
# -----------------------------------------

@app.get("/")
def root():

    return {
        "message": "FocusGuard AI API is running"
    }


# -----------------------------------------
# Detection Endpoint
# -----------------------------------------

@app.post("/detect")
async def detect(
    file: UploadFile = File(...)
):

    # -----------------------------------------
    # Read uploaded image
    # -----------------------------------------

    image_bytes = await file.read()


    # -----------------------------------------
    # Run YOLO detection
    # -----------------------------------------

    detections = detect_objects(
        image_bytes
    )


    # -----------------------------------------
    # Check Person Detection
    # -----------------------------------------

    person_detected = any(
        detection["name"] == "person"
        for detection in detections
    )


    # -----------------------------------------
    # Check Phone Detection
    # -----------------------------------------

    phone_detected = any(
        detection["name"] == "cell phone"
        for detection in detections
    )


    # -----------------------------------------
    # Focus Decision
    # -----------------------------------------

    focus_result = focus_engine.get_status(
        person_detected,
        phone_detected
    )


    # -----------------------------------------
    # Return API Response
    # -----------------------------------------

    return {

        "status": focus_result["status"],

        "duration": focus_result["duration"],

        "person_detected": person_detected,

        "phone_detected": phone_detected,

        "detections": detections
    }