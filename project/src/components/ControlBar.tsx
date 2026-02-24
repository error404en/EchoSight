// ============================================================
// EchoSight — ControlBar Component
// ============================================================
import { Camera, Eye, Sparkles, Users, Palette, Sun, MapPin } from 'lucide-react';

interface ControlBarProps {
    isReady: boolean;
    isStreaming: boolean;
    isProcessing: boolean;
    depthEnabled: boolean;
    onToggleCamera: () => void;
    onQuickScan: () => void;
    onDescribeScene: () => void;
    onCheckPeople: () => void;
    onCheckColors: () => void;
    onCheckLighting: () => void;
    onToggleDepth: () => void;
}

export function ControlBar({
    isReady,
    isStreaming,
    isProcessing,
    depthEnabled,
    onToggleCamera,
    onQuickScan,
    onDescribeScene,
    onCheckPeople,
    onCheckColors,
    onCheckLighting,
    onToggleDepth,
}: ControlBarProps) {
    return (
        <div className="es-controls" role="toolbar" aria-label="Camera controls">
            {/* Camera toggle */}
            <button
                onClick={onToggleCamera}
                disabled={!isReady}
                className={`es-btn ${isStreaming ? 'es-btn--danger' : 'es-btn--success'}`}
                aria-label={isStreaming ? 'Stop camera' : 'Start camera'}
            >
                <Camera size={16} />
                <span>{isStreaming ? 'Stop' : 'Start'}</span>
            </button>

            {/* Analysis actions */}
            <button
                onClick={onQuickScan}
                disabled={!isStreaming || isProcessing}
                className="es-btn es-btn--primary"
                aria-label="Quick scan"
            >
                <Eye size={16} />
                <span>Scan</span>
            </button>

            <button
                onClick={onDescribeScene}
                disabled={!isStreaming || isProcessing}
                className="es-btn es-btn--accent"
                aria-label="Full scene description"
            >
                <Sparkles size={16} />
                <span>Describe</span>
            </button>

            <button
                onClick={onCheckPeople}
                disabled={!isStreaming || isProcessing}
                className="es-btn es-btn--indigo"
                aria-label="Check for people"
            >
                <Users size={16} />
                <span>People</span>
            </button>

            <button
                onClick={onCheckColors}
                disabled={!isStreaming}
                className="es-btn es-btn--pink"
                aria-label="Check colors"
            >
                <Palette size={16} />
                <span>Colors</span>
            </button>

            <button
                onClick={onCheckLighting}
                disabled={!isStreaming}
                className="es-btn es-btn--amber"
                aria-label="Check lighting"
            >
                <Sun size={16} />
                <span>Light</span>
            </button>

            <button
                onClick={onToggleDepth}
                disabled={!isStreaming}
                className={`es-btn ${depthEnabled ? 'es-btn--depth-active' : 'es-btn--depth'}`}
                aria-label={depthEnabled ? 'Disable depth sensing' : 'Enable depth sensing'}
            >
                <MapPin size={16} />
                <span>Depth</span>
            </button>
        </div>
    );
}
