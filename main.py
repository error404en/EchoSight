import cv2
import time
from collections import deque

from walk_assist.camera.camera_stream import start_camera
from walk_assist.detection.people_detector import detect
from walk_assist.voice.tts_engine import speak

from walk_assist.navigation.navigation_engine import choose_top_object
from walk_assist.navigation.spatial_analysis import estimate_distance
from walk_assist.navigation.path_finder import detect_path


message_buffer = deque(maxlen=3)
# 🔹 Setup
print("Startted") #DEBUGGING ONLY
cap = start_camera()

last_spoken_time = 0
last_message = ""
COOLDOWN = 2  # seconds

# 🔹 Smooth navigation buffer
path_buffer = deque(maxlen=5)


while True:

    print("Reding Frame") #DEBUGGING ONLY
    ret, frame = cap.read()
    if not ret:
        print ("CAM FAILED") #DEBUGGING ONLY
        break

    # 🔹 Run detection (dual model)
    results_general, results_pothole = detect(frame)

    objects = []

    # 🔹 General objects
    for r in results_general[0].boxes:
        bbox = r.xyxy[0].tolist()
        class_id = int(r.cls)
        label = results_general[0].names[class_id]

        objects.append({
            "label": label,
            "bbox": bbox
        })

    # 🔹 Potholes
    for r in results_pothole[0].boxes:
        bbox = r.xyxy[0].tolist()

        objects.append({
            "label": "pothole",
            "bbox": bbox
        })

    # 🔹 Smooth navigation (anti-jitter)
    raw_path = detect_path(objects, frame.shape[1])
    path_buffer.append(raw_path)
    path_message = max(set(path_buffer), key=path_buffer.count)

    # 🔹 Most important object
    top_object = choose_top_object(objects, frame.shape[1])

    current_time = time.time()
    message = None

    # 🔥 Critical alerts
    if top_object:
        label = top_object["label"]
        bbox = top_object["bbox"]

        distance = estimate_distance(bbox)

        CRITICAL_OBJECTS = ["car", "bus", "truck", "motorcycle", "person", "chair", "dining table"]

        if label in CRITICAL_OBJECTS and distance in ["very close", "close"]:
            message = f"stop, {label} ahead"

    # 🔹 Default to navigation
    if not message:
        message = path_message
    message_buffer.append(message)
    stable_message = max(set(message_buffer), key = message_buffer.count)

    # 🔥 SPEAK LOGIC (no silence + smooth repeat)
    if stable_message != last_message:
        speak(stable_message)
        last_message = stable_message
        last_spoken_time = current_time

    elif current_time - last_spoken_time > COOLDOWN:
        speak(message)
        last_spoken_time = current_time

    # 🔹 Display
    cv2.imshow("CHOTU Walk Assist", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()