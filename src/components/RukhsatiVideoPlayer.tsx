import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, RefreshCw, Sparkles, Film, Check, ExternalLink } from 'lucide-react';
import { getMedia, saveMedia, removeMedia } from '../utils/indexedDbHelper';
import { Language } from '../types';
import { extractYoutubeId, buildYoutubeEmbedUrl } from '../utils/videoPresets';

interface RukhsatiVideoPlayerProps {
  language: Language;
  defaultVideoUrl?: string;
  onVideoChange?: (url: string) => void;
}

const DEFAULT_RUKHSATI_VIDEO = 'https://www.youtube.com/watch?v=Xxh-lsUBifk';

export const RukhsatiVideoPlayer: React.FC<RukhsatiVideoPlayerProps> = ({
  language,
  defaultVideoUrl,
  onVideoChange
}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(defaultVideoUrl || DEFAULT_RUKHSATI_VIDEO);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasCustomVideo, setHasCustomVideo] = useState<boolean>(Boolean(defaultVideoUrl && defaultVideoUrl !== DEFAULT_RUKHSATI_VIDEO));
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

  const youtubeId = videoSrc ? extractYoutubeId(videoSrc) : null;

  useEffect(() => {
    let objectUrl: string | null = null;
    (async () => {
      try {
        const storedBlob = await getMedia('rukhsati_ceremony_video');
        if (storedBlob) {
          objectUrl = URL.createObjectURL(storedBlob);
          setVideoSrc(objectUrl);
          setHasCustomVideo(true);
          setVideoFileName('Rukhsati_Ceremony_Video.mp4');
        }
      } catch (err) {
        console.warn('Could not load cached rukhsati video:', err);
      }
    })();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

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

      await saveMedia('rukhsati_ceremony_video', file);
    } catch (err) {
      console.error('Error saving rukhsati video:', err);
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

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setVideoSrc(inputUrl.trim());
    setHasCustomVideo(true);
    setVideoFileName('Online Stream');
    setShowUrlInput(false);
    setIsPlaying(true);
    if (onVideoChange) onVideoChange(inputUrl.trim());
  };

  const handleReset = async () => {
    try {
      await removeMedia('rukhsati_ceremony_video');
      setVideoSrc(defaultVideoUrl || DEFAULT_RUKHSATI_VIDEO);
      setHasCustomVideo(false);
      setVideoFileName('');
      setInputUrl('');
      if (onVideoChange) onVideoChange(DEFAULT_RUKHSATI_VIDEO);
    } catch (err) {
      console.error('Failed to reset rukhsati video:', err);
    }
  };

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const scenes = [
    {
      titleEn: 'Under the Shade of the Holy Quran',
      titleUr: 'سایۂ کلامِ الٰہی میں پروقار رخصتی',
      titleHi: 'पवित्र क़ुरआन के साए में भावुक विदाई',
      taglineEn: 'The bride departs under divine protection and barakah',
      taglineUr: 'قرآنِ پاک کے سائے میں دعاؤں اور رحمتوں کے سنگ رخصتی',
      taglineHi: 'दुआओं और बरकत के साथ नई ज़िंदगी की शुरुआत',
      icon: '📖'
    },
    {
      titleEn: 'Parents’ Heartfelt Duas & Tears of Joy',
      titleUr: 'والدین کی دعائیں اور محبت بھرے آنسو',
      titleHi: 'माता-पिता का स्नेह व नम आंखों से आशीर्वाद',
      taglineEn: 'Cherished memories and warm maternal embraces',
      taglineUr: 'ماں باپ کے گلے لگ کر محبت اور وفا کا پرخلوص الوداع',
      taglineHi: 'अपनों के गले लगकर प्यार और दुआओं का तोहफा',
      icon: '🤲'
    },
    {
      titleEn: 'Beginning of a Blessed Life Together',
      titleUr: 'ایک نئے خوبصورت اور پرمسرت سفر کا آغاز',
      titleHi: 'एक खूबसूरत और खुशहाल सफर की शुरुआत',
      taglineEn: 'Hand in hand into an eternity of love and mutual peace',
      taglineUr: 'محبت، الفت اور باہمی سکون کی نئی خوشگوار صبح',
      taglineHi: 'प्यार और विश्वास के साथ नई खुशियों का सवेरा',
      icon: '🕊️'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto my-3 select-none">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <span className={`text-xs font-bold uppercase tracking-wider text-pink-950 ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
            {language === 'ur' ? 'رخصتی ویڈیو پلئیر' : language === 'hi' ? 'रुखसती वीडियो' : 'Rukhsati Video Player'}
          </span>
          {hasCustomVideo && (
            <span className="text-[10px] bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded-full border border-pink-300 flex items-center gap-1">
              <Check className="w-3 h-3 text-pink-600" />
              {language === 'hi' ? 'सेव्ड' : 'Saved'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Upload MP4 from your device"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {language === 'ur'
                ? 'ویڈیو لگائیں'
                : language === 'hi'
                ? 'वीडियो अपलोड करें'
                : 'Upload Video'}
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
            className="text-[11px] text-pink-900 hover:text-pink-950 font-semibold underline px-1 cursor-pointer"
          >
            {showUrlInput ? (language === 'hi' ? 'बंद करें' : 'Close') : 'URL'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="mb-3 p-2 bg-pink-50 rounded-2xl border border-pink-300 flex gap-2">
          <input
            type="url"
            placeholder="https://... (MP4 or YouTube URL)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-pink-500 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-pink-700 text-white text-xs font-bold hover:bg-pink-800 cursor-pointer"
          >
            {language === 'hi' ? 'लागू करें' : 'Apply'}
          </button>
        </form>
      )}

      {/* Main Grand Rukhsati Video Stage */}
      <div
        ref={containerRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_25px_rgba(219,39,119,0.15)] border transition-all ${
          isDragging
            ? 'border-pink-500 ring-4 ring-pink-300/70 scale-[1.01]'
            : 'border-white/50'
        } bg-white/5 group select-none`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(253, 242, 248, 0.05) 45%, rgba(244, 114, 182, 0.08) 100%)',
          boxShadow: '0 8px 24px 0 rgba(219, 39, 119, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 0 rgba(219, 39, 119, 0.15)'
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none z-1" />

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
          <iframe
            ref={iframeRef}
            key={youtubeId}
            src={buildYoutubeEmbedUrl(youtubeId, 1, isMuted)}
            title="Rukhsati Ceremony Video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            className="w-full h-full border-0 pointer-events-auto relative z-0"
          />
        ) : (
          /* Visual Fallback Presentation of Rukhsati */
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-transparent flex flex-col items-center justify-center p-4 sm:p-6 text-center z-0">
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-pink-400/30 blur-2xl animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-400 to-amber-200 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(219,39,119,0.35)] mb-2 border border-white/60 animate-floatSlow">
                <span className="text-2xl sm:text-3xl">🕊️</span>
              </div>

              <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider text-pink-950 bg-pink-100/90 border border-pink-300/80 px-2.5 py-0.5 rounded-full mb-1.5 shadow-xs ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'سایۂ قرآن میں رخصتی' : language === 'hi' ? 'भावुक विदाई व दुआएं' : 'Emotional Rukhsati Ceremony'}
              </span>

              <h4 className={`text-base sm:text-lg font-extrabold text-pink-950 mb-0.5 leading-tight ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
                {language === 'ur'
                  ? scenes[activeSceneIdx].titleUr
                  : language === 'hi'
                  ? scenes[activeSceneIdx].titleHi
                  : scenes[activeSceneIdx].titleEn}
              </h4>

              <p className={`text-[11px] sm:text-xs text-pink-950/90 font-medium max-w-xs ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? scenes[activeSceneIdx].taglineUr
                  : language === 'hi'
                  ? scenes[activeSceneIdx].taglineHi
                  : scenes[activeSceneIdx].taglineEn}
              </p>

              {/* Scene Indicator Dots */}
              <div className="flex gap-1.5 mt-2.5">
                {scenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSceneIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeSceneIdx === i
                        ? 'bg-pink-600 w-5 shadow-xs'
                        : 'bg-pink-300/70 hover:bg-pink-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Overlay Play / Pause & Volume Controls */}
        {videoSrc && !youtubeId && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 z-10 pointer-events-none">
            <div className="flex justify-end pointer-events-auto">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors cursor-pointer"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition-colors shadow-md cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {videoFileName && (
                <span className="text-[11px] text-white/90 font-mono truncate max-w-[150px] bg-black/40 px-2 py-0.5 rounded-md">
                  {videoFileName}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
