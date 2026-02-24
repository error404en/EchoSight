// ============================================================
// EchoSight — Main Application (Clean Gemini-only flow)
// ============================================================
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './index.css';

import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ControlBar } from './components/ControlBar';
import { ConversationPanel } from './components/ConversationPanel';
import { OnboardingModal } from './components/OnboardingModal';

import { useCamera } from './hooks/useCamera';
import { useAIModels } from './hooks/useAIModels';
import { useSpeech } from './hooks/useSpeech';
import { useSpatialAudio } from './hooks/useSpatialAudio';
import { ConversationAI } from './services/conversationAI';

import { analyzeBrightness, analyzeColor } from './utils/imageAnalysis';
import {
  AUTO_SCAN_INTERVAL_MS,
  MAX_CONVERSATION_LENGTH,
} from './utils/constants';
import type { ChatMessage } from './types';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

function App() {
  const { videoRef, canvasRef, isStreaming, startCamera, stopCamera, captureFrame } = useCamera();
  const { isReady, modelStatus, loadModels, detectFaces, loadingStage, loadingProgress } = useAIModels();
  const { isSpeaking, voiceEnabled, isListening, lastHeard, speak, startListening, stopListening, toggleListening, toggleVoice } = useSpeech();
  const { cleanup: cleanupAudio } = useSpatialAudio();

  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [depthEnabled, setDepthEnabled] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('echosight-onboarded'),
  );

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commandHandlerRef = useRef<(cmd: string) => void>(() => { });

  const chatAI = useMemo(() => new ConversationAI(GEMINI_KEY), []);

  // ── Helpers ──────────────────────────────────────────────
  const addMessage = useCallback(
    (role: 'ai' | 'user', text: string) => {
      const msg: ChatMessage = { role, text, timestamp: Date.now() };
      setConversation((prev) => [...prev.slice(-(MAX_CONVERSATION_LENGTH - 1)), msg]);
      if (role === 'ai') speak(text);
    },
    [speak],
  );

  // ── Load models on mount ──
  useEffect(() => {
    loadModels();
    return () => { stopCamera(); stopListening(); cleanupAudio(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Start camera + voice AFTER intro dismissed ──
  useEffect(() => {
    if (showOnboarding) return;
    if (isStreaming) return;

    startCamera().then((camOk) => {
      addMessage('ai', camOk ? "EchoSight ready. I'm listening." : 'Camera failed. Say "start" to retry.');
      if (camOk) {
        startListening((cmd: string) => commandHandlerRef.current(cmd));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnboarding]);

  // ── Auto-scan loop ──
  useEffect(() => {
    if (autoMode && isStreaming && isReady && !isProcessing) {
      autoRef.current = setInterval(() => {
        if (!isProcessing && !isSpeaking) geminiScan();
      }, AUTO_SCAN_INTERVAL_MS);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, isStreaming, isReady, isProcessing, isSpeaking]);

  // ── Core: Send frame + prompt to Gemini ──
  const geminiScan = useCallback(async () => {
    if (!isStreaming || isProcessing) return;
    setIsProcessing(true);
    try {
      const frame = captureFrame();
      if (!frame || !chatAI.hasApiKey) {
        addMessage('ai', 'No camera frame or API key.');
        return;
      }
      const result = await chatAI.quickScan(frame.url);
      addMessage('ai', result || 'Could not analyze the scene.');
    } catch {
      addMessage('ai', 'Scan failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [isStreaming, isProcessing, captureFrame, chatAI, addMessage]);

  const geminiDescribe = useCallback(async () => {
    if (!isStreaming || isProcessing) return;
    setIsProcessing(true);
    try {
      const frame = captureFrame();
      if (!frame || !chatAI.hasApiKey) {
        addMessage('ai', 'No camera frame or API key.');
        return;
      }
      const result = await chatAI.describeScene(frame.url);
      addMessage('ai', result || 'Could not describe the scene.');
    } catch {
      addMessage('ai', 'Description failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [isStreaming, isProcessing, captureFrame, chatAI, addMessage]);

  // ── Ask Gemini anything (with camera frame) ──
  const geminiChat = useCallback(async (userMessage: string) => {
    try {
      const frame = captureFrame();
      const result = await chatAI.chat(userMessage, frame?.url || undefined);
      addMessage('ai', result || "I couldn't process that. Try again?");
    } catch {
      addMessage('ai', "Something went wrong. Try again?");
    }
  }, [captureFrame, chatAI, addMessage]);

  // ── Check people via face-api ──
  const checkPeople = useCallback(async () => {
    if (!isStreaming) return;
    // Also ask Gemini for richer answer
    const frame = captureFrame();
    if (frame && chatAI.hasApiKey) {
      const result = await chatAI.chat('How many people can you see? Describe them briefly.', frame.url);
      if (result) { addMessage('ai', result); return; }
    }
    // Fallback to face-api
    const faces = videoRef.current ? await detectFaces(videoRef.current) : 0;
    setFaceCount(faces);
    if (faces === 0) addMessage('ai', "I don't see anyone.");
    else addMessage('ai', `I see ${faces} ${faces === 1 ? 'person' : 'people'}.`);
  }, [isStreaming, captureFrame, chatAI, detectFaces, addMessage, videoRef]);

  const checkColors = useCallback(() => {
    if (!isStreaming) return;
    const frame = captureFrame();
    if (frame && chatAI.hasApiKey) {
      chatAI.chat('What colors do you see in this scene? Be specific.', frame.url)
        .then(r => { if (r) addMessage('ai', r); });
      return;
    }
    if (frame) addMessage('ai', `The scene has ${analyzeColor(frame.canvas)}.`);
  }, [isStreaming, captureFrame, chatAI, addMessage]);

  const checkLighting = useCallback(() => {
    if (!isStreaming) return;
    const frame = captureFrame();
    if (frame && chatAI.hasApiKey) {
      chatAI.chat('Describe the lighting conditions in this scene.', frame.url)
        .then(r => { if (r) addMessage('ai', r); });
      return;
    }
    if (frame) addMessage('ai', `Lighting is ${analyzeBrightness(frame.canvas)}.`);
  }, [isStreaming, captureFrame, chatAI, addMessage]);

  // ── Camera controls ──
  const handleStartCamera = useCallback(async () => {
    const ok = await startCamera();
    addMessage('ai', ok ? 'Camera on.' : 'Camera failed.');
    if (ok && !isListening) startListening((cmd: string) => commandHandlerRef.current(cmd));
  }, [startCamera, isListening, startListening, addMessage]);

  const handleStopCamera = useCallback(() => {
    stopCamera();
    addMessage('ai', 'Camera off.');
  }, [stopCamera, addMessage]);

  const toggleCamera = useCallback(() => {
    if (isStreaming) handleStopCamera();
    else handleStartCamera();
  }, [isStreaming, handleStopCamera, handleStartCamera]);

  // ── THE COMMAND HANDLER ──
  // Only 8 exact commands handled locally.
  // EVERYTHING else → Gemini Vision (with camera frame).
  const handleCommand = async (cmd: string) => {
    addMessage('user', cmd);
    const lower = cmd.toLowerCase().trim();

    // Exact local commands
    if (lower === 'scan') { geminiScan(); return; }
    if (lower === 'describe') { geminiDescribe(); return; }
    if (lower === 'stop') { handleStopCamera(); return; }
    if (lower === 'start') { if (!isStreaming) handleStartCamera(); return; }
    if (lower === 'mute' || lower === 'stop listening') { stopListening(); return; }
    if (lower === 'unmute' || lower === 'start listening') {
      startListening((cmd: string) => commandHandlerRef.current(cmd));
      return;
    }
    if (lower === 'quiet' || lower === 'shut up') { window.speechSynthesis.cancel(); return; }
    if (lower === 'auto') {
      setAutoMode(v => !v);
      addMessage('ai', autoMode ? 'Auto-scan off.' : 'Auto-scan on.');
      return;
    }
    if (lower === 'help') {
      addMessage('ai', "Say 'scan', 'describe', 'stop', 'start', 'mute', 'unmute', or just ask me anything naturally!");
      return;
    }

    // EVERYTHING ELSE → Gemini with camera frame
    await geminiChat(cmd);
  };

  commandHandlerRef.current = handleCommand;

  // ── Onboarding ──
  const dismissOnboarding = useCallback(() => {
    localStorage.setItem('echosight-onboarded', 'true');
    setShowOnboarding(false);
  }, []);

  // ── Render ──
  return (
    <div className="es-app">
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}

      <main className="es-container" role="main">
        <Header
          isReady={isReady}
          isListening={isListening}
          isSpeaking={isSpeaking}
          voiceEnabled={voiceEnabled}
          autoMode={autoMode}
          loadingStage={loadingStage}
          onToggleVoice={toggleVoice}
          onToggleListening={() => toggleListening((cmd: string) => commandHandlerRef.current(cmd))}
          onToggleAutoMode={() => {
            setAutoMode((v) => !v);
            addMessage('ai', autoMode ? 'Auto off.' : 'Auto on.');
          }}
        />

        <CameraView
          videoRef={videoRef as any}
          canvasRef={canvasRef as any}
          isReady={isReady}
          isStreaming={isStreaming}
          isProcessing={isProcessing}
          autoMode={autoMode}
          depthEnabled={depthEnabled}
          faceCount={faceCount}
          lastHeard={lastHeard}
          isListening={isListening}
          loadingStage={loadingStage}
          loadingProgress={loadingProgress}
        />

        <ControlBar
          isReady={isReady}
          isStreaming={isStreaming}
          isProcessing={isProcessing}
          depthEnabled={depthEnabled}
          onToggleCamera={toggleCamera}
          onQuickScan={geminiScan}
          onDescribeScene={geminiDescribe}
          onCheckPeople={checkPeople}
          onCheckColors={checkColors}
          onCheckLighting={checkLighting}
          onToggleDepth={() => {
            setDepthEnabled((v) => !v);
            addMessage('ai', depthEnabled ? 'Depth off.' : 'Depth on.');
          }}
        />

        <ConversationPanel messages={conversation} isSpeaking={isSpeaking} />

        <footer className="es-footer" role="contentinfo">
          <p>💬 Just talk to me naturally — I understand everything</p>
          <div className="es-footer__commands">
            <span className="es-footer__cmd">what do you see?</span>
            <span className="es-footer__cmd">is anyone here?</span>
            <span className="es-footer__cmd">describe</span>
            <span className="es-footer__cmd">scan</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
