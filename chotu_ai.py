import whisper
from paddleocr import PaddleOCR

# load models once
speech_model = whisper.load_model("base")
ocr = PaddleOCR(lang="en", show_log=False)


def detect_intent(text):

    text = text.lower()

    if "read" in text or "padh" in text:
        return "read_text"

    return "unknown"


def process_chotu(audio_path, image_path):

    # 🎤 Speech to text
    result = speech_model.transcribe(audio_path, fp16=False)
    speech = result["text"]

    print("User said:", speech)

    intent = detect_intent(speech)

    # 📖 OCR
    if intent == "read_text":

        result = ocr.ocr(image_path)

        text = ""

        if result:
            for line in result:
                for word in line:
                    text += word[1][0] + " "

        return text

    return "Command not understood"