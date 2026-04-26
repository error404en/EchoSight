from ultralytics import YOLO
from config import GENERAL_MODEL_PATH, POTHOLE_MODEL_PATH, CONFIDENCE_THRESHOLD

# 🔹 Load models
general_model = YOLO(GENERAL_MODEL_PATH)
pothole_model = YOLO(POTHOLE_MODEL_PATH)


def detect(frame):

    # 🔹 General objects (person, car, etc.)
    results_general = general_model(frame, imgsz=320, conf=CONFIDENCE_THRESHOLD, verbose=False)

    # 🔹 Pothole detection
    results_pothole = pothole_model(frame, imgsz=320, conf=CONFIDENCE_THRESHOLD, verbose=False)

    return results_general, results_pothole