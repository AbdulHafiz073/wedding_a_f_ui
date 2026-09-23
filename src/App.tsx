import React, { useState, useEffect } from 'react';
import { DoorIntro } from './components/DoorIntro';
import { HeroVideoBackground } from './components/HeroVideoBackground';
import { AudioPlayer } from './components/AudioPlayer';
import { CountdownTimer } from './components/CountdownTimer';
import { HaldiCeremonySection } from './components/HaldiCeremonySection';
import { MehndiCeremonySection } from './components/MehndiCeremonySection';
import { BaraatCeremonySection } from './components/BaraatCeremonySection';
import { NikahCeremonySection } from './components/NikahCeremonySection';
import { RukhsatiCeremonySection } from './components/RukhsatiCeremonySection';
import { FamilySection } from './components/FamilySection';
import { RoseLeavesRain } from './components/RoseLeavesRain';
import { TimelineVenue } from './components/TimelineVenue';
import { RsvpForm } from './components/RsvpForm';
import { WaveDivider } from './components/WaveDivider';
import { defaultWeddingData, sampleGuestWishes } from './data/invitationData';
import { WeddingData, Language, GuestWish } from './types';
import { 
  subscribeToCloudWeddingData, 
  saveWeddingDataToCloud, 
  getCloudWeddingData 
} from './lib/firebase';
import { OwnerAdminPanel } from './components/OwnerAdminPanel';
// import { ScratchRevealCard } from './components/ScratchRevealCard';
import { CelestialRainCanvas } from './components/CelestialRainCanvas';
import { 
  Heart, 
  Share2, 
  DoorOpen, 
  Languages, 
  Sparkles, 
  Check, 
  Calendar, 
  Clock, 
  MapPin,
  ChevronDown
} from 'lucide-react';
import { ScratchRevealCard } from './components/ScratchReavealCard';

export default function App() {
  const [data, setData] = useState<WeddingData>(() => {
    const saved = localStorage.getItem('wedding_invitation_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically sync to requested date 2026-10-28 if old default was stored
        if (!parsed.weddingDate || parsed.weddingDate.startsWith('2026-08-29')) {
          parsed.weddingDate = defaultWeddingData.weddingDate;
          parsed.weddingTimeEn = defaultWeddingData.weddingTimeEn;
          parsed.weddingTimeUr = defaultWeddingData.weddingTimeUr;
          parsed.timelineEvents = defaultWeddingData.timelineEvents;
          parsed.preWeddingEvents = defaultWeddingData.preWeddingEvents;
        }
        // Automatically sync couple names to Abdul Qadir & Fozia Khan if old Bilal/Durefisha names were stored
        if (parsed.groomNameEn === 'Bilal Abbas' || parsed.groomNameEn === 'Bilal') {
          parsed.groomNameEn = defaultWeddingData.groomNameEn;
          parsed.groomNameUr = defaultWeddingData.groomNameUr;
        }
        if (parsed.brideNameEn === 'Durefisha' || parsed.brideNameEn === 'Durefishan') {
          parsed.brideNameEn = defaultWeddingData.brideNameEn;
          parsed.brideNameUr = defaultWeddingData.brideNameUr;
        }
        // Automatically revert Kisan Farmhouse if stored
        if (parsed.venueNameEn?.includes('Kisan') || parsed.mapDirectionsUrl?.includes('8kLTFfQ22pCQ9ky78') || parsed.mapEmbedUrl?.includes('28.9362984')) {
          parsed.venueNameEn = defaultWeddingData.venueNameEn;
          parsed.venueNameUr = defaultWeddingData.venueNameUr;
          parsed.venueNameHi = defaultWeddingData.venueNameHi;
          parsed.venueCityEn = defaultWeddingData.venueCityEn;
          parsed.venueCityUr = defaultWeddingData.venueCityUr;
          parsed.venueCityHi = defaultWeddingData.venueCityHi;
          parsed.venueAddressEn = defaultWeddingData.venueAddressEn;
          parsed.venueAddressUr = defaultWeddingData.venueAddressUr;
          parsed.venueAddressHi = defaultWeddingData.venueAddressHi;
          parsed.mapEmbedUrl = defaultWeddingData.mapEmbedUrl;
          parsed.mapDirectionsUrl = defaultWeddingData.mapDirectionsUrl;
          parsed.baraatLocationEn = defaultWeddingData.baraatLocationEn;
          parsed.baraatLocationUr = defaultWeddingData.baraatLocationUr;
          parsed.baraatLocationHi = defaultWeddingData.baraatLocationHi;
          parsed.nikahLocationEn = defaultWeddingData.nikahLocationEn;
          parsed.nikahLocationUr = defaultWeddingData.nikahLocationUr;
          parsed.nikahLocationHi = defaultWeddingData.nikahLocationHi;
          parsed.rukhsatiLocationEn = defaultWeddingData.rukhsatiLocationEn;
          parsed.rukhsatiLocationUr = defaultWeddingData.rukhsatiLocationUr;
          parsed.rukhsatiLocationHi = defaultWeddingData.rukhsatiLocationHi;
          parsed.timelineEvents = defaultWeddingData.timelineEvents;
        }
        // Sync timeline events
        if (!parsed.timelineEvents || parsed.timelineEvents.length < 6) {
          parsed.timelineEvents = defaultWeddingData.timelineEvents;
        }
        // Sync family sections and ensure member photos & badges exist
        if (!parsed.groomFamily || !parsed.groomFamily.members || !parsed.groomFamily.badgeImageUrl) {
          parsed.groomFamily = defaultWeddingData.groomFamily;
        } else {
          // If existing members don't have imageUrl, populate default photo URLs
          parsed.groomFamily.members = parsed.groomFamily.members.map((m: any, idx: number) => ({
            ...m,
            imageUrl: m.imageUrl || defaultWeddingData.groomFamily.members[idx]?.imageUrl
          }));
        }
        if (!parsed.brideFamily || !parsed.brideFamily.members || !parsed.brideFamily.badgeImageUrl) {
          parsed.brideFamily = defaultWeddingData.brideFamily;
        } else {
          // If existing members don't have imageUrl, populate default photo URLs
          parsed.brideFamily.members = parsed.brideFamily.members.map((m: any, idx: number) => ({
            ...m,
            imageUrl: m.imageUrl || defaultWeddingData.brideFamily.members[idx]?.imageUrl
          }));
        }
        // Sync videos
        if (!parsed.jannatVideoUrl || parsed.jannatVideoUrl.includes('flower.mp4') || parsed.jannatVideoUrl.includes('oblaki_2') || parsed.jannatVideoUrl.includes('MINL6ki1lWU')) {
          parsed.jannatVideoUrl = defaultWeddingData.jannatVideoUrl;
        }
        if (!parsed.haldiVideoUrl) parsed.haldiVideoUrl = defaultWeddingData.haldiVideoUrl;
        if (!parsed.mehndiVideoUrl) parsed.mehndiVideoUrl = defaultWeddingData.mehndiVideoUrl;
        if (!parsed.baraatVideoUrl) parsed.baraatVideoUrl = defaultWeddingData.baraatVideoUrl;
        if (!parsed.nikahVideoUrl) parsed.nikahVideoUrl = defaultWeddingData.nikahVideoUrl;
        if (!parsed.rukhsatiVideoUrl) parsed.rukhsatiVideoUrl = defaultWeddingData.rukhsatiVideoUrl;

        if (!parsed.groomImageUrl) parsed.groomImageUrl = defaultWeddingData.groomImageUrl;
        if (!parsed.brideImageUrl) parsed.brideImageUrl = defaultWeddingData.brideImageUrl;

        if (!parsed.welcomeMessageEn || !parsed.welcomeMessageEn.includes('infinite mercy')) {
          parsed.welcomeMessageEn = defaultWeddingData.welcomeMessageEn;
        }
        localStorage.setItem('wedding_invitation_data', JSON.stringify(parsed));
        return { ...defaultWeddingData, ...parsed };
      } catch {
        return defaultWeddingData;
      }
    }
    return defaultWeddingData;
  });

  const [language, setLanguage] = useState<Language>('en');
  const [doorOpened, setDoorOpened] = useState(false);
  const [showDoorIntro, setShowDoorIntro] = useState(true);
  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShowerActive, setIsShowerActive] = useState(false);

  // Detect secret Owner URL path (/admin, /admin/, /owner) or parameters (?admin=true, #admin)
  // Owner panel is completely hidden from normal guests and ONLY opens via URL path
  useEffect(() => {
    const checkAdminRoute = () => {
      try {
        const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
        const search = window.location.search.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(window.location.search);

        const isPathAdmin =
          pathname === '/admin' ||
          pathname.endsWith('/admin') ||
          pathname === '/owner' ||
          pathname.endsWith('/owner');

        const isParamAdmin =
          params.get('admin') === 'true' ||
          params.has('admin') ||
          params.get('owner') === 'true' ||
          params.has('owner') ||
          hash === '#admin' ||
          hash === '#owner';

        if (isPathAdmin || isParamAdmin) {
          setIsOwnerPanelOpen(true);
          setShowDoorIntro(false); // Direct access for owner
        }
      } catch {
        // safe fallback
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    // Emergency Owner shortcut for convenience: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsOwnerPanelOpen(true);
        setShowDoorIntro(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseOwnerPanel = () => {
    setIsOwnerPanelOpen(false);
    try {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.endsWith('/admin') || pathname.endsWith('/admin/') || pathname.endsWith('/owner') || pathname.endsWith('/owner/')) {
        window.history.replaceState({}, '', '/');
      } else if (window.location.search.includes('admin') || window.location.hash.includes('admin') || window.location.search.includes('owner') || window.location.hash.includes('owner')) {
        window.history.replaceState({}, '', window.location.pathname || '/');
      }
    } catch {
      // safe fallback
    }
  };

  const [wishes] = useState<GuestWish[]>(() => {
    return sampleGuestWishes.map((w, idx) => ({
      id: `initial-${idx}`,
      ...w
    }));
  });

  // Strict scroll lock: completely disable page scroll until Enter Celebration is clicked
  useEffect(() => {
    if (showDoorIntro) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    };
  }, [showDoorIntro]);

  // Dynamically update browser favicon so changes from Admin Panel / Cloud persist live
  useEffect(() => {
    const faviconHref = data.customFaviconUrl?.trim() || '/favicon.svg';
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (faviconHref.endsWith('.svg')) {
      link.type = 'image/svg+xml';
    } else if (faviconHref.endsWith('.png')) {
      link.type = 'image/png';
    } else if (faviconHref.endsWith('.ico')) {
      link.type = 'image/x-icon';
    }
    link.href = faviconHref;
  }, [data.customFaviconUrl]);

  // Real-time Cloud Synchronization with Firebase Firestore
  // When owner makes any changes (date, videos, photo, family members, etc.)
  // it syncs to Firestore so any guest opening the link sees the updated information!
  useEffect(() => {
    const unsubscribe = subscribeToCloudWeddingData(
      (cloudData) => {
        if (cloudData && Object.keys(cloudData).length > 0) {
          setData((prev) => {
            const merged = { ...defaultWeddingData, ...prev, ...cloudData };
            // Ensure cloud data also reverts Kisan Farmhouse if it was stored
            if (merged.venueNameEn?.includes('Kisan') || merged.mapDirectionsUrl?.includes('8kLTFfQ22pCQ9ky78') || merged.mapEmbedUrl?.includes('28.9362984')) {
              merged.venueNameEn = defaultWeddingData.venueNameEn;
              merged.venueNameUr = defaultWeddingData.venueNameUr;
              merged.venueNameHi = defaultWeddingData.venueNameHi;
              merged.venueCityEn = defaultWeddingData.venueCityEn;
              merged.venueCityUr = defaultWeddingData.venueCityUr;
              merged.venueCityHi = defaultWeddingData.venueCityHi;
              merged.venueAddressEn = defaultWeddingData.venueAddressEn;
              merged.venueAddressUr = defaultWeddingData.venueAddressUr;
              merged.venueAddressHi = defaultWeddingData.venueAddressHi;
              merged.mapEmbedUrl = defaultWeddingData.mapEmbedUrl;
              merged.mapDirectionsUrl = defaultWeddingData.mapDirectionsUrl;
              merged.baraatLocationEn = defaultWeddingData.baraatLocationEn;
              merged.baraatLocationUr = defaultWeddingData.baraatLocationUr;
              merged.baraatLocationHi = defaultWeddingData.baraatLocationHi;
              merged.nikahLocationEn = defaultWeddingData.nikahLocationEn;
              merged.nikahLocationUr = defaultWeddingData.nikahLocationUr;
              merged.nikahLocationHi = defaultWeddingData.nikahLocationHi;
              merged.rukhsatiLocationEn = defaultWeddingData.rukhsatiLocationEn;
              merged.rukhsatiLocationUr = defaultWeddingData.rukhsatiLocationUr;
              merged.rukhsatiLocationHi = defaultWeddingData.rukhsatiLocationHi;
              merged.timelineEvents = defaultWeddingData.timelineEvents;
              if (navigator.onLine) {
                saveWeddingDataToCloud(merged).catch(() => {});
              }
            }
            try {
              localStorage.setItem('wedding_invitation_data', JSON.stringify(merged));
            } catch {
              // ignore quota
            }
            return merged;
          });
        } else {
          // If Firestore document doesn't exist yet and online, seed initial data to cloud
          if (navigator.onLine) {
            saveWeddingDataToCloud(data).catch(() => {});
          }
        }
      },
      (error) => {
        // When connection is temporarily unavailable or device is offline,
        // gracefully rely on local storage / cached state without triggering failed write attempts
        console.warn('Operating in offline/cached mode for wedding invitation data:', error?.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleDoorOpened = () => {
    setDoorOpened(true);
    setShowDoorIntro(false);
    document.body.style.overflow = 'auto';
  };

  const handleReopenDoor = () => {
    setShowDoorIntro(true);
    setDoorOpened(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    const msg =
      newLang === 'ur'
        ? 'زبان اردو میں تبدیل ہو گئی'
        : newLang === 'hi'
        ? 'भाषा हिन्दी में बदली गई'
        : 'Switched to English';
    showToast(msg);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${data.groomNameEn} & ${data.brideNameEn} Wedding Invitation`,
      text: `You are cordially invited to celebrate the Nikah of ${data.groomNameEn} & ${data.brideNameEn}!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(
        language === 'ur'
          ? 'دعوت کا لنک کاپی ہو گیا!'
          : language === 'hi'
          ? 'निमंत्रण लिंक कॉपी हो गया!'
          : 'Invitation link copied to clipboard!'
      );
    } catch {
      showToast('Could not copy link');
    }
  };

  const handleSaveCustomData = async (updated: WeddingData) => {
    setData(updated);
    try {
      localStorage.setItem('wedding_invitation_data', JSON.stringify(updated));
    } catch {
      // ignore
    }

    try {
      await saveWeddingDataToCloud(updated);
      showToast(
        language === 'ur'
          ? 'کلاؤڈ میں محفوظ ہو گیا! اب لنک شیئر کرنے پر ہر شخص یہی دیکھے گا۔'
          : language === 'hi'
          ? 'क्लाउड में सेव हो गया! अब लिंक शेयर करने पर सभी को यही दिखेगा।'
          : 'Saved to Cloud! Shared link will show your changes.'
      );
    } catch (err) {
      console.warn('Failed to sync to cloud:', err);
      showToast(
        language === 'ur'
          ? 'مقامی طور پر محفوظ ہو گیا'
          : language === 'hi'
          ? 'लोकल मेमोरी में सुरक्षित हो गया'
          : 'Saved locally'
      );
    }
  };

  // Format display date for scratch and gallery
  const dateObj = new Date(data.weddingDate);
  const formattedDateEn = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'October 28, 2026';

  const urduMonths = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
  ];
  const urduDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const toUrduDigits = (num: number) =>
    num.toString().split('').map(d => urduDigits[parseInt(d, 10)] ?? d).join('');

  const formattedDateUr = !isNaN(dateObj.getTime())
    ? `${toUrduDigits(dateObj.getDate())} ${urduMonths[dateObj.getMonth()]} ${toUrduDigits(dateObj.getFullYear())}`
    : '۲۸ اکتوبر ۲۰۲۶';

  const dayNameEn = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', { weekday: 'long' })
    : 'Wednesday';

  const dayNameUr = !isNaN(dateObj.getTime())
    ? urduDays[dateObj.getDay()]
    : 'بدھ';

  // Hindi Date and Day formatters
  const hindiMonths = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];
  const hindiDays = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

  const formattedDateHi = !isNaN(dateObj.getTime())
    ? `${dateObj.getDate()} ${hindiMonths[dateObj.getMonth()]} ${dateObj.getFullYear()}`
    : '28 अक्टूबर 2026';

  const dayNameHi = !isNaN(dateObj.getTime())
    ? hindiDays[dateObj.getDay()]
    : 'बुधवार';

  const groomDisplayName =
    language === 'ur'
      ? data.groomNameUr
      : language === 'hi'
      ? (data.groomNameHi || data.groomNameEn)
      : data.groomNameEn;

  const brideDisplayName =
    language === 'ur'
      ? data.brideNameUr
      : language === 'hi'
      ? (data.brideNameHi || data.brideNameEn)
      : data.brideNameEn;

  return (
    <div className={`min-h-screen bg-[#f5f0e8] text-[#3d3d3d] relative overflow-x-hidden ${showDoorIntro ? 'h-screen max-h-screen overflow-hidden' : ''} ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-body'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1a3a4d] text-white text-xs font-display tracking-wider shadow-xl flex items-center gap-2 border border-[#d4af37]/40 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-[#f4e4a6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3D Door Opening Experience */}
      {showDoorIntro && (
        <DoorIntro
          isOpen={doorOpened}
          onDoorOpened={handleDoorOpened}
          groomName={groomDisplayName}
          brideName={brideDisplayName}
          groomNameUr={data.groomNameUr}
          brideNameUr={data.brideNameUr}
          groomNameHi={data.groomNameHi}
          brideNameHi={data.brideNameHi}
          groomImageUrl={data.groomImageUrl}
          brideImageUrl={data.brideImageUrl}
          language={language}
          jannatVideoUrl={data.jannatVideoUrl}
          coupleImageUrl={data.coupleImageUrl}
          coupleImages={data.coupleImages}
        />
      )}

      {/* Floating Top Header Controls (Music & Share only - Admin is 100% hidden) */}
      <header className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <AudioPlayer initialPlay={doorOpened} />
        
        <button
          onClick={handleShare}
          title="Share Invitation"
          className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#1a3a4d] backdrop-blur-md flex items-center justify-center shadow-md border border-white/60 transition-all active:scale-95 cursor-pointer"
          aria-label="Share invitation"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </header>

      {/* Bottom Floating Navigation (Trilingual Switcher & Reopen Door) */}
      <aside className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        {/* Trilingual 3-Pill Switcher */}
        <div className="flex items-center p-1 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#d4af37]/50">
          <Languages className="w-3.5 h-3.5 text-[#2c5f7c] ml-2 mr-1 shrink-0" />
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#1a3a4d] text-[#ffeaa7] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('ur')}
              className={`px-2.5 py-1 rounded-full text-xs font-urdu font-semibold transition-all cursor-pointer ${
                language === 'ur'
                  ? 'bg-[#1a3a4d] text-[#ffeaa7] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-2.5 py-1 rounded-full text-xs font-hindi font-semibold transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-[#1a3a4d] text-[#ffeaa7] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Replay door opening */}
        <button
          onClick={handleReopenDoor}
          title="Re-experience Door Opening"
          className="px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-[#1a3a4d] backdrop-blur-md shadow-md border border-white/60 text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <DoorOpen className="w-3.5 h-3.5 text-[#2c5f7c]" />
          <span className="hidden sm:inline font-display text-xs">
            {language === 'ur' ? 'دروازہ' : language === 'hi' ? 'दरवाज़ा' : 'Replay Door'}
          </span>
        </button>
      </aside>

      {/* Main Wedding Invitation Page */}
      <main id="main-content" className="relative z-10">

        {/* SECTION 1: CUTE & LUMINOUS HERO SECTION WITH FLOATING PASTEL LANTERNS */}
        <section
          id="hero"
          className="min-h-screen w-full relative flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 overflow-hidden"
        >
          {/* Luminous Morning / Sunrise Pastel Sky with Floating Lanterns & Fairy Lights */}
          <HeroVideoBackground videoUrl={data.jannatVideoUrl} language={language} />

          {/* Optional Petal Rain overlay when user clicks "Shower Petals 🌸" */}
          {isShowerActive && (
            <div className="absolute inset-0 pointer-events-none z-30 animate-fadeIn">
              <RoseLeavesRain count={40} interactive={false} />
            </div>
          )}

          <div className="relative z-10 max-w-2xl w-full mx-auto flex flex-col items-center px-2 sm:px-4">
            {/* Ultra Cute, Luminous Glassmorphic Royal Card (Light & Glowing Palette) */}
            <div className="w-full px-5 py-8 sm:px-10 sm:py-10 rounded-[32px] sm:rounded-[40px] bg-white/80 sm:bg-white/84 backdrop-blur-md border-2 border-rose-200/80 shadow-[0_25px_60px_rgba(244,114,182,0.18),0_0_35px_rgba(251,191,36,0.2)] flex flex-col items-center relative overflow-hidden transition-all">
              
              {/* Cute top floral garland flourish with pastel accent */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs text-rose-400">🌸</span>
                <span className="text-[10px] text-amber-500">✦</span>
                <div className="w-16 sm:w-28 h-0.5 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
                <span className="text-[10px] text-amber-500">✦</span>
                <span className="text-xs text-rose-400">🌸</span>
              </div>

              {/* Sacred Bismillah Calligraphy in Luminous Royal Gold-Burgundy */}
              <p className="font-arabic text-xl sm:text-2xl text-[#831843] mb-1.5 font-bold leading-relaxed drop-shadow-xs">
                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>

              {/* Cute Animated Interlocking Rings & Beating Heart */}
              <div className="flex items-center justify-center gap-2.5 my-1.5">
                <span className="text-2xl select-none animate-bounce" style={{ animationDuration: '2.4s' }}>
                  💍
                </span>
                <div className="relative flex items-center justify-center">
                  <Heart className="w-9 h-9 text-[#e11d48] fill-[#fb7185] animate-heartbeat drop-shadow-[0_0_14px_rgba(244,63,94,0.5)]" />
                  <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1.5 -right-1.5 animate-spin" style={{ animationDuration: '3.5s' }} />
                </div>
                <span className="text-2xl select-none animate-bounce" style={{ animationDuration: '2.4s', animationDelay: '0.4s' }}>
                  💍
                </span>
              </div>

              {/* Cute Subtitle with Blush-Rose Script */}
              <p className={`text-xl sm:text-3xl text-[#be185d] font-semibold my-1 drop-shadow-xs tracking-wide ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-script'}`}>
                {language === 'ur' ? 'ہماری شادی کا بابرکت دن' : language === 'hi' ? 'हमारी शादी का मुबारक़ दिन' : "We're getting married"}
              </p>

              {/* Grand Couple Names in Vibrant Royal Berry & Warm Gold (High-contrast, Crisp & Exquisite) */}
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#831843] via-[#b91c1c] to-[#9a3412] leading-tight drop-shadow-[0_2px_10px_rgba(244,114,182,0.25)] tracking-wide my-1">
                {groomDisplayName}
                
                {/* Cute weds pill with blooming pink roses */}
                <div className="flex items-center justify-center gap-2 my-2 sm:my-3">
                  <div className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#fb7185]" />
                  <span className="px-3.5 py-1 rounded-full bg-rose-50/95 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold tracking-wider font-script uppercase shadow-xs flex items-center gap-1.5">
                    <span>🌸</span>
                    <span>{language === 'ur' ? 'سنگ' : language === 'hi' ? 'संग' : 'weds'}</span>
                    <span>🌸</span>
                  </span>
                  <div className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#fb7185]" />
                </div>

                {brideDisplayName}
              </h1>

              {/* Cute Date, Time & Venue Info Badges in Light Pastel Tones */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50/90 border border-rose-200/90 text-xs font-bold text-[#831843] shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>
                    {language === 'ur'
                      ? formattedDateUr
                      : language === 'hi'
                      ? formattedDateHi
                      : formattedDateEn}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/90 text-xs font-bold text-[#92400e] shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {language === 'ur'
                      ? data.weddingTimeUr
                      : language === 'hi'
                      ? (data.weddingTimeHi || data.weddingTimeEn)
                      : data.weddingTimeEn}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-50/90 border border-pink-200/90 text-xs font-bold text-[#9d174d] shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span>
                    {language === 'ur'
                      ? data.venueNameUr
                      : language === 'hi'
                      ? (data.venueNameHi || data.venueNameEn)
                      : data.venueNameEn}
                  </span>
                </div>
              </div>

              {/* Cute Interactive Action Buttons: Shower Petals & Send Love */}
              <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setIsShowerActive(true);
                    setTimeout(() => setIsShowerActive(false), 3500);
                    showToast(
                      language === 'ur'
                        ? 'گلاب کی پتیاں برسا دی گئیں! 🌸'
                        : language === 'hi'
                        ? 'गुलाब की पंखुड़ियाँ बरसाई गईं! 🌸'
                        : 'Rose petals showered! 🌸'
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-rose-800 text-xs font-bold border border-rose-300 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">🌸</span>
                  <span>{language === 'ur' ? 'پھول برسائیں' : language === 'hi' ? 'फूल बरसाएं' : 'Shower Petals'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(
                      language === 'ur'
                        ? 'نیک تمنائیں اور دعائیں بھیج دی گئیں! 💖'
                        : language === 'hi'
                        ? 'दुआएं व प्यार भेजा गया! 💖'
                        : 'Love & blessings sent! 💖'
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-900 text-xs font-bold border border-amber-300 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">💖</span>
                  <span>{language === 'ur' ? 'دعا و محبت' : language === 'hi' ? 'दुआ व प्यार' : 'Send Love'}</span>
                </button>
              </div>

              {/* Bottom luxury rose flourish */}
              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-[#fb7185] to-transparent mt-6" />
            </div>
          </div>

          {/* Cute Light Scroll Down Indicator */}
          <a
            href="#welcome"
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center px-4 py-1.5 rounded-full bg-white/85 hover:bg-white text-[#831843] border border-rose-200/80 shadow-md transition-all drop-shadow-xs z-30 active:scale-95 cursor-pointer"
          >
            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-0.5 ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
              {language === 'ur' ? 'نیچے دیکھیں' : language === 'hi' ? 'नीचे देखें' : 'Scroll Down'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-rose-600" />
          </a>

          {/* Organic Wave Divider transitioning into Welcome Section */}
          <WaveDivider position="bottom" fillColor="#f7f2ea" variant="wave1" />
        </section>

        {/* SECTION 2: WELCOME & BISMILLAH */}
        <section
          id="welcome"
          className="min-h-screen w-full relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #f7f2ea 0%, #edf5f8 50%, #f5eee5 100%)'
          }}
        >
          {/* Rose Petals & Rose Leaves Rain Animation across this whole section */}
          <RoseLeavesRain count={65} interactive={true} />

          {/* Ambient soft romantic rose and golden radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 35%, rgba(255, 235, 240, 0.5) 0%, rgba(255, 248, 235, 0.35) 45%, transparent 75%)'
            }}
          />

          <div className="bg-white/85 backdrop-blur-md rounded-3xl p-7 sm:p-10 max-w-md w-full text-center shadow-[0_20px_50px_rgba(44,95,124,0.1),0_0_25px_rgba(212,175,55,0.18)] border border-white/80 relative z-10">
            {/* Top gold arch accent */}
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6" />

            {/* Arabic Bismillah Calligraphy */}
            <p className="font-arabic text-2xl sm:text-3xl text-[#1a3a4d] mb-3 leading-relaxed drop-shadow-sm font-semibold">
              {data.bismillahArabic}
            </p>

            {/* Transliteration */}
            <p className="font-display italic text-sm sm:text-base text-[#2c5f7c] mb-5 tracking-wide">
              {data.welcomeTranslit}
            </p>

            {/* Divider with heart */}
            <div className="w-24 h-[1px] bg-[#d4af37] mx-auto relative my-5">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#faf7f2] px-2 text-[#d4af37] text-xs">
                ♥
              </span>
            </div>

            {/* Welcome Blessing Message */}
            <p className={`text-sm sm:text-base leading-relaxed text-[#3d3d3d] font-light ${language === 'hi' ? 'font-hindi' : ''}`}>
              {language === 'ur' ? data.welcomeMessageUr : language === 'hi' ? (data.welcomeMessageHi || data.welcomeMessageEn) : data.welcomeMessageEn}
            </p>

            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-display tracking-wider text-[#b89125] uppercase font-semibold">
              <span>{groomDisplayName}</span>
              <span>✦</span>
              <span>{brideDisplayName}</span>
            </div>
          </div>

          {/* Organic Wave Divider transitioning directly into Countdown Timer */}
          <WaveDivider position="bottom" fillColor="#f5f0e8" variant="wave1" />
        </section>

        {/* SECTION 3: LIVE COUNTDOWN TIMER */}
        <section
          id="countdown"
          className="min-h-[85vh] w-full relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #f5f0e8 0%, #e8f4f8 100%)'
          }}
        >
          <CountdownTimer
            language={language}
            targetDateIso={data.weddingDate}
            groomName={groomDisplayName}
            brideName={brideDisplayName}
            venueName={language === 'ur' ? data.venueNameUr : language === 'hi' ? (data.venueNameHi || data.venueNameEn) : data.venueNameEn}
            venueCity={language === 'ur' ? data.venueCityUr : language === 'hi' ? (data.venueCityHi || data.venueCityEn) : data.venueCityEn}
          />

          {/* Organic Wave Divider transitioning into Scratch Reveal */}
          <WaveDivider position="bottom" fillColor="#e8f4f8" variant="wave2" />
        </section>

        {/* SECTION 4: ROYAL SCRATCH REVEAL CARD & AUSPICIOUS MUHURAT */}
        <section
          id="scratch-reveal"
          className="w-full relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, #ffffff 0%, #f0fdf4 30%, #e0f2fe 65%, #fef3c7 100%)'
          }}
        >
          {/* Islamic Celestial Star & Crescent Moon Rain Background Canvas */}
          <CelestialRainCanvas />

          <div className="relative z-10 w-full flex flex-col items-center justify-center">
            <ScratchRevealCard
              language={language}
              data={data}
              groomName={groomDisplayName}
              brideName={brideDisplayName}
              weddingDateStr={language === 'ur' ? formattedDateUr : formattedDateEn}
            />
          </div>

          {/* Organic Wave Divider transitioning into Haldi Ceremony */}
          <WaveDivider position="bottom" fillColor="#fffef0" variant="wave1" />
        </section>

        {/* 1. DEDICATED HALDI CEREMONY & HALDI HOLI CELEBRATION */}
        <HaldiCeremonySection
          language={language}
          videoUrl={data.haldiVideoUrl}
          locationEn={data.haldiLocationEn}
          locationUr={data.haldiLocationUr}
          locationHi={data.haldiLocationHi}
          addressEn={data.haldiAddressEn}
          addressUr={data.haldiAddressUr}
          addressHi={data.haldiAddressHi}
          dateEn={data.haldiDateEn}
          dateUr={data.haldiDateUr}
          dateHi={data.haldiDateHi}
          timeEn={data.haldiTimeEn}
          timeUr={data.haldiTimeUr}
          timeHi={data.haldiTimeHi}
          mapUrl={data.haldiMapUrl}
          onVideoChange={(url) => handleSaveCustomData({ ...data, haldiVideoUrl: url })}
        />

        {/* 2. DEDICATED MEHNDI CEREMONY (JASHN-E-HINA) */}
        <MehndiCeremonySection
          language={language}
          videoUrl={data.mehndiVideoUrl}
          locationEn={data.mehndiLocationEn}
          locationUr={data.mehndiLocationUr}
          locationHi={data.mehndiLocationHi}
          addressEn={data.mehndiAddressEn}
          addressUr={data.mehndiAddressUr}
          addressHi={data.mehndiAddressHi}
          dateEn={data.mehndiDateEn}
          dateUr={data.mehndiDateUr}
          dateHi={data.mehndiDateHi}
          timeEn={data.mehndiTimeEn}
          timeUr={data.mehndiTimeUr}
          timeHi={data.mehndiTimeHi}
          mapUrl={data.mehndiMapUrl}
          onVideoChange={(url) => handleSaveCustomData({ ...data, mehndiVideoUrl: url })}
        />

        {/* 3. DEDICATED ROYAL BARAAT PROCESSION & DEPARTURE */}
        <BaraatCeremonySection
          language={language}
          videoUrl={data.baraatVideoUrl}
          locationEn={data.baraatLocationEn}
          locationUr={data.baraatLocationUr}
          locationHi={data.baraatLocationHi}
          addressEn={data.baraatAddressEn}
          addressUr={data.baraatAddressUr}
          addressHi={data.baraatAddressHi}
          dateEn={data.baraatDateEn}
          dateUr={data.baraatDateUr}
          dateHi={data.baraatDateHi}
          timeEn={data.baraatTimeEn}
          timeUr={data.baraatTimeUr}
          timeHi={data.baraatTimeHi}
          mapUrl={data.baraatMapUrl}
          onVideoChange={(url) => handleSaveCustomData({ ...data, baraatVideoUrl: url })}
        />

        {/* 4. DEDICATED SACRED NIKAAH CEREMONY (CRYSTAL GLASS BOX & NOOR RAIN) */}
        <NikahCeremonySection
          language={language}
          videoUrl={data.nikahVideoUrl}
          locationEn={data.nikahLocationEn}
          locationUr={data.nikahLocationUr}
          locationHi={data.nikahLocationHi}
          addressEn={data.nikahAddressEn}
          addressUr={data.nikahAddressUr}
          addressHi={data.nikahAddressHi}
          dateEn={data.nikahDateEn}
          dateUr={data.nikahDateUr}
          dateHi={data.nikahDateHi}
          timeEn={data.nikahTimeEn}
          timeUr={data.nikahTimeUr}
          timeHi={data.nikahTimeHi}
          mapUrl={data.nikahMapUrl}
          onVideoChange={(url) => handleSaveCustomData({ ...data, nikahVideoUrl: url })}
        />

        {/* 5. DEDICATED EMOTIONAL RUKHSATI CEREMONY (SAYE-E-QURAN) */}
        <RukhsatiCeremonySection
          language={language}
          videoUrl={data.rukhsatiVideoUrl}
          locationEn={data.rukhsatiLocationEn}
          locationUr={data.rukhsatiLocationUr}
          locationHi={data.rukhsatiLocationHi}
          addressEn={data.rukhsatiAddressEn}
          addressUr={data.rukhsatiAddressUr}
          addressHi={data.rukhsatiAddressHi}
          dateEn={data.rukhsatiDateEn}
          dateUr={data.rukhsatiDateUr}
          dateHi={data.rukhsatiDateHi}
          timeEn={data.rukhsatiTimeEn}
          timeUr={data.rukhsatiTimeUr}
          timeHi={data.rukhsatiTimeHi}
          mapUrl={data.rukhsatiMapUrl}
          onVideoChange={(url) => handleSaveCustomData({ ...data, rukhsatiVideoUrl: url })}
        />

        {/* SECTION: WITH THE BLESSINGS OF OUR FAMILIES (معزز اہلِ خانہ و سرپرستان) - PLACED ABOVE MAIN LOCATION */}
        <section
          id="family-blessings"
          className="w-full relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #f0f8ff 0%, #faf6ee 45%, #fffbf2 100%)'
          }}
        >
          <FamilySection
            language={language}
            data={data}
            onOpenCustomize={() => setIsOwnerPanelOpen(true)}
          />

          {/* Organic Wave Divider transitioning into Main Venue & Location Section */}
          <WaveDivider position="bottom" fillColor="#f0f8ff" variant="wave2" />
        </section>

        {/* SECTION 5: VENUE MAP & WEDDING BLESSINGS (MAIN LOCATION) */}
        <section
          id="venue-section"
          className="w-full relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #f0f8ff 0%, #f9fbfd 50%, #fbf8f2 100%)'
          }}
        >
          <TimelineVenue language={language} data={data} />

          {/* Organic Wave Divider transitioning into RSVP */}
          <WaveDivider position="bottom" fillColor="#fbf8f2" variant="wave1" />
        </section>

        {/* SECTION 7: RSVP & GUEST WISHES */}
        <section
          id="rsvp"
          className="min-h-screen w-full relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #fbf8f2 0%, #f2f7fa 50%, #f7fafc 100%)'
          }}
        >
          <RsvpForm language={language} initialWishes={wishes} />

          {/* Organic Wave Divider transitioning into Footer */}
          <WaveDivider position="bottom" fillColor="#faf7f2" variant="wave2" />
        </section>

        {/* SECTION 8: FOOTER */}
        <footer
          id="footer"
          className="w-full text-center py-14 px-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #faf7f2 0%, #f7f3eb 100%)'
          }}
        >
          {/* Gold wave ornament */}
          <div className="w-32 h-5 mx-auto mb-6 opacity-70 flex items-center justify-center text-[#d4af37]">
            <svg viewBox="0 0 120 20" className="w-full h-full stroke-current fill-none stroke-[1.5]">
              <path d="M0 10 Q 15 0, 30 10 T 60 10 T 90 10 T 120 10" />
            </svg>
          </div>

          <p className={`text-2xl sm:text-3xl text-[#1a3a4d] mb-2 ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi font-bold' : 'font-script'}`}>
            {language === 'ur'
              ? 'ہم آپ کے ساتھ اس خوشی کا جشن منانے کے لیے بے تاب ہیں!'
              : language === 'hi'
              ? 'हम आपके साथ इस ख़ुशी का जश्न मनाने के लिए बेताब हैं!'
              : "We can't wait to celebrate with you!"}
          </p>

          <p className="font-display text-lg font-bold text-[#b89125] tracking-wide">
            {groomDisplayName} &amp; {brideDisplayName}
          </p>

          {/* Gold wave ornament */}
          <div
            className="w-32 h-5 mx-auto mt-4 opacity-70 flex items-center justify-center text-[#d4af37] select-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 120 20" className="w-full h-full stroke-current fill-none stroke-[1.5]">
              <path d="M0 10 Q 15 0, 30 10 T 60 10 T 90 10 T 120 10" />
            </svg>
          </div>

          <p className={`text-[11px] text-[#777] mt-4 tracking-wider ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
            {language === 'ur'
              ? 'بابرکت نکاح کی یادگار دعوت'
              : language === 'hi'
              ? 'बा-बरकत निकाह का यादगार निमंत्रण'
              : 'Blessed Nikah Celebration Invitation'}
          </p>
        </footer>

      </main>

      {/* DEDICATED OWNER MANAGEMENT PANEL (ACCESSIBLE ONLY VIA /admin PATH & PIN PROTECTED) */}
      <OwnerAdminPanel
        isOpen={isOwnerPanelOpen}
        onClose={handleCloseOwnerPanel}
        data={data}
        onSave={handleSaveCustomData}
        language={language}
      />
    </div>
  );
}
