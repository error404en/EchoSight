import whisper
import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np

fs = 16000
duration = 5
MIC_DEVICE = 4

print("Loading Whisper model...")
model = whisper.load_model("base")
print("Model loaded.")

print("Speak now...")

audio = sd.rec(
    int(duration * fs),
    samplerate=fs,
    channels=1,
    device=MIC_DEVICE,
    dtype="float32"
)

sd.wait()

# amplify audio
audio = audio * 8

# flatten to mono
audio = audio.flatten()

# prevent clipping
audio = np.clip(audio, -1, 1)

print("Max amplitude:", np.max(audio))

write("speech_input.wav", fs, audio)

print("Audio recorded.")

print("Transcribing speech...")

result = model.transcribe(
    "speech_input.wav",
    language="en",
    fp16=False
)

print("\nDetected text:")
print(result["text"])