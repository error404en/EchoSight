# 🔹 MODEL PATHS
GENERAL_MODEL_PATH = "models/yolov8n.pt"   # for person, vehicles etc.
POTHOLE_MODEL_PATH = "models/best.pt"      # your trained pothole model


# 🔹 CAMERA SETTINGS
CAMERA_INDEX = 0
FRAME_WIDTH = 640
FRAME_HEIGHT = 480


# 🔹 DETECTION SETTINGS
CONFIDENCE_THRESHOLD = 0.5   # thoda low rakha for better detection


# 🔹 CLASSES TO CONSIDER
TARGET_CLASSES = [
    "person",
    "car",
    "bus",
    "truck",
    "motorcycle",
    "bicycle",
    "chair",
    "couch",
    "bed",
    "dining table",
    "dog",
    "cat",
    "pothole"
]


# 🔹 PRIORITY SYSTEM (navigation importance)
PRIORITY_OBJECTS = {
    # 🔴 HIGH PRIORITY (dangerous)
    "car": "high",
    "bus": "high",
    "truck": "high",
    "motorcycle": "high",
    "person": "high",
    "chair": "high",
    "dining table": "high",
    "couch": "medium",
    "bed": "medium",

    # 🟡 MEDIUM
    "bicycle": "medium",
    "pothole": "medium",

    # 🟢 LOW
    "dog": "low",
    "cat": "low"
}