// ============================================================
// EchoSight — CameraView Component
// ============================================================
import { RefObject } from 'react';
import { Eye, Loader2, Users } from 'lucide-react';

interface CameraViewProps {
    videoRef: RefObject<HTMLVideoElement>;
    canvasRef: RefObject<HTMLCanvasElement>;
    isReady: boolean;
    isStreaming: boolean;
    isProcessing: boolean;
    autoMode: boolean;
    depthEnabled: boolean;
    faceCount: number;
    lastHeard: string;
    isListening: boolean;
    loadingStage: string;
    loadingProgress: number;
}

export function CameraView({
    videoRef,
    canvasRef,
    isReady,
    isStreaming,
    isProcessing,
    autoMode,
    depthEnabled,
    faceCount,
    lastHeard,
    isListening,
    loadingStage,
    loadingProgress,
}: CameraViewProps) {
    return (
        <div className="es-camera" role="img" aria-label="Camera view">
            <canvas ref={canvasRef} className="es-camera__canvas" width={480} height={360} />
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`es-camera__video ${isStreaming ? '' : 'es-camera__video--off'}`}
            />

            {/* Loading overlay */}
            {!isReady && (
                <div className="es-camera__overlay es-camera__overlay--loading">
                    <div className="es-loading-indicator">
                        <Loader2 className="es-spin" size={32} />
                        <p className="es-loading-indicator__text">{loadingStage}</p>
                        <div className="es-progress-bar">
                            <div
                                className="es-progress-bar__fill"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <p className="es-loading-indicator__pct">{loadingProgress}%</p>
                    </div>
                </div>
            )}

            {/* Idle overlay */}
            {isReady && !isStreaming && (
                <div className="es-camera__overlay es-camera__overlay--idle">
                    <Eye size={40} className="es-camera__idle-icon" />
                    <p className="es-camera__idle-text">Tap Start to begin</p>
                </div>
            )}

            {/* Processing overlay */}
            {isProcessing && (
                <div className="es-camera__overlay es-camera__overlay--processing">
                    <div className="es-scan-line" />
                    <Loader2 className="es-spin" size={24} />
                </div>
            )}

            {/* Status badges */}
            <div className="es-camera__badges">
                {isStreaming && <span className="es-badge es-badge--live">● LIVE</span>}
                {autoMode && <span className="es-badge es-badge--auto">AUTO</span>}
                {depthEnabled && <span className="es-badge es-badge--depth">3D</span>}
                {faceCount > 0 && (
                    <span className="es-badge es-badge--face">
                        <Users size={12} /> {faceCount}
                    </span>
                )}
            </div>

            {/* Voice transcript */}
            {lastHeard && isListening && (
                <div className="es-camera__transcript" aria-live="polite">
                    🎤 {lastHeard}
                </div>
            )}
        </div>
    );
}
