// ============================================================
// EchoSight — Conversational AI Service
// Tries multiple Gemini models with throttling to avoid 429s
// ============================================================

// Model fallback chain — each has SEPARATE rate limit quota
const GEMINI_MODELS = [
    'gemini-2.5-flash-lite',   // Best free tier: 15 RPM, 1000 RPD
    'gemini-2.5-flash',        // High quality: 10 RPM, 500 RPD
    'gemini-2.0-flash-lite',   // Separate quota fallback
];

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const API_TIMEOUT = 15000;
const MIN_REQUEST_INTERVAL = 3000; // Minimum 3s between API calls

const SYSTEM_PROMPT = `You are EchoSight, an AI visual companion for a blind or visually impaired person. You see through their camera in real time.

RULES:
- Be SPECIFIC and DETAILED. Name exact objects, colors, sizes, positions.
- Use spatial directions: "on your left", "directly ahead", "to your right".
- Estimate distances: "about 2 feet away", "across the room".
- Safety is #1: ALWAYS flag vehicles, stairs, edges, obstacles FIRST.
- Be warm and natural — like a trusted friend beside them.
- Say "I can see..." or "There's a..." — never "The image shows..."
- Read any visible text, signs, labels, screens out loud.
- Mention people's clothing, approximate age, what they're doing.
- Note lighting: bright, dim, shadowy.
- Be honest if something is unclear.
- Never mention technical terms (model, API, pixels, confidence).
- Keep responses concise but informative — 3-5 sentences for scan, 5-8 for describe.`;

const SCAN_PROMPT = `Quick scan of this camera frame. Name every visible object with position (left/center/right) and distance. Note people, text/signs, and hazards. 3-4 sentences.`;

const DESCRIBE_PROMPT = `Describe EVERYTHING in detail for a blind person:
1. Environment (indoor/outdoor, room type, lighting)
2. Every object with color, size, position, distance
3. People (count, clothing, what they're doing)
4. Any visible text, signs, labels, screens
5. Spatial layout (foreground vs background)
6. Safety hazards (obstacles, edges, vehicles)
Be thorough. 6-8 sentences.`;

interface GeminiPart {
    text?: string;
    inlineData?: { mimeType: string; data: string };
}

interface ChatHistoryMessage {
    role: 'user' | 'model';
    parts: GeminiPart[];
}

export class ConversationAI {
    private apiKey: string | null;
    private history: ChatHistoryMessage[] = [];
    private lastRequestTime = 0;

    constructor(apiKey?: string) {
        this.apiKey = apiKey && apiKey.length > 10 ? apiKey : null;
        if (!this.apiKey) {
            console.warn('⚠️ No valid Gemini API key provided. AI features will use fallback responses.');
        } else {
            console.log('✅ Gemini API key loaded. Models:', GEMINI_MODELS.join(', '));
        }
    }

    get hasApiKey(): boolean {
        return !!this.apiKey;
    }

    /** Convert data URL to base64 */
    private imageToBase64(dataUrl: string): { mimeType: string; data: string } {
        const [header, base64] = dataUrl.split(',');
        const mimeType = header.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        return { mimeType, data: base64 };
    }

    /** Throttle: wait if we called too recently */
    private async throttle(): Promise<void> {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        if (elapsed < MIN_REQUEST_INTERVAL) {
            await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
        }
        this.lastRequestTime = Date.now();
    }

    /** Try each model until one works */
    private async callGemini(contents: any[], maxTokens: number, temperature: number): Promise<string> {
        if (!this.apiKey) return '';

        await this.throttle();

        for (const model of GEMINI_MODELS) {
            const url = `${API_BASE}/${model}:generateContent?key=${this.apiKey}`;

            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents,
                        generationConfig: { maxOutputTokens: maxTokens, temperature },
                    }),
                });

                clearTimeout(timeout);

                if (response.status === 429) {
                    console.warn(`⚠️ ${model} rate limited (429). Trying next model...`);
                    continue; // Try next model
                }

                if (!response.ok) {
                    console.warn(`⚠️ ${model} returned ${response.status}`);
                    continue;
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    console.log(`✅ Response from ${model} (${text.length} chars)`);
                    return text;
                }

                console.warn(`⚠️ ${model} returned empty response`);
                continue;

            } catch (e: any) {
                if (e.name === 'AbortError') {
                    console.warn(`⏱️ ${model} timed out`);
                } else {
                    console.warn(`❌ ${model} error:`, e.message);
                }
                continue;
            }
        }

        // All models failed
        console.error('❌ All Gemini models failed');
        return '';
    }

    /** Quick scan */
    async quickScan(imageDataUrl: string): Promise<string> {
        if (!this.apiKey) return 'No API key set. Add VITE_GEMINI_API_KEY to your .env file.';

        const imageData = this.imageToBase64(imageDataUrl);
        const contents = [{
            role: 'user',
            parts: [
                { inlineData: imageData },
                { text: SCAN_PROMPT },
            ],
        }];

        const text = await this.callGemini(contents, 350, 0.4);

        if (text) {
            this.history.push(
                { role: 'user', parts: [{ text: 'Quick scan' }] },
                { role: 'model', parts: [{ text }] },
            );
            if (this.history.length > 20) this.history = this.history.slice(-20);
        }

        return text || 'All AI models are busy right now. Try again in a moment.';
    }

    /** Full describe */
    async describeScene(imageDataUrl: string): Promise<string> {
        if (!this.apiKey) return 'No API key set. Add VITE_GEMINI_API_KEY to your .env file.';

        const imageData = this.imageToBase64(imageDataUrl);
        const contents = [{
            role: 'user',
            parts: [
                { inlineData: imageData },
                { text: DESCRIBE_PROMPT },
            ],
        }];

        const text = await this.callGemini(contents, 700, 0.5);

        if (text) {
            this.history.push(
                { role: 'user', parts: [{ text: 'Detailed description' }] },
                { role: 'model', parts: [{ text }] },
            );
            if (this.history.length > 20) this.history = this.history.slice(-20);
        }

        return text || 'All AI models are busy. Please wait a few seconds and try again.';
    }

    /** Chat with optional image */
    async chat(userMessage: string, imageDataUrl?: string): Promise<string> {
        if (!this.apiKey) {
            return this.fallback(userMessage);
        }

        const parts: GeminiPart[] = [];
        if (imageDataUrl) {
            parts.push({ inlineData: this.imageToBase64(imageDataUrl) });
        }
        parts.push({ text: userMessage });

        // Send with conversation history for context
        this.history.push({ role: 'user', parts });
        if (this.history.length > 20) this.history = this.history.slice(-20);

        const text = await this.callGemini(this.history, 250, 0.7);

        if (text) {
            this.history.push({ role: 'model', parts: [{ text }] });
            return text;
        }

        // If API failed, give a useful fallback
        // Remove the failed user message from history
        this.history.pop();
        return this.fallback(userMessage);
    }

    /** Offline fallback */
    private fallback(msg: string): string {
        const l = msg.toLowerCase();
        if (/\b(hello|hi|hey)\b/.test(l)) return "Hey! I'm here and ready to help.";
        if (/\b(thank|thanks)\b/.test(l)) return "Happy to help!";
        if (/\b(help)\b/.test(l)) return "Say 'scan' for a quick look, 'describe' for details, or just ask me anything!";
        if (/\b(what|see|look|around)\b/.test(l)) return "Try saying 'scan' and I'll tell you what I see!";
        return "I'm listening! Say 'scan' or 'describe', or ask me anything about your surroundings.";
    }

    clearHistory() {
        this.history = [];
    }
}
