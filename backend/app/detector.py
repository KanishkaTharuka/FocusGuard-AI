import io

from PIL import Image
from ultralytics import YOLO

from app.config import MODEL_PATH, CONFIDENCE_THRESHOLD


# -----------------------------------------
# Load YOLO model once
# -----------------------------------------

model = YOLO(MODEL_PATH)


# -----------------------------------------
# Classes that FocusGuard cares about
# -----------------------------------------

RELEVANT_CLASSES = {
    "person",
    "cell phone",
}


# -----------------------------------------
# Detect objects
# -----------------------------------------

def detect_objects(image_bytes):

    # -----------------------------------------
    # Convert bytes into image
    # -----------------------------------------

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")


    # -----------------------------------------
    # Run YOLO inference
    # -----------------------------------------

    results = model(
        image,
        conf=CONFIDENCE_THRESHOLD,
        verbose=False
    )


    detections = []


    # -----------------------------------------
    # Process YOLO results
    # -----------------------------------------

    for result in results:

        for box in result.boxes:

            # Class ID
            class_id = int(
                box.cls[0]
            )

            # Confidence
            confidence = float(
                box.conf[0]
            )

            # Class name
            class_name = model.names[
                class_id
            ]


            # -----------------------------------------
            # Ignore irrelevant objects
            # -----------------------------------------

            if class_name not in RELEVANT_CLASSES:
                continue


            # -----------------------------------------
            # Extra confidence check
            # -----------------------------------------

            if confidence < CONFIDENCE_THRESHOLD:
                continue


            # -----------------------------------------
            # Add detection
            # -----------------------------------------

            detections.append({

                "name": class_name,

                "confidence": round(
                    confidence,
                    3
                )
            })


    return detections