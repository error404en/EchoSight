// ============================================================
// EchoSight — Shared Type Definitions
// ============================================================

/** A single detected object with optional spatial information */
export interface DetectedObject {
    label: string;
    score: number;
    /** Bounding box: { xmin, ymin, xmax, ymax } normalized 0–1 */
    box: { xmin: number; ymin: number; xmax: number; ymax: number };
}

/** Object enriched with estimated depth / distance */
export interface SpatialObject extends DetectedObject {
    /** Estimated distance in meters */
    distance: number;
    /** Horizontal position: -1 (far left) to 1 (far right) */
    pan: number;
    /** Categorized direction for speech */
    direction: 'far left' | 'left' | 'center' | 'right' | 'far right';
}

/** Result from the depth estimation pipeline */
export interface DepthResult {
    /** Raw depth map as a Float32Array (H × W) */
    depthMap: Float32Array;
    width: number;
    height: number;
    /** Min / max depth values for normalization */
    minDepth: number;
    maxDepth: number;
}

/** Full scene description after analysis */
export interface SceneDescription {
    caption: string | null;
    objects: SpatialObject[];
    faceCount: number;
    brightness: string;
    dominantColor: string;
    nearestObject: SpatialObject | null;
    hasDangerousObjects: boolean;
    timestamp: number;
}

/** A conversation message */
export interface ChatMessage {
    role: 'ai' | 'user';
    text: string;
    timestamp: number;
}

/** Loading stage info for the progress UI */
export interface LoadingState {
    stage: string;
    progress: number;
    isReady: boolean;
}

/** Categories for safety classification */
export type ObjectCategory = 'vehicle' | 'furniture' | 'electronics' | 'person' | 'animal' | 'food' | 'other';

/** AI model status */
export interface ModelStatus {
    detector: boolean;
    captioner: boolean;
    depth: boolean;
    faceApi: boolean;
}
