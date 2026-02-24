// ============================================================
// EchoSight — useAIModels Hook (Gemini Vision Only)
// No heavy local models. Gemini Vision handles all scene analysis.
// Only face-api loaded from CDN (~5MB, non-blocking).
// ============================================================
import { useState, useCallback } from 'react';
import { FACE_API } from '../utils/constants';
import type { DetectedObject, DepthResult } from '../types';

declare global {
    interface Window {
        faceapi: any;
    }
}

export function useAIModels() {
    const [loadingStage, setLoadingStage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [modelStatus, setModelStatus] = useState({
        detector: false,
        captioner: false,
        depth: false,
        faceApi: false,
    });

    /** Load face-api.js via CDN (small, non-blocking) */
    const loadFaceApi = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            if (window.faceapi) {
                setModelStatus((s) => ({ ...s, faceApi: true }));
                resolve();
                return;
            }
            const s = document.createElement('script');
            s.src = FACE_API.scriptUrl;
            s.onload = async () => {
                try {
                    await window.faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API.modelUrl);
                    setModelStatus((prev) => ({ ...prev, faceApi: true }));
                    console.log('✓ Face API ready');
                } catch { }
                resolve();
            };
            s.onerror = () => resolve();
            document.body.appendChild(s);
        });
    }, []);

    /** Instant startup — only face-api from CDN */
    const loadModels = useCallback(async (): Promise<boolean> => {
        setLoadingStage('Starting...');
        setLoadingProgress(50);
        loadFaceApi();
        setIsReady(true);
        setLoadingStage('');
        setLoadingProgress(100);
        return true;
    }, [loadFaceApi]);

    // Stubs — Gemini Vision handles these
    const detectObjects = useCallback(async (_u: string, _t?: number): Promise<DetectedObject[]> => [], []);
    const captionImage = useCallback(async (_u: string): Promise<string | null> => null, []);
    const estimateDepth = useCallback(async (_u: string): Promise<DepthResult | null> => null, []);

    /** Detect faces */
    const detectFaces = useCallback(async (video: HTMLVideoElement): Promise<number> => {
        if (!modelStatus.faceApi || !window.faceapi) return 0;
        try {
            const dets = await window.faceapi.detectAllFaces(
                video,
                new window.faceapi.TinyFaceDetectorOptions({
                    inputSize: FACE_API.inputSize,
                    scoreThreshold: FACE_API.scoreThreshold,
                }),
            );
            return dets.length;
        } catch {
            return 0;
        }
    }, [modelStatus.faceApi]);

    return {
        loadingStage, loadingProgress, isReady, modelStatus,
        loadModels, detectObjects, captionImage, estimateDepth, detectFaces,
    };
}
