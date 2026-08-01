from ultralytics import YOLO
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model" / "yolov8n.pt"

# Load YOLOv8 Nano model
model = YOLO(MODEL_PATH)


def detect_objects(image_path):
    """
    Detect objects in an image using YOLOv8.
    """

    results = model(image_path)

    detected_objects = []

    for result in results:
        names = result.names

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            object_name = names[class_id]

            detected_objects.append({
                "name": object_name,
                "confidence": confidence
            })

    return detected_objects


def determine_focus_status(detected_objects):
    """
    Convert YOLO detection results into a FocusGuard status.
    """

    person_detected = False
    phone_detected = False

    for obj in detected_objects:

        if obj["name"] == "person":
            person_detected = True

        if obj["name"] == "cell phone":
            phone_detected = True

    # Person + phone
    if person_detected and phone_detected:
        return "Digital Distraction Detected"

    # Person without phone
    if person_detected and not phone_detected:
        return "Focused Working"

    # No person
    return "Away Mode"


if __name__ == "__main__":

    image_path = "image/ss02.png"

    objects = detect_objects(image_path)

    print("\nDetected Objects:")

    for obj in objects:
        print(
            f"- {obj['name']} "
            f"(confidence: {obj['confidence']:.2f})"
        )

    status = determine_focus_status(objects)

    print("\nFocusGuard Status:")
    print(status)