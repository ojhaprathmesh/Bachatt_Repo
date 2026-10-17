import React from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface CoachOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

export const CoachOrb: React.FC<CoachOrbProps> = ({ isListening, isSpeaking, onClick }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div 
        onClick={onClick}
        className={`relative w-40 h-40 rounded-full cursor-pointer flex items-center justify-center transition-all duration-500 shadow-2xl ${
          isSpeaking 
            ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 animate-pulse scale-105 shadow-orange-500/50' 
            : isListening
            ? 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 animate-bounce shadow-blue-500/50'
            : 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 hover:scale-105 shadow-emerald-500/30'
        }`}
      >
        <div className="absolute inset-2 rounded-full bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          {isSpeaking ? (
            <Volume2 className="w-12 h-12 text-white animate-pulse" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-300">
        {isSpeaking ? 'Coach is speaking in Hindi...' : isListening ? 'Listening to you...' : 'Tap to Start 60-Sec Check-in'}
      </p>
    </div>
  );
};
