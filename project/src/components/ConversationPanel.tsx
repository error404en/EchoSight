// ============================================================
// EchoSight — ConversationPanel Component
// ============================================================
import { useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ConversationPanelProps {
    messages: ChatMessage[];
    isSpeaking: boolean;
}

export function ConversationPanel({ messages, isSpeaking }: ConversationPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length]);

    return (
        <div
            className="es-chat"
            ref={scrollRef}
            role="log"
            aria-label="Conversation"
            aria-live="polite"
        >
            {messages.length === 0 && (
                <p className="es-chat__empty">Say "help" or tap a button to begin...</p>
            )}

            {messages.map((m, i) => (
                <div
                    key={i}
                    className={`es-chat__msg ${m.role === 'user' ? 'es-chat__msg--user' : 'es-chat__msg--ai'}`}
                >
                    {m.role === 'ai' && (
                        <div className="es-chat__avatar">
                            <Brain size={14} />
                        </div>
                    )}
                    <p className="es-chat__bubble">{m.text}</p>
                </div>
            ))}

            {isSpeaking && (
                <div className="es-chat__speaking">
                    <span className="es-dot-pulse" />
                    <span>Speaking...</span>
                </div>
            )}
        </div>
    );
}
