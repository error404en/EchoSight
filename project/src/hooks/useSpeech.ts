// ============================================================
// EchoSight — useSpeech Hook (Reliable voice commands)
// Fixed: no more dropped commands, faster response
// ============================================================
import { useRef, useState, useCallback, useEffect } from 'react';

/** Pick the best available voice */
function pickVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const preferred = voices.find(
        (v) =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('natural') ||
                v.name.toLowerCase().includes('enhanced') ||
                v.name.toLowerCase().includes('premium')),
    );
    if (preferred) return preferred;

    const english = voices.filter((v) => v.lang.startsWith('en'));
    const remote = english.find((v) => !v.localService);
    if (remote) return remote;
    return english[0] || voices[0];
}

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [lastHeard, setLastHeard] = useState('');

    const recognitionRef = useRef<any>(null);
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const lastCommandTimeRef = useRef(0);
    const isListeningRef = useRef(false);
    const commandCallbackRef = useRef<((cmd: string) => void) | null>(null);
    const speakingEndedAtRef = useRef(0);

    useEffect(() => {
        const loadVoices = () => { voiceRef.current = pickVoice(); };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    /** Check if we should ignore mic input right now */
    const shouldIgnoreInput = useCallback((): boolean => {
        if (window.speechSynthesis.speaking) return true;
        // 800ms cooldown after speech ends (catches echo)
        if (Date.now() - speakingEndedAtRef.current < 800) return true;
        return false;
    }, []);

    /** Speak text */
    const speak = useCallback(
        (text: string, onEnd?: () => void) => {
            if (!voiceEnabled) {
                onEnd?.();
                return;
            }

            window.speechSynthesis.cancel();
            setIsSpeaking(true);
            const u = new SpeechSynthesisUtterance(text);

            if (voiceRef.current) u.voice = voiceRef.current;
            u.rate = 1.0;
            u.pitch = 1.0;
            u.volume = 1.0;
            u.lang = 'en-US';

            u.onend = () => {
                setIsSpeaking(false);
                speakingEndedAtRef.current = Date.now();
                onEnd?.();
            };
            u.onerror = () => {
                setIsSpeaking(false);
                speakingEndedAtRef.current = Date.now();
                onEnd?.();
            };
            window.speechSynthesis.speak(u);
        },
        [voiceEnabled],
    );

    /** Start continuous speech recognition */
    const startListening = useCallback(
        (onCommand: (cmd: string) => void) => {
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SR) {
                console.warn('SpeechRecognition not supported');
                return;
            }

            commandCallbackRef.current = onCommand;

            // Don't restart if already listening
            if (recognitionRef.current && isListeningRef.current) {
                return;
            }

            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { }
            }

            const r = new SR();
            r.continuous = true;
            r.interimResults = false; // Only fire on final results — more reliable
            r.lang = 'en-US';
            r.maxAlternatives = 1;

            r.onresult = (e: any) => {
                const result = e.results[e.results.length - 1];
                if (!result.isFinal) return;

                const text = result[0].transcript.trim();
                if (text.length < 2) return;

                // Skip if TTS is active or in cooldown
                if (shouldIgnoreInput()) return;

                setLastHeard(text);

                // 1-second debounce between commands
                const now = Date.now();
                if (now - lastCommandTimeRef.current > 1000) {
                    lastCommandTimeRef.current = now;
                    console.log('🎤 Heard:', text);
                    commandCallbackRef.current?.(text);
                }
            };

            r.onend = () => {
                // Auto-restart if we should still be listening
                if (isListeningRef.current) {
                    setTimeout(() => {
                        try { r.start(); } catch { }
                    }, 200);
                }
            };

            r.onerror = (ev: any) => {
                if (ev.error === 'aborted') return; // Intentional stop
                const delay = ev.error === 'no-speech' ? 1000 : 300;
                if (isListeningRef.current) {
                    setTimeout(() => {
                        try { r.start(); } catch { }
                    }, delay);
                }
            };

            recognitionRef.current = r;
            try {
                r.start();
                setIsListening(true);
                isListeningRef.current = true;
                console.log('🎤 Listening started');
            } catch (e) {
                console.warn('Failed to start recognition:', e);
            }
        },
        [shouldIgnoreInput],
    );

    const stopListening = useCallback(() => {
        isListeningRef.current = false;
        setIsListening(false);
        try { recognitionRef.current?.abort(); } catch { }
        recognitionRef.current = null;
        // NOTE: Don't clear commandCallbackRef — allows restart via voice
    }, []);

    const toggleListening = useCallback(
        (onCommand: (cmd: string) => void) => {
            if (isListening) {
                stopListening();
            } else {
                startListening(onCommand);
            }
            return !isListening;
        },
        [isListening, startListening, stopListening],
    );

    const toggleVoice = useCallback(() => {
        setVoiceEnabled((v) => !v);
    }, []);

    return {
        isSpeaking, voiceEnabled, isListening, lastHeard,
        speak, startListening, stopListening, toggleListening, toggleVoice,
    };
}
