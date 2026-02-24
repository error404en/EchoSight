// ============================================================
// EchoSight — Image Analysis Utilities
// ============================================================

/**
 * Analyze average brightness of a canvas image.
 * Samples every 16th pixel for speed.
 */
export function analyzeBrightness(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unknown';
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 64) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        count++;
    }
    const avg = sum / count;
    if (avg > 200) return 'very bright';
    if (avg > 140) return 'well lit';
    if (avg > 80) return 'moderate';
    if (avg > 40) return 'dim';
    return 'dark';
}

/**
 * Analyze dominant color of a canvas image.
 */
export function analyzeColor(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 64) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }
    r /= count;
    g /= count;
    b /= count;
    if (r > 180 && g > 180 && b > 180) return 'light tones';
    if (r < 60 && g < 60 && b < 60) return 'dark tones';
    if (r > g && r > b) return 'warm/reddish tones';
    if (g > r && g > b) return 'green/natural tones';
    if (b > r && b > g) return 'cool/blue tones';
    return 'mixed colors';
}

/**
 * Compute a simple grayscale histogram (16 bins) for a canvas.
 */
export function computeHistogram(canvas: HTMLCanvasElement): Float32Array {
    const ctx = canvas.getContext('2d');
    const bins = new Float32Array(16);
    if (!ctx) return bins;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let total = 0;
    for (let i = 0; i < data.length; i += 16) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const bin = Math.min(15, Math.floor(gray / 16));
        bins[bin]++;
        total++;
    }
    // Normalize
    if (total > 0) {
        for (let i = 0; i < 16; i++) bins[i] /= total;
    }
    return bins;
}

/**
 * Compare two histograms and return a difference score (0 = identical, 1 = completely different).
 */
export function compareHistograms(a: Float32Array, b: Float32Array): number {
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff += Math.abs(a[i] - b[i]);
    }
    return diff / 2; // Normalize to 0–1
}
