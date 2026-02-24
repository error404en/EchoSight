// ============================================================
// EchoSight — Intro / Onboarding Page
// Premium welcome with smooth fade-out transition
// ============================================================
import { useState } from 'react';
import { Camera, Mic, Eye, Shield, MessageCircle, Layers } from 'lucide-react';

interface OnboardingModalProps {
    onDismiss: () => void;
}

export function OnboardingModal({ onDismiss }: OnboardingModalProps) {
    const [leaving, setLeaving] = useState(false);

    const handleDismiss = () => {
        setLeaving(true);
        setTimeout(onDismiss, 500); // Wait for fade-out animation
    };

    return (
        <div className={`intro ${leaving ? 'intro--leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Welcome to EchoSight">
            {/* Animated background orbs */}
            <div className="intro__orb intro__orb--1" />
            <div className="intro__orb intro__orb--2" />
            <div className="intro__orb intro__orb--3" />

            <div className="intro__container">
                {/* Hero */}
                <div className="intro__hero">
                    <div className="intro__icon">
                        <Eye size={36} strokeWidth={1.5} />
                    </div>
                    <h1 className="intro__title">EchoSight</h1>
                    <p className="intro__tagline">Your AI-powered visual companion</p>
                    <p className="intro__desc">
                        I see the world for you. Just talk to me naturally and I'll describe
                        everything around you in real time.
                    </p>
                </div>

                {/* Tech badges */}
                <div className="intro__tech">
                    <span className="intro__badge">Gemini Vision AI</span>
                    <span className="intro__badge">DETR Detection</span>
                    <span className="intro__badge">Depth Mapping</span>
                    <span className="intro__badge">Spatial Audio</span>
                </div>

                {/* Features */}
                <div className="intro__features">
                    <div className="intro__feature">
                        <div className="intro__feature-icon"><Camera size={18} /></div>
                        <div>
                            <strong>Real-time Vision</strong>
                            <p>Point your camera — I analyze the scene with Google Gemini AI</p>
                        </div>
                    </div>

                    <div className="intro__feature">
                        <div className="intro__feature-icon"><MessageCircle size={18} /></div>
                        <div>
                            <strong>Talk Naturally</strong>
                            <p>"What's in front of me?" — "Is anyone here?" — "Is it safe?"</p>
                        </div>
                    </div>

                    <div className="intro__feature">
                        <div className="intro__feature-icon"><Mic size={18} /></div>
                        <div>
                            <strong>Fully Hands-free</strong>
                            <p>Voice in, voice out — no screen interaction needed</p>
                        </div>
                    </div>

                    <div className="intro__feature">
                        <div className="intro__feature-icon"><Layers size={18} /></div>
                        <div>
                            <strong>Depth Sensing</strong>
                            <p>Estimates distances and warns about nearby obstacles</p>
                        </div>
                    </div>

                    <div className="intro__feature">
                        <div className="intro__feature-icon"><Shield size={18} /></div>
                        <div>
                            <strong>Safety First</strong>
                            <p>Vehicles, stairs, and hazards flagged with 3D audio alerts</p>
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div className="intro__permissions">
                    <p>📷 Camera access &amp; 🎤 Microphone access required</p>
                </div>

                {/* CTA */}
                <button onClick={handleDismiss} className="intro__cta" autoFocus>
                    <Eye size={18} />
                    Start Seeing
                </button>

                <p className="intro__footer">
                    Built with ❤️ for accessibility &nbsp;·&nbsp; Powered by Gemini + DETR + Depth-Anything
                </p>
            </div>
        </div>
    );
}
