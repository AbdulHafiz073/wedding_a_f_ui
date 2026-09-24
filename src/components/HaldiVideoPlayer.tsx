import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, RefreshCw, Sparkles, Film, Check, ExternalLink } from 'lucide-react';
import { getMedia, saveMedia, removeMedia } from '../utils/indexedDbHelper';
import { Language } from '../types';
import { extractYoutubeId, buildYoutubeEmbedUrl } from '../utils/videoPresets';

interface HaldiVideoPlayerProps {
  language: Language;
  defaultVideoUrl?: string;
  onVideoChange?: (url: string) => void;
}

const DEFAULT_HALDI_VIDEO = 'https://www.youtube.com/watch?v=5CgPPDnyxyk';

export const HaldiVideoPlayer: React.FC<HaldiVideoPlayerProps> = ({
  language,
  defaultVideoUrl,
  onVideoChange
}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(defaultVideoUrl || DEFAULT_HALDI_VIDEO);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasCustomVideo, setHasCustomVideo] = useState<boolean>(Boolean(defaultVideoUrl && defaultVideoUrl !== DEFAULT_HALDI_VIDEO));
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
        const storedBlob = await getMedia('haldi_ceremony_video');
        if (storedBlob) {
          objectUrl = URL.createObjectURL(storedBlob);
          setVideoSrc(objectUrl);
          setHasCustomVideo(true);
          setVideoFileName('Haldi_Ceremony_Video.mp4');
        }
      } catch (err) {
        console.warn('Could not load cached haldi video:', err);
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
      await saveMedia('haldi_ceremony_video', file);

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

  // Reset to default presentation
  const handleReset = async () => {
    await removeMedia('haldi_ceremony_video');
    setVideoSrc(defaultVideoUrl || DEFAULT_HALDI_VIDEO);
    setHasCustomVideo(false);
    setVideoFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onVideoChange) onVideoChange(DEFAULT_HALDI_VIDEO);
  };

  // Set custom URL (YouTube or MP4)
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setVideoSrc(inputUrl.trim());
    setHasCustomVideo(true);
    setVideoFileName(inputUrl.trim());
    setShowUrlInput(false);
    if (onVideoChange) onVideoChange(inputUrl.trim());
  };

  // Toggle Play / Pause
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
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Auto-cycle default presentation scenes if no custom video is playing
  useEffect(() => {
    if (hasCustomVideo || !isPlaying) return;
    const timer = setInterval(() => {
      setActiveSceneIdx((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, [hasCustomVideo, isPlaying]);

  const haldiMoments = [
    {
      titleEn: 'Abdul Qadir & Fozia Khan',
      titleUr: 'عبد القادر اور فوزیہ خان',
      titleHi: 'अब्दुल क़ादिर और फ़ोज़िया खान',
      subtitleEn: 'Haldi Ceremony & Royal Stage',
      subtitleUr: 'ہلدی کی تقریب اور شاہی اسٹیج',
      subtitleHi: 'हल्दी की रस्म व शाही दरबार',
      icon: '🌼'
    },
    {
      titleEn: 'Traditional Turmeric Paste',
      titleUr: 'روایتی ابٹن اور خالص ہلدی',
      titleHi: 'पारंपरिक उबटन व शुद्ध हल्दी',
      subtitleEn: 'Brass bowls, golden fragrance & marigold flowers',
      subtitleUr: 'پیتل کے برتن، گیندا پھول اور محبت بھری خوشبو',
      subtitleHi: 'पीतल के पात्र, गेंदे के फूल और महकती हल्दी',
      icon: '✨'
    },
    {
      titleEn: 'Loving Touch & Blessings',
      titleUr: 'ہلدی کا ابٹن اور دعائیں',
      titleHi: 'हल्दी का टीका व अपनों की दुआएं',
      subtitleEn: 'Joyful smiles as turmeric touches bride & groom cheeks',
      subtitleUr: 'دلہا اور دلہن کے چہروں پر سجتی سنہری مسکراہٹیں',
      subtitleHi: 'दूल्हा व दुल्हन के चेहरे पर खिली सुनहरी मुस्कान',
      icon: '💛'
    },
    {
      titleEn: 'Haldi Holi Celebration',
      titleUr: 'خوشیوں بھری ہلدی ہولی',
      titleHi: 'हंसी-खुशी से सजी हल्दी होली',
      subtitleEn: 'Family clapping, singing & celebrating eternal bond',
      subtitleUr: 'تالیاں، ترانے اور خاندان کے ساتھ خوشیوں کا جشن',
      subtitleHi: 'परिवार के साथ तालियां, खुशियां व मुबारकबाद',
      icon: '🎉'
    }
  ];

  return (
    <div className="w-full mt-3 mb-2.5">
      
      {/* Top Quick Action Bar: Video File Upload Prompter */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs shadow-xs">
            <Film className="w-3.5 h-3.5" />
          </span>
          <span className={`text-xs font-bold text-amber-950 ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
            {language === 'ur'
              ? 'ہلدی ویڈیو (Haldi Video):'
              : language === 'hi'
              ? 'हल्दी सेरेमनी वीडियो (Haldi Video):'
              : 'Haldi Ceremony Video:'}
          </span>
          {hasCustomVideo && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
              <Check className="w-3 h-3" />
              <span>{language === 'ur' ? 'ویڈیو منسلک ہے' : language === 'hi' ? 'वीडियो सक्रिय है' : 'Video Active'}</span>
            </span>
          )}
        </div>

        {/* Upload / Switch Button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Upload MP4 from your device"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {language === 'ur'
                ? 'ویڈیو لگائیں (Upload Video)'
                : language === 'hi'
                ? 'वीडियो चुनें / अपलोड करें'
                : 'Upload Video File'}
            </span>
          </button>

          {hasCustomVideo && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset video"
              className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold underline px-1 cursor-pointer"
          >
            {showUrlInput ? (language === 'hi' ? 'बंद करें' : 'Close') : 'URL'}
          </button>
        </div>
      </div>

      {/* Hidden File Input for video upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Expandable URL Input */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="mb-3 p-2 bg-amber-50 rounded-2xl border border-amber-300 flex gap-2">
          <input
            type="url"
            placeholder="https://... (MP4 or YouTube URL)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-amber-500 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
          >
            {language === 'hi' ? 'लागू करें' : 'Apply'}
          </button>
        </form>
      )}

      {/* Main Grand Haldi Video Stage (Translucent Frosted Glass Box) */}
      <div
        ref={containerRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_25px_rgba(217,119,6,0.1)] border transition-all ${
          isDragging
            ? 'border-amber-500 ring-4 ring-amber-300/70 scale-[1.01]'
            : 'border-white/40'
        } bg-white/5 group select-none`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(254, 243, 199, 0.02) 45%, rgba(251, 191, 36, 0.04) 100%)',
          boxShadow: '0 8px 24px 0 rgba(217, 119, 6, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 0 rgba(245, 158, 11, 0.1)'
        }}
      >
        {/* Glass Box Gloss Reflection Top Sheen */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none z-1" />

        {/* CASE 1: Video File (Local Upload or Direct MP4) */}
        {videoSrc && !youtubeId ? (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            loop
            preload="metadata"
            muted={isMuted}
            className="w-full h-full object-cover object-center relative z-0"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : videoSrc && youtubeId ? (
          /* CASE 2: YouTube Embed */
          <iframe
            ref={iframeRef}
            key={youtubeId}
            src={buildYoutubeEmbedUrl(youtubeId, 1, isMuted)}
            title="Haldi Ceremony Video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            className="w-full h-full border-0 pointer-events-auto relative z-0"
          />
        ) : (
          /* CASE 3: Visual Presentation of Abdul Qadir & Fozia Khan Haldi Video on Glass */
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-transparent flex flex-col items-center justify-center p-4 sm:p-6 text-center z-0">
            
            {/* Ambient Haldi Stage Glow (Translucent) */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.2)_0%,transparent_70%)]" />
              <div className="absolute -top-10 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(255,235,170,0.35)_0%,transparent_70%)]" />
            </div>

            {/* Glowing Fairy Lights String */}
            <div className="absolute top-2 inset-x-0 flex justify-around pointer-events-none opacity-85">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping"
                  style={{ animationDuration: `${2 + (i % 3) * 0.8}s` }}
                />
              ))}
            </div>

            {/* Stage Islamic Arch Silhouette on Glass */}
            <div className="absolute inset-x-8 sm:inset-x-14 inset-y-4 border border-amber-500/25 rounded-t-[100px] pointer-events-none flex flex-col items-center pt-2 bg-white/5">
              <div className="w-16 h-px bg-amber-500/50 mb-1" />
              <span className="text-[10px] text-amber-900 font-extrabold font-mono tracking-widest uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                ✦ Haldi Ceremony ✦
              </span>
            </div>

            {/* Content Display: Abdul Qadir & Fozia Khan Title & Haldi Moment */}
            <div className="relative z-10 max-w-md w-full flex flex-col items-center animate-fadeIn">
              
              {/* Haldi Ceremony Glass Emblem */}
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-0.5 shadow-[0_4px_16px_rgba(245,158,11,0.4)] flex items-center justify-center mb-2 animate-pulse">
                <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center text-2xl sm:text-3xl shadow-inner">
                  {haldiMoments[activeSceneIdx].icon}
                </div>
              </div>

              {/* Couple Names */}
              <h3 className="font-script text-2xl sm:text-4xl text-amber-950 font-extrabold drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)] leading-tight mb-0.5">
                Abdul Qadir &amp; Fozia Khan
              </h3>

              {/* Moment Title */}
              <p className={`text-xs sm:text-sm font-extrabold text-amber-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? haldiMoments[activeSceneIdx].titleUr
                  : language === 'hi'
                  ? haldiMoments[activeSceneIdx].titleHi
                  : haldiMoments[activeSceneIdx].titleEn}
              </p>

              {/* Moment Description */}
              <p className={`text-[10px] sm:text-xs text-amber-950/85 font-medium max-w-xs mt-0.5 leading-relaxed drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? haldiMoments[activeSceneIdx].subtitleUr
                  : language === 'hi'
                  ? haldiMoments[activeSceneIdx].subtitleHi
                  : haldiMoments[activeSceneIdx].subtitleEn}
              </p>

              {/* Quick Prompt Button to Load Uploaded Video */}
              <div className="mt-3 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs tracking-wide shadow-md border border-white/80 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ur'
                      ? 'چَیٹ میں اَپ لوڈ کی گئی ویڈیو یہاں لگائیں'
                      : language === 'hi'
                      ? 'चैट में अपलोड की गई वीडियो यहाँ लगाएं'
                      : 'Load Uploaded Haldi Video'}
                  </span>
                </button>
                <span className="text-[9px] text-amber-900 font-bold mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  {language === 'ur'
                    ? 'فائل منتخب کریں (Select MP4 file from your device)'
                    : language === 'hi'
                    ? 'अपनी डिवाइस से MP4 वीडियो चुनें'
                    : 'Click or drop your video file here'}
                </span>
              </div>
            </div>

            {/* Scene Indicators */}
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 z-10">
              {haldiMoments.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSceneIdx(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSceneIdx === idx ? 'w-6 bg-amber-600' : 'w-2 bg-amber-800/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Video Overlay Controls (for local MP4 video) */}
        {videoSrc && !youtubeId && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 pointer-events-none">
            
            {/* Top Bar with Video Title */}
            <div className="flex items-center justify-between pointer-events-auto">
              <span className="text-[11px] font-bold text-amber-300 truncate max-w-[200px] bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                {videoFileName || 'Abdul Qadir & Fozia Khan - Haldi Ceremony'}
              </span>
              <span className="text-[10px] text-white/80 bg-amber-600/80 px-2 py-0.5 rounded-full">
                HD 1080p
              </span>
            </div>

            {/* Center Play/Pause Large Trigger */}
            <div className="my-auto flex justify-center pointer-events-auto">
              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-amber-500/90 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between gap-2 pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="text-white hover:text-amber-400 transition-colors p-1 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-white hover:text-amber-400 transition-colors p-1 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[10px] text-white/70">
                  {isMuted ? (language === 'hi' ? 'म्यूट' : 'Muted') : (language === 'hi' ? 'आवाज़ चालू' : 'Sound On')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="text-white hover:text-amber-400 transition-colors p-1 cursor-pointer"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
