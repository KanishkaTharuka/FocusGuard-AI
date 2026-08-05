from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.detector import detect_objects
from app.focus_logic import FocusDecisionEngine


app = FastAPI(
    title="FocusGuard AI API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Focus Decision Engine
focus_engine = FocusDecisionEngine()


# Root endpoint
@app.get("/")
def root():

    return {
        "message": "FocusGuard AI API is running"
    }


# Detection endpoint
@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    # Read uploaded image
    image_bytes = await file.read()

    # Run YOLO detection
    detections = detect_objects(image_bytes)


    # Check detected objects
    person_detected = False
    phone_detected = False


    for detection in detections:

        if detection["name"] == "person":
            person_detected = True

        if detection["name"] == "cell phone":
            phone_detected = True


    # Focus Decision
    focus_result = focus_engine.get_status(
        person_detected,
        phone_detected
    )

    # Return response
    return {
        "status": focus_result["status"],
        "duration": focus_result["duration"],
        "person_detected": person_detected,
        "phone_detected": phone_detected,
        "detections": detections
    }