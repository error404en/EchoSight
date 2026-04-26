import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np
from speechbrain.inference.speaker import SpeakerRecognition

# -------- SETTINGS --------
fs = 16000
MIC_DEVICE = 4   # Laptop microphone (Realtek)

# -------- LOAD MODEL --------
print("Loading speaker recognition model...")

verification = SpeakerRecognition.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir="tmp_model"
)

# -------- AUDIO RECORD FUNCTION --------
def record_audio(filename, duration):

    print(f"Recording {duration} seconds... Speak clearly.")

    audio = sd.rec(
        int(duration * fs),
        samplerate=fs,
        channels=1,
        device=MIC_DEVICE,
        dtype='float32'
    )

    sd.wait()

    # amplify audio
    audio = audio * 5

    # avoid clipping
    audio = np.clip(audio, -1, 1)

    write(filename, fs, audio)

    print(f"Saved recording: {filename}")
    print("Max amplitude:", np.max(audio))


# -------- STEP 1: RECORD REFERENCE VOICE --------
def record_reference():

    print("\nSTEP 1: Recording reference voice")
    record_audio("my_voice.wav", 5)


# -------- STEP 2: RECORD TEST VOICE --------
def record_test():

    print("\nSTEP 2: Recording test voice")
    record_audio("test_voice.wav", 3)


# -------- STEP 3: VERIFY SPEAKER --------
def verify_speaker():

    print("\nSTEP 3: Comparing voices")

    score, _ = verification.verify_files(
        "my_voice.wav",
        "test_voice.wav"
    )

    similarity = score.item()

    print("Similarity score:", similarity)

    # threshold for same speaker
    if similarity > 0.65:
        print("\nVoice verified. CHOTU will respond.")
    else:
        print("\nUnknown speaker. CHOTU will ignore.")


# -------- MAIN PROGRAM --------
if __name__ == "__main__":

    record_reference()   # record your voice
    record_test()        # record test audio
    verify_speaker()     # compare voices