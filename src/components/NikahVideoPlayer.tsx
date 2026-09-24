import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, RefreshCw, Sparkles, Film, Check, ExternalLink } from 'lucide-react';
import { getMedia, saveMedia, removeMedia } from '../utils/indexedDbHelper';
import { Language } from '../types';
import { extractYoutubeId, buildYoutubeEmbedUrl } from '../utils/videoPresets';

interface NikahVideoPlayerProps {
  language: Language;
  defaultVideoUrl?: string;
  onVideoChange?: (url: string) => void;
}

const DEFAULT_NIKAH_VIDEO = 'https://www.youtube.com/watch?v=MINL6ki1lWU';

export const NikahVideoPlayer: React.FC<NikahVideoPlayerProps> = ({
  language,
  defaultVideoUrl,
  onVideoChange
}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(defaultVideoUrl || DEFAULT_NIKAH_VIDEO);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasCustomVideo, setHasCustomVideo] = useState<boolean>(Boolean(defaultVideoUrl && defaultVideoUrl !== DEFAULT_NIKAH_VIDEO));
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Send control commands to YouTube iframe API
  const postIframeCommand = (func: string, args: unknown[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (e) {
        console.warn('Could not post message to iframe:', e);
      }
    }
  };

  // Sync if prop changes
  useEffect(() => {
    if (defaultVideoUrl) {
      setVideoSrc(defaultVideoUrl);
    }
  }, [defaultVideoUrl]);

  // Check if current source is YouTube
  const youtubeId = videoSrc ? extractYoutubeId(videoSrc) : null;

  // Load persistently stored video from IndexedDB on initial mount
  useEffect(() => {
    let objectUrl: string | null = null;
    (async () => {
      try {
        const storedBlob = await getMedia('nikah_ceremony_video');
        if (storedBlob) {
          objectUrl = URL.createObjectURL(storedBlob);
          setVideoSrc(objectUrl);
          setHasCustomVideo(true);
          setVideoFileName('Nikah_Ceremony_Video.mp4');
        }
      } catch (err) {
        console.warn('Could not load cached nikah video:', err);
      }
    })();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  // Handle uploaded video file
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(
        language === 'ur'
          ? 'براہ کرم ویڈیو فائل منتخب کریں (MP4, WebM, etc)'
          : language === 'hi'
          ? 'कृपया कोई वीडियो फ़ाइल चुनें (MP4, WebM, आदि)'
          : 'Please select a valid video file (MP4, WebM, etc)'
      );
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setHasCustomVideo(true);
      setVideoFileName(file.name);
      setIsPlaying(true);
      if (onVideoChange) onVideoChange(url);

      // Persist in IndexedDB
      await saveMedia('nikah_ceremony_video', file);

      // Trigger video play
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.error('Failed to process video file:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Toggle Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else if (youtubeId) {
      if (isPlaying) {
        postIframeCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        postIframeCommand('playVideo');
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 1;
      }
    }

    if (youtubeId) {
      if (nextMuted) {
        postIframeCommand('mute');
      } else {
        postIframeCommand('unMute');
        postIframeCommand('setVolume', [100]);
        postIframeCommand('playVideo');
      }
    }
  };

  // Fullscreen
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  // Save YouTube / Direct Video URL
  const handleSaveUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;

    setVideoSrc(trimmed);
    setHasCustomVideo(true);
    setVideoFileName(trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed);
    setShowUrlInput(false);
    setInputUrl('');
    setIsPlaying(true);
    if (onVideoChange) onVideoChange(trimmed);
  };

  // Reset to default ceremony video
  const handleResetToDefault = async () => {
    setVideoSrc(DEFAULT_NIKAH_VIDEO);
    setHasCustomVideo(false);
    setVideoFileName('');
    setShowUrlInput(false);
    setInputUrl('');
    setIsPlaying(true);
    await removeMedia('nikah_ceremony_video');
    if (onVideoChange) onVideoChange(DEFAULT_NIKAH_VIDEO);
  };

  // 4 Nikaah Sacred Moments/Scenes
  const scenes = [
    {
      titleEn: 'Qubool Hai • ایجاب و قبول',
      descEn: 'The Sacred Vows of Consent & Eternal Love under Allah’s Grace',
      titleUr: 'ایجاب و قبول • قبول ہے',
      descUr: 'اللہ تعالیٰ کے حکم اور سنتِ نبوی پر دو روحوں کا راضی نامہ',
      titleHi: 'ईजाब-ओ-क़ुबूल • क़ुबूल है',
      descHi: 'अल्लाह की रज़ा और सुन्नत-ए-नबवी पर दो दिलों का पवित्र इक़रार'
    },
    {
      titleEn: 'Nikahnama Covenant • مہر و دستخط',
      descEn: 'The Blessed Signing of the Marriage Contract & Haq Mehr',
      titleUr: 'دستخطِ نکاح نامہ و مہر',
      descUr: 'حق مہر اور نکاح نامے کے باوقار دستخط کے یادگار لمحات',
      titleHi: 'निकाहनामा दस्तख़त व महर',
      descHi: 'हक़-महर और निकाहनामे पर दस्तख़त के मुबारक़ व पाकीज़ा लम्हे'
    },
    {
      titleEn: 'Duas of Barakah • دعائے خیر',
      descEn: 'Barakallahu Lakuma Wa Baraka Alaikuma Wa Jama’a Bainakuma Fee Khair',
      titleUr: 'دعائے خیر و برکت',
      descUr: 'بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
      titleHi: 'दुआ-ए-ख़ैर व बरकत',
      descHi: 'बारकल्लाहु लकुमा व बारक अलैकुमा व जमअ बयनकुमा फ़ी ख़ैर'
    },
    {
      titleEn: 'A Blessed Beginning • رخصتی و نیا آغاز',
      descEn: 'Walking hand-in-hand towards a lifetime of piety, joy, and peace',
      titleUr: 'بابرکت نئی شروعات',
      descUr: 'ایک دوسرے کا ہم سفر بن کر دائمی خوشیوں کے سفر کا آغاز',
      titleHi: 'मुबारक नई शुरुआत',
      descHi: 'एक दूसरे के हमसफ़र बनकर खुशहाल ज़िंदगी का बा-बरकत आग़ाज़'
    }
  ];

  // Cycle scenes every 4 seconds when in default animated mode
  useEffect(() => {
    if (videoSrc) return;
    const interval = setInterval(() => {
      setActiveSceneIdx((prev) => (prev + 1) % scenes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [videoSrc]);

  const currentScene = scenes[activeSceneIdx];

  return (
    <div className="w-full max-w-lg mx-auto my-4 flex flex-col items-center">
      
      {/* Top Action Bar: Upload Video / Link / Reset */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 px-1 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-emerald-950 truncate drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            {hasCustomVideo
              ? (videoFileName || 'Custom Nikah Video')
              : (language === 'ur'
                  ? 'خصوصی ویڈیو: تقریبِ نکاح'
                  : language === 'hi'
                  ? 'विशेष वीडियो: निकाह समारोह'
                  : 'Sacred Nikah Video')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white text-emerald-900 border border-white/80 shadow-xs flex items-center gap-1 font-semibold transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
            title="Upload Nikah Video from Device"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">
              {language === 'ur' ? 'ویڈیو لگائیں' : language === 'hi' ? 'वीडियो लगाएं' : 'Add Video'}
            </span>
          </button>

          {/* YouTube / Web Link Button */}
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="p-1 sm:px-2 sm:py-1 rounded-lg bg-white/70 hover:bg-white text-emerald-900 border border-white/80 shadow-xs flex items-center gap-1 font-semibold transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
            title="Paste YouTube / Web Link"
          >
            <Film className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Link</span>
          </button>

          {/* Reset button (if custom video loaded) */}
          {hasCustomVideo && (
            <button
              onClick={handleResetToDefault}
              className="p-1 rounded-lg bg-white/70 hover:bg-red-50 text-red-700 border border-red-200/80 shadow-xs transition-all cursor-pointer"
              title="Reset Video"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* URL Input Drawer */}
      {showUrlInput && (
        <div className="w-full mb-3 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-300 shadow-md flex flex-col sm:flex-row items-center gap-2 animate-fadeIn">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste YouTube or MP4 URL (e.g. https://youtu.be/...)"
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl()}
          />
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveUrl}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              {language === 'ur' ? 'محفوظ کریں' : language === 'hi' ? 'सेव करें' : 'Apply'}
            </button>
            <button
              onClick={() => setShowUrlInput(false)}
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs transition-all shrink-0 cursor-pointer"
            >
              {language === 'ur' ? 'منسوخ' : language === 'hi' ? 'रद्द' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* ULTRA-CLEAR CRYSTAL GLASS VIDEO BOX CONTAINER */}
      <div
        ref={containerRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_25px_rgba(16,185,129,0.1)] border transition-all ${
          isDragging
            ? 'border-emerald-500 ring-4 ring-emerald-300/70 scale-[1.01]'
            : 'border-white/40'
        } bg-white/5 group select-none`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(209, 250, 229, 0.03) 45%, rgba(16, 185, 129, 0.05) 100%)',
          boxShadow: '0 8px 24px 0 rgba(16, 185, 129, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 0 rgba(16, 185, 129, 0.1)'
        }}
      >
        {/* Glass Box Gloss Reflection Top Sheen */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none z-1" />

        {/* CASE 1: Video File (Local Upload or Direct MP4) */}
        {videoSrc && !youtubeId ? (
          <video
            ref={videoRef}
            src={videoSrc}
            preload="metadata"
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover relative z-0"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : videoSrc && youtubeId ? (
          /* CASE 2: YouTube Embed */
          <iframe
            ref={iframeRef}
            key={youtubeId}
            src={buildYoutubeEmbedUrl(youtubeId, 1, isMuted)}
            title="Nikah Ceremony Video"
            loading="lazy"
            className="w-full h-full border-0 relative z-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          /* CASE 3: Visual Presentation of Abdul Qadir & Fozia Khan Nikah Mubarak on Glass */
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-transparent flex flex-col items-center justify-center p-4 sm:p-6 text-center z-0">
            
            {/* Ambient Nikah Stage Glow (Translucent) */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.2)_0%,transparent_70%)]" />
              <div className="absolute -top-10 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
            </div>

            {/* Glowing Fairy Lights String */}
            <div className="absolute top-2 inset-x-0 flex justify-around pointer-events-none opacity-85">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              ))}
            </div>

            {/* Stage Islamic Arch Silhouette on Glass */}
            <div className="absolute inset-x-8 sm:inset-x-14 inset-y-4 border border-emerald-500/25 rounded-t-[100px] pointer-events-none flex flex-col items-center pt-2 bg-white/5">
              <div className="w-16 h-px bg-emerald-500/50 mb-1" />
              <span className="text-[10px] text-emerald-950 font-extrabold font-mono tracking-widest uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                ✦ Sacred Nikaah Ceremony ✦
              </span>
            </div>

            {/* Center Content: Couple Names with Royal Islamic Styling */}
            <div className="relative z-10 max-w-sm px-2 animate-fadeIn flex flex-col items-center">
              
              {/* Sacred Bismillah Icon / Rings */}
              <div className="w-10 h-10 mb-1.5 rounded-full bg-white/50 backdrop-blur-xs border border-white/60 shadow-xs flex items-center justify-center text-emerald-800">
                <span className="text-lg drop-shadow-sm">💍</span>
              </div>

              {/* Couple Names */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-800 tracking-wide drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                {language === 'ur'
                  ? 'عبد القادر و فوزیہ خان'
                  : language === 'hi'
                  ? 'अब्दुल क़ादिर संग फ़ौज़िया ख़ान'
                  : 'Abdul Qadir & Fozia Khan'}
              </h3>

              {/* Active Scene Highlight */}
              <div className="mt-1 px-3 py-1 rounded-full bg-white/40 backdrop-blur-xs border border-white/60 shadow-xs inline-block">
                <p className="text-xs sm:text-sm font-bold text-emerald-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  {language === 'ur'
                    ? currentScene.titleUr
                    : language === 'hi'
                    ? currentScene.titleHi
                    : currentScene.titleEn}
                </p>
              </div>

              {/* Scene Description / Dua */}
              <p className="text-[11px] sm:text-xs text-emerald-900 font-bold max-w-xs mt-1 leading-snug drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                {language === 'ur'
                  ? currentScene.descUr
                  : language === 'hi'
                  ? currentScene.descHi
                  : currentScene.descEn}
              </p>
            </div>

            {/* Bottom Scene Indicators (Dots) */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
              {scenes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSceneIdx(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSceneIdx === idx
                      ? 'w-6 bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'w-1.5 bg-emerald-800/40 hover:bg-emerald-800/70'
                  }`}
                  aria-label={`View scene ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Video Overlay Controls (When hover or active) */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-emerald-950 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            {videoSrc && !youtubeId && (
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-emerald-950 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFullscreen}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-emerald-950 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
              title="Fullscreen"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
