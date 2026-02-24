Build a React 18 + TypeScript web app called "EchoSight" using Vite. It is an AI visual companion for blind/visually impaired users. The app uses the device camera to see the world and describes it through voice conversation.

TECH STACK:
- React 18 + TypeScript + Vite
- Vanilla CSS (dark glassmorphism theme, no Tailwind)
- Lucide React for icons
- Google Gemini 2.0 Flash API (multimodal vision + chat) as primary AI
- @xenova/transformers for local fallback models: DETR-ResNet-50 (object detection), Depth-Anything-Small (depth estimation), vit-gpt2-image-captioning (scene captions)
- face-api.js loaded from jsDelivr CDN for face detection
- Web Speech API for voice input (SpeechRecognition) and output (SpeechSynthesis)
- Web Audio API for spatial 3D directional audio cues
- Environment variable: VITE_GEMINI_API_KEY for Gemini API

PAGE LAYOUT (single page, top to bottom):
1. Header — app name "EchoSight", status indicator dots (ready/listening/speaking), voice toggle button
2. Camera View — live video feed with face count overlay badge
3. Control Bar — row of action buttons: Scan, Describe, People, Colors, Light, Depth toggle
4. Conversation Panel — scrollable chat with AI/User message bubbles, avatars, timestamps, speaking indicator
5. Footer — "I understand natural conversation" text with example phrase pills

INTRO PAGE (OnboardingModal):
- Full-screen overlay shown on first visit (localStorage flag "echosight-onboarded")
- Dark background (#08081a) with 3 floating animated glowing orbs (purple, blue, indigo) using CSS blur and float animation
- Glassmorphism container (rgba(12,12,28,0.8), backdrop-filter blur 40px, border-radius 28px)
- Hero section: animated breathing Eye icon (72px circle, gradient purple-to-blue), gradient text title "EchoSight", tagline "Your AI-powered visual companion", short description
- Tech badges row: pills showing "GEMINI VISION AI", "DETR DETECTION", "DEPTH MAPPING", "SPATIAL AUDIO" (uppercase, 10px, purple background)
- 5 feature cards with icons: Real-time Vision (Camera), Talk Naturally (MessageCircle), Fully Hands-free (Mic), Depth Sensing (Layers), Safety First (Shield). Each card has staggered slide-in animation from left.
- Permissions notice: "Camera & Microphone access required"
- CTA button: "Start Seeing" with Eye icon, gradient purple background, hover lift effect
- Footer: "Built with love for accessibility · Powered by Gemini + DETR + Depth-Anything"
- Smooth fade-out: clicking CTA sets a "leaving" state, applies opacity:0 + scale(1.05) transition over 500ms, then removes the modal

APP STARTUP FLOW:
1. loadModels() — sets isReady=true immediately, face-api loads from CDN
2. startCamera() — opens camera stream
3. Short welcome message: "EchoSight ready. I'm listening."
4. startListening() — begins voice recognition
5. Background model loading (2s delay): captioner → DETR → depth-anything. These load silently while user is already talking.

COMMAND HANDLING (handleCommand function):
- Only 6 EXACT string matches handled locally: "scan", "describe", "stop", "start", "auto", "help"
- EVERYTHING else (any natural language) goes to Gemini Vision API: captures current camera frame, sends it as base64 inline image along with the user's text to Gemini 2.0 Flash generateContent endpoint
- Gemini system prompt instructs it to act as "EchoSight", a warm visual companion: short 2-4 sentence responses, safety first, natural descriptions, no technical jargon
- 10-second fetch timeout using AbortController on all API calls
- isProcessing flag only blocks scan/describe, never blocks conversation

VOICE (useSpeech hook):
- SpeechRecognition continuous mode, interimResults off
- speak() uses SpeechSynthesis with English voice preference
- Echo prevention: check window.speechSynthesis.speaking + 1-second cooldown after speech ends (speakingEndedAtRef timestamp). Commands received during this window are silently dropped.
- Command debounce: 2 seconds between processed commands

CAMERA (useCamera hook):
- getUserMedia with facingMode "environment", 640x480
- captureFrame() draws video to hidden canvas, returns { url: dataURL (JPEG 0.85 quality), canvas }
- Scene change detection: compare color histograms between frames, threshold 15%

GEMINI VISION SERVICE (ConversationAI class):
- quickScan(imageDataUrl) — sends frame + scan prompt, returns 2-3 sentence summary
- describeScene(imageDataUrl) — sends frame + detailed describe prompt, returns 4-6 sentence description
- chat(message, imageDataUrl?) — sends text + optional frame with conversation history (last 20 messages)
- All calls use fetchWithTimeout (10s AbortController)
- Offline fallback responses for greetings, thanks, help
- History management: keeps last 20 messages, stores scan/describe results for follow-up questions

LOCAL AI MODELS (useAIModels hook):
- Load in background 2 seconds after app starts (never block UI)
- Captioner (Xenova/vit-gpt2-image-captioning ~50MB) — local scene captions
- DETR (Xenova/detr-resnet-50 ~160MB) — object detection with NMS deduplication (IoU > 0.5), threshold 0.7, max 10 objects
- Depth-Anything (Xenova/depth-anything-small-hf ~100MB) — monocular depth maps returning Float32Array with min/max depth
- face-api.js TinyFaceDetector from CDN — face counting

SPATIAL AUDIO (useSpatialAudio hook):
- Web Audio API with AudioContext + StereoPannerNode
- playDirectionalCue(object) — plays tone panned left/right based on object position
- playAlert(pan) — plays warning beep for vehicles/hazards
- stopProximityBeep() — stops continuous proximity alert

DEPTH PROCESSING (depthProcessor.ts):
- enrichWithDepth(objects, depthResult) — adds distance/direction/pan to detected objects using depth map
- buildSceneDescription(caption, objects, faces, brightness) — builds natural language scene description with categorized objects (furniture, electronics, animals), distance phrases, safety warnings
- findNearest(objects) — returns closest object for spatial audio cue
- hasDangerousObjects(objects) — checks for vehicles/hazards

CSS DESIGN SYSTEM:
- Background: #0a0a1a
- Card backgrounds: rgba(15,15,30,0.6) with backdrop-filter blur(20px)
- Accent: #8b5cf6 (purple), gradients to #6366f1 (indigo) and #3b82f6 (blue)
- Text: primary #e2e8f0, secondary #94a3b8, muted #64748b
- Borders: rgba(255,255,255,0.08)
- Border radius: 16-28px
- Animations: cubic-bezier(0.16, 1, 0.3, 1) spring easing
- Font: Inter, system sans-serif stack
- Status dots: green pulse for ready, blue pulse for listening, amber pulse for speaking
- Chat bubbles: AI has left-aligned dark bubble with purple border, User has right-aligned blue gradient bubble
