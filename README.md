<div align="center">

# 👁️ EchoSight

### AI-Powered Visual Companion for the Visually Impaired

*Real-time scene understanding, voice interaction, and spatial awareness — all in the browser.*

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Gemini](https://img.shields.io/badge/Gemini_Vision-2.5-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

</div>

---

## 🎯 What is EchoSight?

EchoSight is a browser-based AI assistant that helps blind and visually impaired users understand their surroundings in real time. It uses your device's camera and microphone to:

- **See** — Analyze the scene using Google Gemini Vision AI
- **Speak** — Describe objects, people, text, and hazards aloud
- **Listen** — Accept natural voice commands hands-free
- **Alert** — Flag safety hazards with spatial audio cues

> Just point your camera and ask — *"What's in front of me?"*, *"Is anyone here?"*, *"Read that sign"*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Quick Scan** | Instant 3-4 sentence scene summary with object positions and distances |
| 📝 **Full Describe** | Detailed 6-8 sentence description covering environment, objects, people, text, safety |
| 💬 **Natural Conversation** | Ask anything naturally — Gemini understands context and follow-ups |
| 🎤 **Voice Commands** | Fully hands-free — say "scan", "describe", "help", or ask any question |
| 👤 **People Detection** | Counts faces and describes people (clothing, age, activity) |
| 🎨 **Color & Light Check** | Reports dominant colors and lighting conditions |
| 🔊 **Text-to-Speech** | All responses spoken aloud with natural voice |
| ⚠️ **Safety Alerts** | Prioritizes vehicles, stairs, obstacles, wet floors in every response |
| 🎵 **Spatial Audio** | 3D audio cues indicating direction and distance of nearby objects |
| 🔄 **Auto-Scan** | Continuous scanning mode that only speaks when the scene changes |
| 📱 **Mobile Ready** | Responsive design, works on phones with rear camera |

---

## 🤖 AI Models

### Cloud (Google Gemini Vision API)
Primary AI — handles all scene analysis, conversation, and natural language:

| Model | Role | Free Tier |
|---|---|---|
| `gemini-2.5-flash-lite` | Primary — fast, lightweight | 15 RPM, 1000 RPD |
| `gemini-2.5-flash` | Fallback — higher quality | 10 RPM, 500 RPD |
| `gemini-2.0-flash-lite` | Fallback — separate quota | 30 RPM |

> Models are tried in order — if one is rate-limited, the next is used automatically.

### Local (Browser-based)
| Model | Task | Source |
|---|---|---|
| `face-api.js` (TinyFaceDetector) | Face counting | CDN (~5MB) |
| `Xenova/detr-resnet-50` | Object detection | @xenova/transformers |
| `Xenova/depth-anything-small-hf` | Depth estimation | @xenova/transformers |
| `Xenova/vit-gpt2-image-captioning` | Image captioning | @xenova/transformers |

> Local models load in the background and serve as optional fallbacks.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Gemini API Key** (free) — [Get one here](https://aistudio.google.com/apikey)

### Setup

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd Blind-Visual-Aid/project

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key:
# VITE_GEMINI_API_KEY=your_key_here

# 4. Start development server
npm run dev
```

Open `http://localhost:5173` in Chrome (recommended for best speech recognition support).

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI vision |
| `VITE_SUPABASE_URL` | ❌ No | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ❌ No | Supabase anonymous key |

---

## 🗣️ Voice Commands

| Command | Action |
|---|---|
| **"scan"** | Quick scene analysis |
| **"describe"** | Detailed scene description |
| **"start"** / **"stop"** | Start or stop the camera |
| **"mute"** / **"unmute"** | Toggle microphone |
| **"quiet"** / **"shut up"** | Stop AI from speaking |
| **"auto"** | Toggle auto-scan mode |
| **"help"** | List available commands |
| *Anything else* | Sent to Gemini as a natural question with camera context |

---

## 🏗️ Project Structure

```
project/
├── src/
│   ├── App.tsx                     # Main application orchestrator
│   ├── main.tsx                    # Entry point
│   ├── index.css                   # Full design system
│   ├── components/
│   │   ├── Header.tsx              # Status bar + quick controls
│   │   ├── CameraView.tsx          # Live camera feed + overlays
│   │   ├── ControlBar.tsx          # Action buttons (Scan, Describe, etc.)
│   │   ├── ConversationPanel.tsx   # Chat message display
│   │   └── OnboardingModal.tsx     # First-time intro experience
│   ├── hooks/
│   │   ├── useAIModels.ts          # AI model loading + inference
│   │   ├── useCamera.ts            # Camera access + frame capture
│   │   ├── useSpeech.ts            # Voice recognition + TTS
│   │   └── useSpatialAudio.ts      # 3D spatial audio engine
│   ├── services/
│   │   ├── conversationAI.ts       # Gemini API integration + fallback chain
│   │   └── depthProcessor.ts       # Depth estimation + spatial enrichment
│   ├── types/
│   │   └── index.ts                # Shared TypeScript types
│   └── utils/
│       ├── constants.ts            # App configuration
│       └── imageAnalysis.ts        # Color, brightness, histogram analysis
├── .env                            # Environment variables
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5.4 |
| **AI (Cloud)** | Google Gemini Vision API |
| **AI (Local)** | @xenova/transformers, face-api.js |
| **Voice** | Web Speech API (recognition + synthesis) |
| **Audio** | Web Audio API (spatial 3D) |
| **Icons** | Lucide React |
| **Backend** | Supabase (optional) |

---

## 🔒 Privacy & Accessibility

- **No data stored** — Camera frames are sent to Gemini for analysis and immediately discarded
- **Runs in browser** — No server needed, no installation required
- **ARIA labels** — All interactive elements are screen-reader accessible
- **Keyboard navigable** — Full keyboard support for all controls
- **Voice-first** — Designed to be used entirely without looking at the screen

---

## 📜 Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for accessibility**

*Powered by Google Gemini · React · Web Speech API*

</div>
