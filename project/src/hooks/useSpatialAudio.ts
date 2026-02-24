// ============================================================
// EchoSight — useSpatialAudio Hook (3D Audio + Sonification)
// ============================================================
import { useRef, useCallback } from 'react';
import { AUDIO } from '../utils/constants';
import type { SpatialObject } from '../types';

export function useSpatialAudio() {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const beepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /** Lazily get / create AudioContext */
    const getCtx = useCallback((): AudioContext => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    /**
     * Play a short tone panned to a horizontal position.
     * @param pan  -1 (left) to 1 (right)
     * @param freq Frequency in Hz
     * @param dur  Duration in seconds
     * @param vol  Volume 0–1
     */
    const playTone = useCallback(
        (pan: number, freq: number, dur: number = 0.08, vol: number = 0.3) => {
            try {
                const ctx = getCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const panner = ctx.createStereoPanner();

                osc.type = 'sine';
                osc.frequency.value = freq;
                panner.pan.value = Math.max(-1, Math.min(1, pan));
                gain.gain.value = vol;

                // Fade out to avoid clicks
                gain.gain.setTargetAtTime(0, ctx.currentTime + dur * 0.7, dur * 0.1);

                osc.connect(panner);
                panner.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + dur);
            } catch { }
        },
        [getCtx],
    );

    /**
     * Play a directional cue for the closest object.
     * Low tone = far, high tone = close. Panned to the object's direction.
     */
    const playDirectionalCue = useCallback(
        (obj: SpatialObject) => {
            // Map distance (0m–5m) to frequency (1200Hz–400Hz)
            const maxDist = 5;
            const t = Math.min(obj.distance / maxDist, 1);
            const freq = AUDIO.maxFrequency - t * (AUDIO.maxFrequency - AUDIO.baseFrequency);
            const vol = 0.15 + (1 - t) * 0.25; // Louder when closer
            playTone(obj.pan, freq, 0.12, vol);
        },
        [playTone],
    );

    /**
     * Play a proximity beep: the closer the object, the faster the beeps.
     * Continues until stopped.
     */
    const startProximityBeep = useCallback(
        (distance: number) => {
            stopProximityBeep();
            const maxDist = 5;
            const t = Math.min(distance / maxDist, 1);
            const interval = AUDIO.minBeepInterval + t * (AUDIO.maxBeepInterval - AUDIO.minBeepInterval);
            const freq = AUDIO.maxFrequency - t * (AUDIO.maxFrequency - AUDIO.baseFrequency);
            beepIntervalRef.current = setInterval(() => {
                playTone(0, freq, AUDIO.beepDuration / 1000, 0.2);
            }, interval);
        },
        [playTone],
    );

    /** Stop any ongoing proximity beep */
    const stopProximityBeep = useCallback(() => {
        if (beepIntervalRef.current) {
            clearInterval(beepIntervalRef.current);
            beepIntervalRef.current = null;
        }
    }, []);

    /**
     * Play an urgent safety alert (e.g., vehicle detected nearby).
     * Double-beep pattern with high frequency.
     */
    const playAlert = useCallback(
        (pan: number = 0) => {
            playTone(pan, 900, 0.1, 0.5);
            setTimeout(() => playTone(pan, 1100, 0.1, 0.5), 150);
        },
        [playTone],
    );

    /** Clean up Audio resources */
    const cleanup = useCallback(() => {
        stopProximityBeep();
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    }, [stopProximityBeep]);

    return {
        playTone,
        playDirectionalCue,
        startProximityBeep,
        stopProximityBeep,
        playAlert,
        cleanup,
    };
}
