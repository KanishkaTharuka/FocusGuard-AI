import io

from PIL import Image
from ultralytics import YOLO

from app.config import MODEL_PATH, CONFIDENCE_THRESHOLD


# Load YOLO model once when the application starts
model = YOLO(MODEL_PATH)


def detect_objects(image_bytes):

    # Convert bytes into an image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Run YOLO inference
    results = model(
        image,
        conf=CONFIDENCE_THRESHOLD
    )

    detections = []

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])

            confidence = float(box.conf[0])

            class_name = model.names[class_id]

            detections.append({
                "name": class_name,
                "confidence": round(confidence, 3)
            })

    return detections