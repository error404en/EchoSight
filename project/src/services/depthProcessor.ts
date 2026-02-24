// ============================================================
// EchoSight — Depth Processor Service
// Rich, natural scene descriptions with spatial awareness
// ============================================================
import type { DetectedObject, SpatialObject, DepthResult } from '../types';
import { DEPTH, SAFETY_LABELS, FURNITURE_LABELS, ELECTRONICS_LABELS, ANIMAL_LABELS } from '../utils/constants';

/**
 * Compute the horizontal direction label from a pan value.
 */
function panToDirection(pan: number): SpatialObject['direction'] {
    if (pan < -0.6) return 'far left';
    if (pan < -0.2) return 'left';
    if (pan > 0.6) return 'far right';
    if (pan > 0.2) return 'right';
    return 'center';
}

/**
 * Estimate the relative size of an object from its bounding box.
 */
function estimateSize(box: DetectedObject['box']): string {
    const area = (box.xmax - box.xmin) * (box.ymax - box.ymin);
    if (area > 0.25) return 'large';
    if (area > 0.08) return 'medium-sized';
    return 'small';
}

/**
 * Describe a distance in natural language.
 */
function describeDistance(meters: number): string {
    if (meters < 0.5) return 'very close, within arm\'s reach';
    if (meters < 1.0) return 'about a step away';
    if (meters < 2.0) return 'nearby, about ' + meters.toFixed(1) + ' meters';
    if (meters < 4.0) return 'a few meters away';
    return 'farther away';
}

/**
 * Sample depth at center of bounding box → approximate meters.
 */
function sampleDepthForBox(
    box: DetectedObject['box'],
    depthResult: DepthResult,
): number {
    const cx = Math.round(((box.xmin + box.xmax) / 2) * depthResult.width);
    const cy = Math.round(((box.ymin + box.ymax) / 2) * depthResult.height);
    const idx = cy * depthResult.width + cx;
    const rawDepth = depthResult.depthMap[idx] ?? depthResult.maxDepth;

    const range = depthResult.maxDepth - depthResult.minDepth || 1;
    const normalized = (rawDepth - depthResult.minDepth) / range;

    const distance = (1 - normalized) * DEPTH.scaleFactor + 0.3;
    return Math.round(distance * 10) / 10;
}

/**
 * Enrich detected objects with spatial information.
 */
export function enrichWithDepth(
    objects: DetectedObject[],
    depthResult: DepthResult | null,
): SpatialObject[] {
    return objects.map((obj) => {
        const centerX = (obj.box.xmin + obj.box.xmax) / 2;
        const pan = (centerX - 0.5) * 2;

        const distance = depthResult
            ? sampleDepthForBox(obj.box, depthResult)
            : 3.0;

        return {
            ...obj,
            distance,
            pan,
            direction: panToDirection(pan),
        };
    });
}

/**
 * Find the nearest object in the scene.
 */
export function findNearest(objects: SpatialObject[]): SpatialObject | null {
    if (objects.length === 0) return null;
    return objects.reduce((a, b) => (a.distance < b.distance ? a : b));
}

/**
 * Check if any dangerous objects are present.
 */
export function hasDangerousObjects(objects: SpatialObject[]): boolean {
    return objects.some((o) =>
        SAFETY_LABELS.includes(o.label.toLowerCase()),
    );
}

/**
 * Build a rich, natural-language scene description.
 * Groups objects by category, describes positions and distances,
 * and provides safety-relevant information first.
 */
export function buildSceneDescription(
    caption: string | null,
    objects: SpatialObject[],
    faceCount: number,
    brightness: string,
): string {
    const parts: string[] = [];

    // 1. Overall scene summary from captioner
    if (caption) {
        // Clean up caption — capitalize first letter, ensure period
        const cleaned = caption.charAt(0).toUpperCase() + caption.slice(1);
        parts.push(`Here's what I see: ${cleaned}.`);
    }

    // 2. Environment context
    const envParts: string[] = [];
    if (brightness === 'very bright') envParts.push('The area is very brightly lit');
    else if (brightness === 'well lit') envParts.push('The lighting is good');
    else if (brightness === 'moderate') envParts.push('The lighting is moderate');
    else if (brightness === 'dim') envParts.push('It\'s quite dim here');
    else if (brightness === 'dark') envParts.push('It\'s dark here, be careful');
    if (envParts.length > 0) parts.push(envParts[0] + '.');

    // 3. SAFETY FIRST — vehicles and hazards
    const vehicles = objects.filter((o) => SAFETY_LABELS.includes(o.label.toLowerCase()));
    if (vehicles.length > 0) {
        const vehicleDescs = vehicles.map((v) => {
            const size = estimateSize(v.box);
            const dist = describeDistance(v.distance);
            return `a ${size} ${v.label} to your ${v.direction}, ${dist}`;
        });
        parts.push(`⚠️ Heads up! I see ${vehicleDescs.join(', and ')}. Please be cautious.`);
    }

    // 4. People
    if (faceCount > 0) {
        if (faceCount === 1) {
            parts.push('There is one person in front of you.');
        } else if (faceCount <= 3) {
            parts.push(`I can see ${faceCount} people nearby.`);
        } else {
            parts.push(`There are several people around, I count about ${faceCount}.`);
        }
    }

    // 5. Categorized objects (excluding vehicles, already covered)
    const nonVehicles = objects.filter((o) => !SAFETY_LABELS.includes(o.label.toLowerCase()));

    // Count duplicates
    const objectCounts = new Map<string, { count: number; objects: SpatialObject[] }>();
    for (const obj of nonVehicles) {
        const key = obj.label.toLowerCase();
        if (!objectCounts.has(key)) {
            objectCounts.set(key, { count: 0, objects: [] });
        }
        const entry = objectCounts.get(key)!;
        entry.count++;
        entry.objects.push(obj);
    }

    // Group by category
    const furniture = [...objectCounts.entries()].filter(([k]) => FURNITURE_LABELS.includes(k));
    const electronics = [...objectCounts.entries()].filter(([k]) => ELECTRONICS_LABELS.includes(k));
    const animals = [...objectCounts.entries()].filter(([k]) => ANIMAL_LABELS.includes(k));
    const other = [...objectCounts.entries()].filter(
        ([k]) => !FURNITURE_LABELS.includes(k) && !ELECTRONICS_LABELS.includes(k) && !ANIMAL_LABELS.includes(k),
    );

    // Describe furniture
    if (furniture.length > 0) {
        const descs = furniture.map(([label, info]) => {
            const nearest = info.objects.reduce((a, b) => (a.distance < b.distance ? a : b));
            const countStr = info.count > 1 ? `${info.count} ${label}s` : `a ${label}`;
            return `${countStr} to your ${nearest.direction}`;
        });
        parts.push(`Furniture: ${descs.join(', ')}.`);
    }

    // Describe electronics
    if (electronics.length > 0) {
        const descs = electronics.map(([label, info]) => {
            const nearest = info.objects.reduce((a, b) => (a.distance < b.distance ? a : b));
            const countStr = info.count > 1 ? `${info.count} ${label}s` : `a ${label}`;
            return `${countStr} ${describeDistance(nearest.distance)}`;
        });
        parts.push(`I can see ${descs.join(', ')}.`);
    }

    // Describe animals
    if (animals.length > 0) {
        const descs = animals.map(([label, info]) => {
            const nearest = info.objects.reduce((a, b) => (a.distance < b.distance ? a : b));
            return info.count > 1 ? `${info.count} ${label}s` : `a ${label} to your ${nearest.direction}`;
        });
        parts.push(`There's ${descs.join(', ')}.`);
    }

    // Describe other objects
    if (other.length > 0) {
        const descs = other.slice(0, 4).map(([label, info]) => {
            const nearest = info.objects.reduce((a, b) => (a.distance < b.distance ? a : b));
            const countStr = info.count > 1 ? `${info.count} ${label}s` : `a ${label}`;
            return `${countStr} to your ${nearest.direction}`;
        });
        parts.push(`I also notice ${descs.join(', ')}.`);
    }

    // 6. Nearest object highlight
    if (nonVehicles.length > 0) {
        const nearest = nonVehicles.reduce((a, b) => (a.distance < b.distance ? a : b));
        parts.push(`The closest thing to you is a ${nearest.label}, ${describeDistance(nearest.distance)} on your ${nearest.direction}.`);
    }

    // 7. Safety summary
    if (vehicles.length === 0 && (brightness === 'well lit' || brightness === 'very bright' || brightness === 'moderate')) {
        parts.push('The path ahead seems clear and safe.');
    } else if (brightness === 'dark' || brightness === 'dim') {
        parts.push('Visibility is limited, so move carefully.');
    }

    // 8. Object count summary
    const totalObjects = objects.length;
    if (totalObjects > 5) {
        parts.push(`In total, I detected ${totalObjects} objects in the scene.`);
    }

    return parts.length > 0
        ? parts.join(' ')
        : "I can't identify much right now. Try moving the camera or improving the lighting.";
}
