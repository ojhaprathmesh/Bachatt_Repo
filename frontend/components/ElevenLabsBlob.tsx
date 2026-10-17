import React, { useState, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Phone, PhoneOff, Loader2, Mic } from 'lucide-react';

interface ElevenLabsBlobProps {
  isProcessing?: boolean;
  onVoiceInput?: (transcript: string) => void;
  onDirectTrigger?: () => void;
}

export const ElevenLabsBlob: React.FC<ElevenLabsBlobProps> = ({
  isProcessing: parentProcessing = false,
  onVoiceInput,
  onDirectTrigger,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Initialize official ElevenLabs Conversational React Hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('[ElevenLabs ConvAI] Connected successfully to Agent');
      setConnecting(false);
    },
    onDisconnect: () => {
      console.log('[ElevenLabs ConvAI] Disconnected');
      setConnecting(false);
    },
    onMessage: (message: any) => {
      console.log('[ElevenLabs Message]', message);
      if (message?.message) {
        setActiveSpeechText(message.message);
        if (message.source === 'user' && onVoiceInput) {
          onVoiceInput(message.message);
        }
      }
    },
    onError: (error: any) => {
      console.error('[ElevenLabs ConvAI Error]', error);
      setConnecting(false);
    },
  });

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;
  const isProcessing = parentProcessing || connecting;

  // Fallback Web Speech Recognition for instant local transcription
  const startLocalSpeechCapture = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN'; // Robust default for Hinglish / Indian English

        rec.onstart = () => {
          setMicActive(true);
        };
        rec.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setMicActive(false);
          if (text && onVoiceInput) {
            onVoiceInput(text);
          }
        };
        rec.onerror = () => {
          setMicActive(false);
          // If speech recognizer failed, trigger fallback agent prompt
          onDirectTrigger?.();
        };
        rec.onend = () => {
          setMicActive(false);
        };
        recognitionRef.current = rec;
        rec.start();
        return;
      } catch (err) {
        console.warn('Local speech recognition init error:', err);
      }
    }

    // Direct trigger fallback
    onDirectTrigger?.();
  }, [onVoiceInput, onDirectTrigger]);

  // Main Call Button Handler
  const handleToggleCall = async () => {
    if (isConnected) {
      try {
        await conversation.endSession();
      } catch (e) {
        console.error('Error ending ElevenLabs session:', e);
      }
      return;
    }

    setConnecting(true);

    try {
      // 1. Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Fetch authenticated signed URL from backend
      const res = await fetch('http://localhost:8000/api/coach/elevenlabs/signed-url');
      const data = await res.json();

      if (data.signed_url) {
        // 3. Connect real-time WebSocket to ElevenLabs Agent
        await conversation.startSession({ signedUrl: data.signed_url });
        return;
      }
    } catch (e) {
      console.warn('ElevenLabs WebSocket direct connection fallback to local mic:', e);
    } finally {
      setConnecting(false);
    }

    // If WebSocket session couldn't connect, use direct speech capture + Level 3 Agent
    startLocalSpeechCapture();
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none relative">
      
      {/* Container for Sphere and overlapping bottom Phone Button */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Outer Audio Reactive Glow when Speaking / Listening */}
        <div
          className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
            isSpeaking
              ? 'bg-gradient-to-tr from-cyan-400/40 via-emerald-400/30 to-blue-500/40 scale-110 opacity-80'
              : isConnected || micActive
              ? 'bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-cyan-500/40 scale-105 opacity-70 animate-pulse'
              : 'bg-gradient-to-tr from-teal-500/20 via-cyan-500/20 to-blue-600/20 opacity-40'
          }`}
        />

        {/* ========================================================================= */}
        {/* ElevenLabs Authentic Textured Gradient Sphere */}
        {/* Matches user screenshot: Teal / Emerald / Sky-Blue silk grain */}
        {/* ========================================================================= */}
        <div
          onClick={handleToggleCall}
          className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full cursor-pointer transition-all duration-700 shadow-2xl overflow-hidden flex items-center justify-center ${
            isSpeaking
              ? 'scale-105 shadow-cyan-500/30 animate-pulse'
              : isConnected || micActive
              ? 'scale-102 shadow-emerald-500/40'
              : 'hover:scale-[1.02] shadow-slate-950/80'
          }`}
          style={{
            background: `
              radial-gradient(circle at 35% 25%, rgba(132, 204, 22, 0.75) 0%, rgba(16, 185, 129, 0.7) 25%, transparent 60%),
              radial-gradient(circle at 75% 45%, rgba(56, 189, 248, 0.9) 0%, rgba(14, 165, 233, 0.75) 40%, transparent 70%),
              radial-gradient(circle at 25% 70%, rgba(13, 148, 136, 0.85) 0%, rgba(6, 95, 70, 0.8) 50%, transparent 80%),
              radial-gradient(circle at 80% 85%, rgba(2, 132, 199, 0.9) 0%, rgba(3, 105, 161, 0.8) 55%, transparent 85%),
              linear-gradient(135deg, #10b981 0%, #0284c7 60%, #0369a1 100%)
            `,
          }}
        >
          {/* Subtle Grain / Noise Overlay for Authentic Silk Texture */}
          <div 
            className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Top-Left Specular Sheen for 3D Depth */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />

          {/* Dynamic Audio Waves when Speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-1.5 z-10">
              <span className="w-1.5 h-6 bg-white/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-14 bg-white rounded-full animate-bounce" />
              <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-6 bg-white/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          )}

          {/* Connected / Listening Pulsing Core */}
          {(isConnected || micActive) && !isSpeaking && (
            <div className="flex flex-col items-center justify-center z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-ping">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Bottom Call Button with White Cutout Ring (Exact Match to Reference) */}
        {/* ========================================================================= */}
        <div className="absolute -bottom-5 z-20">
          <div className="p-1 rounded-full bg-[#070b14] shadow-2xl">
            <button
              onClick={handleToggleCall}
              disabled={isProcessing}
              title={isConnected ? 'End live conversation' : 'Start live conversation with ElevenLabs'}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ${
                isConnected || micActive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : isProcessing
                  ? 'bg-slate-800 text-cyan-400'
                  : 'bg-black hover:bg-slate-900 text-white border border-slate-700/50 hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isConnected || micActive ? (
                <PhoneOff className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5 fill-current" />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Status Subtitle */}
      <div className="mt-8 text-center max-w-sm">
        <span className="text-xs font-semibold text-slate-300 block">
          {isConnected 
            ? '🟢 Live ElevenLabs Call Active: Speak naturally'
            : micActive
            ? '🎙️ Listening to your microphone...'
            : isSpeaking 
            ? '🔊 ElevenLabs Agent speaking...'
            : isProcessing 
            ? '⚡ Connecting to ElevenLabs Agent...'
            : 'Tap the phone button to start voice call'}
        </span>
        {activeSpeechText && (
          <p className="text-[11px] text-cyan-300/90 italic mt-1 line-clamp-1">
            "{activeSpeechText}"
          </p>
        )}
      </div>

    </div>
  );
};
