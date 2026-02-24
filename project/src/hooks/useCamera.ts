// ============================================================
// EchoSight — useCamera Hook
// ============================================================
import { useRef, useState, useCallback } from 'react';
import { CAPTURE } from '../utils/constants';

export function useCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    const startCamera = useCallback(async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: CAPTURE.facingMode,
                    width: { ideal: CAPTURE.width },
                    height: { ideal: CAPTURE.height },
                },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                return new Promise((resolve) => {
                    videoRef.current!.onloadedmetadata = () => {
                        videoRef.current!.play();
                        setIsStreaming(true);
                        resolve(true);
                    };
                });
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    }, []);

    const captureFrame = useCallback((): { url: string; canvas: HTMLCanvasElement } | null => {
        if (!videoRef.current?.srcObject) return null;
        const c = canvasRef.current || document.createElement('canvas');
        c.width = CAPTURE.width;
        c.height = CAPTURE.height;
        const ctx = c.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(videoRef.current, 0, 0, CAPTURE.width, CAPTURE.height);
        return { url: c.toDataURL('image/jpeg', CAPTURE.jpegQuality), canvas: c };
    }, []);

    return {
        videoRef,
        canvasRef,
        isStreaming,
        startCamera,
        stopCamera,
        captureFrame,
    };
}
