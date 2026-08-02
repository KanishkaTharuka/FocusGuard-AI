from pathlib import Path
import shutil
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, File, UploadFile

from app.detector import detect_objects, determine_focus_status


app = FastAPI(
    title="FocusGuard AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary upload folder
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "FocusGuard AI Backend Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    # Uploaded file path
    file_path = UPLOAD_DIR / file.filename

    # Save uploaded image temporarily
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Send image to YOLO
    detections = detect_objects(file_path)

    # Generate FocusGuard status
    status = determine_focus_status(detections)

    return {
        "status": status,
        "detections": detections
    }