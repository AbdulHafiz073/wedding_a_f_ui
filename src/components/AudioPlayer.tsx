import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { weddingAudio } from '../utils/audioSynth';

interface AudioPlayerProps {
  initialPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ initialPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(initialPlay);

  useEffect(() => {
    if (initialPlay && !weddingAudio.getIsPlaying()) {
      weddingAudio.start();
      setIsPlaying(true);
    }
  }, [initialPlay]);

  const toggleMusic = () => {
    const active = weddingAudio.toggle();
    setIsPlaying(active);
  };

  return (
    <div className="relative group">
      <button
        id="audioBtn"
        onClick={toggleMusic}
        title={isPlaying ? 'Mute Music' : 'Play Celebration Music'}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md border ${
          isPlaying
            ? 'bg-white/90 text-[#1a3a4d] border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.35)]'
            : 'bg-white/80 text-gray-500 border-white/60 hover:text-[#1a3a4d]'
        } active:scale-95`}
        aria-label="Toggle background music"
      >
        {isPlaying ? (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-[#2c5f7c]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
          </div>
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* Floating sound waves indicator when playing */}
      {isPlaying && (
        <div className="hidden sm:flex items-center gap-0.5 absolute -bottom-4 left-1/2 -translate-x-1/2">
          <span className="w-0.5 h-2 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-0.5 h-3 bg-[#2c5f7c] rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-0.5 h-2 bg-[#d4af37] rounded-full animate-bounce" />
        </div>
      )}
    </div>
  );
};
