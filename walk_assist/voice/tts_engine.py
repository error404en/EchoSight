import pyttsx3
import threading
import queue

engine = pyttsx3.init()
engine.setProperty('rate', 170)

speech_queue = queue.Queue()

def _worker():
    while True:
        text = speech_queue.get()
        if text is None:
            break
        engine.say(text)
        engine.runAndWait()
        speech_queue.task_done()

# 🔥 start single background thread
threading.Thread(target=_worker, daemon=True).start()

def speak(text):
    if not text:
        return

    # 🔥 prevent flooding queue
    if speech_queue.qsize() > 2:
        return

    speech_queue.put(text)