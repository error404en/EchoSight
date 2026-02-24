// ============================================================
// EchoSight — Constants & Configuration
// ============================================================

export const APP_NAME = 'EchoSight';
export const APP_TAGLINE = 'Your AI-powered spatial awareness companion';

// ── Model configuration ──────────────────────────────────────
export const MODELS = {
    detector: {
        task: 'object-detection' as const,
        model: 'Xenova/detr-resnet-50',
        threshold: 0.7,
        describeThreshold: 0.5,
    },
    captioner: {
        task: 'image-to-text' as const,
        model: 'Xenova/vit-gpt2-image-captioning',
    },
    depth: {
        task: 'depth-estimation' as const,
        model: 'Xenova/depth-anything-small-hf',
    },
} as const;

export const FACE_API = {
    scriptUrl: 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
    modelUrl: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/',
    inputSize: 160,
    scoreThreshold: 0.5,
} as const;

// ── Camera / capture ─────────────────────────────────────────
export const CAPTURE = {
    width: 320,
    height: 240,
    jpegQuality: 0.6,
    facingMode: 'environment' as const,
} as const;

// ── Auto-scan ────────────────────────────────────────────────
export const AUTO_SCAN_INTERVAL_MS = 10_000;
export const SCENE_CHANGE_THRESHOLD = 0.15; // 15% histogram diff

// ── Depth estimation ─────────────────────────────────────────
export const DEPTH = {
    /** Objects closer than this (meters) trigger proximity alert */
    proximityAlertDistance: 1.5,
    /** Approximate scale factor to convert depth-anything relative depth → meters */
    scaleFactor: 5.0,
} as const;

// ── Spatial audio ────────────────────────────────────────────
export const AUDIO = {
    /** Min beep interval (ms) for very close objects */
    minBeepInterval: 100,
    /** Max beep interval (ms) for far objects */
    maxBeepInterval: 1000,
    /** Beep duration in ms */
    beepDuration: 80,
    /** Base frequency for proximity beep */
    baseFrequency: 440,
    /** Max frequency for very close objects */
    maxFrequency: 1200,
} as const;

// ── Object categories ────────────────────────────────────────
export const VEHICLE_LABELS = ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'train', 'airplane'];
export const FURNITURE_LABELS = ['chair', 'couch', 'table', 'desk', 'bed', 'bench', 'dining table'];
export const ELECTRONICS_LABELS = ['tv', 'laptop', 'cell phone', 'keyboard', 'monitor', 'mouse', 'remote'];
export const ANIMAL_LABELS = ['cat', 'dog', 'bird', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'];

export const SAFETY_LABELS = [...VEHICLE_LABELS];

// ── UI ───────────────────────────────────────────────────────
export const MAX_CONVERSATION_LENGTH = 20;
export const MAX_MEMORY_LENGTH = 8;

// ── Greetings ────────────────────────────────────────────────
export const GREETINGS = [
    "Hi! I'm EchoSight, your spatial awareness companion.",
    "Hello! EchoSight here. I can see the world for you.",
    "Hey! I'm EchoSight. Start the camera and I'll describe what's around you.",
];
