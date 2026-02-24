// ============================================================
// EchoSight — Header Component
// ============================================================
import { Brain, Volume2, VolumeX, Mic, MicOff, Clock } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

interface HeaderProps {
    isReady: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    voiceEnabled: boolean;
    autoMode: boolean;
    loadingStage: string;
    onToggleVoice: () => void;
    onToggleListening: () => void;
    onToggleAutoMode: () => void;
}

export function Header({
    isReady,
    isListening,
    isSpeaking,
    voiceEnabled,
    autoMode,
    loadingStage,
    onToggleVoice,
    onToggleListening,
    onToggleAutoMode,
}: HeaderProps) {
    const statusText = !isReady
        ? `Loading ${loadingStage}...`
        : isSpeaking
            ? '🔊 Speaking...'
            : isListening
                ? '🎤 Listening'
                : '✓ Ready';

    return (
        <header className="es-header" role="banner">
            <div className="es-header__brand">
                <div className={`es-avatar ${isListening ? 'es-avatar--listening' : ''} ${isSpeaking ? 'es-avatar--speaking' : ''}`}>
                    <Brain className="es-avatar__icon" />
                    <div className="es-avatar__ring" />
                </div>
                <div>
                    <h1 className="es-header__title">{APP_NAME}</h1>
                    <p className="es-header__status" aria-live="polite">{statusText}</p>
                </div>
            </div>

            <nav className="es-header__controls" aria-label="Quick controls">
                <button
                    onClick={onToggleVoice}
                    className={`es-icon-btn ${voiceEnabled ? 'es-icon-btn--active-green' : ''}`}
                    aria-label={voiceEnabled ? 'Mute voice' : 'Enable voice'}
                    title={voiceEnabled ? 'Mute' : 'Unmute'}
                >
                    {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                <button
                    onClick={onToggleListening}
                    className={`es-icon-btn ${isListening ? 'es-icon-btn--active-green' : ''}`}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                    title={isListening ? 'Stop mic' : 'Start mic'}
                >
                    {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>

                <button
                    onClick={onToggleAutoMode}
                    className={`es-icon-btn ${autoMode ? 'es-icon-btn--active-amber' : ''}`}
                    aria-label={autoMode ? 'Disable auto-scan' : 'Enable auto-scan'}
                    title={autoMode ? 'Auto off' : 'Auto on'}
                >
                    <Clock size={16} />
                </button>
            </nav>
        </header>
    );
}
