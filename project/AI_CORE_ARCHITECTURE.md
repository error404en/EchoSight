# Core AI Architecture & Pipeline: EchoSight

This document details the AI architecture and execution pipeline for **EchoSight**, a browser-based visual companion designed for the visually impaired. EchoSight operates entirely in the browser, combining lightweight local edge models with powerful cloud-based vision APIs to provide real-time scene understanding, natural conversation, and spatial awareness.

## 🧠 The Three AI Layers
1. **Voice & Speech Processing:** Web Speech API & Web Audio API (Native browser features for speech-to-text, text-to-speech, and spatial audio cues)
2. **Primary Vision & Reasoning:** Google Gemini Vision API (Cloud-based, handles complex scene descriptions, OCR, and conversational context)
3. **Local Edge Fallbacks & Enhancements:** Transformers.js & Face-api.js (In-browser models for fast object detection, depth estimation, and face counting without network latency)

### Main Execution Pipeline
```text
User Voice / Action
   ↓ 
Speech Recognition (Web Speech API transcribes audio to text)
   ↓ 
Context & Intent Evaluation (Is it a direct command or open question?)
   ↓ 
Camera Frame Capture (Grab current visual state)
   ↓ 
Vision & AI Processing (Gemini Vision API / Local Models analyze image + prompt)
   ↓ 
Text-to-Speech Reply & Spatial Audio (Speak response and trigger 3D audio cues)
```

---

## Part 1: Speech Recognition & Voice Interaction

Instead of custom Python models, EchoSight leverages native browser capabilities to ensure a zero-install, highly accessible experience.

**Core Mechanism:**
- **Speech-to-Text (STT):** Utilizes the browser's native `Web Speech API` (`SpeechRecognition`).
- **Text-to-Speech (TTS):** Utilizes `window.speechSynthesis` for natural, continuous voice feedback.
- **Process:** The application listens for specific keywords (e.g., "scan", "describe", "help") or open-ended natural language questions. Captured speech is instantly transcribed and fed into the application state.

*Technologies used: `Web Speech API`*

---

## Part 2: Primary AI Reasoning & Vision (Cloud)

The core "brain" of EchoSight relies on multimodal Large Language Models (LLMs) to understand both the user's request and the live camera feed simultaneously.

**Technology Choice:** 
**Google Gemini Vision API** (`gemini-2.5-flash-lite`, `gemini-2.5-flash`). Selected for its lightning-fast multimodal processing, generous free tier limits, and exceptional ability to combine OCR, object detection, and spatial reasoning into natural language responses.

**Processing Pipeline:**
1. **Frame Capture:** A high-resolution frame is extracted from the user's active camera feed.
2. **Prompt Construction:** The user's transcribed speech is combined with system-level safety instructions (e.g., "prioritize hazards like stairs and vehicles").
3. **Inference:** The image and prompt are sent to the Gemini API.
4. **Fallback Chain:** If the primary model is rate-limited, the system automatically falls back to secondary Gemini models to ensure uninterrupted service.

*Technologies used: `Google Gemini API`*

---

## Part 3: Local Edge AI & Spatial Awareness (In-Browser)

To enhance the cloud processing and provide immediate feedback, EchoSight runs several lightweight neural networks directly in the user's browser using WebAssembly and WebGL.

**Local Vision Pipeline:**
1. **Face Counting:** `face-api.js` (TinyFaceDetector) scans frames locally to quickly count people.
2. **Object Detection:** `Xenova/detr-resnet-50` runs via Transformers.js to identify common objects and their precise bounding boxes.
3. **Depth Estimation:** `Xenova/depth-anything-small-hf` creates a localized depth map to determine how close objects are to the user.

### Spatial Audio Engine
When local models detect an object or hazard, EchoSight doesn't just describe it—it places the sound in 3D space. Using the `Web Audio API`, the app generates audio cues (beeps or tones) that are panned left/right and adjusted for volume based on the object's physical location and depth in the camera frame.

*Technologies used: `@xenova/transformers`, `face-api.js`, `Web Audio API`*

---

## 🚀 Future Improvements & Ongoing Research

1. **Continuous Auto-Scan Optimizations:**
   - **Challenge:** Running constant video inference drains battery and hits API rate limits quickly.
   - **Solution:** Implement local motion detection algorithms to only trigger cloud API calls when significant scene changes occur.
   
2. **Wearable Integration:** 
   - Researching integration with smart glasses (via Web Bluetooth or companion apps) to move the camera viewpoint from the phone's rear camera to the user's direct line of sight.
