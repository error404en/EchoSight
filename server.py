from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from chotu_ai import process_chotu

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)


@app.post("/chotu")
async def chotu_api(
    audio: UploadFile = File(...),
    image: UploadFile = File(...)
):

    audio_path = f"uploads/{audio.filename}"
    image_path = f"uploads/{image.filename}"

    with open(audio_path, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    with open(image_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    result = process_chotu(audio_path, image_path)

    return {"response": result}