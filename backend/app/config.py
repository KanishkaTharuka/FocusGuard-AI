# FocusGuard AI Configuration


# How often the frontend sends a webcam frame
FRAME_INTERVAL_SECONDS = 5


# How long a phone must be detected
# before we consider it a distraction
PHONE_DISTRACTION_SECONDS = 10


# How long a person must be missing
# before we consider the user away
AWAY_SECONDS = 30


# YOLO confidence threshold
CONFIDENCE_THRESHOLD = 0.5


# YOLO model location
MODEL_PATH = "model/yolov8n.pt"