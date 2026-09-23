import React from 'react';
import { MapPin, Gift, ExternalLink, Navigation } from 'lucide-react';
import { Language, WeddingData } from '../types';

interface TimelineVenueProps {
  language: Language;
  data: WeddingData;
}

// Helper to generate a reliable Google Maps embed URL
function resolveMapEmbedUrl(rawEmbedUrl?: string, directionsUrl?: string, venueName?: string, venueAddress?: string, venueCity?: string): string {
  if (rawEmbedUrl && rawEmbedUrl.trim()) {
    const trimmed = rawEmbedUrl.trim();
    // If user pasted a full <iframe ... src="..." /> tag
    if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
      const match = trimmed.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }
    // If it is already a Google Maps embed URL or valid http URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      if (trimmed.includes('/maps/embed')) {
        return trimmed;
      }
      // If it's a standard google map url with q=
      const urlObj = new URL(trimmed, 'https://maps.google.com');
      const q = urlObj.searchParams.get('q');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    }
  }

  // If directionsUrl is available and has q=
  if (directionsUrl && directionsUrl.trim()) {
    try {
      const urlObj = new URL(directionsUrl.trim(), 'https://maps.google.com');
      const q = urlObj.searchParams.get('q');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    } catch {
      // ignore
    }
  }

  // Fallback: automatically construct an embed query from venue name and address
  const query = [venueName, venueAddress, venueCity].filter(Boolean).join(', ');
  if (query) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return 'https://maps.google.com/maps?q=Burj+Al+Arab+Dubai&t=&z=15&ie=UTF8&iwloc=&output=embed';
}

export const TimelineVenue: React.FC<TimelineVenueProps> = ({ language, data }) => {
  const venueDisplayName = language === 'ur' ? data.venueNameUr : language === 'hi' ? (data.venueNameHi || data.venueNameEn) : data.venueNameEn;
  const venueDisplayAddress = language === 'ur' ? data.venueAddressUr : language === 'hi' ? (data.venueAddressHi || data.venueAddressEn) : data.venueAddressEn;
  const venueDisplayCity = language === 'ur' ? data.venueCityUr : language === 'hi' ? (data.venueCityHi || data.venueCityEn) : data.venueCityEn;

  const resolvedEmbedUrl = resolveMapEmbedUrl(
    data.mapEmbedUrl,
    data.mapDirectionsUrl,
    data.venueNameEn || venueDisplayName,
    data.venueAddressEn || venueDisplayAddress,
    data.venueCityEn || venueDisplayCity
  );

  const resolvedDirectionsUrl = data.mapDirectionsUrl && data.mapDirectionsUrl.trim()
    ? data.mapDirectionsUrl.trim()
    : `https://maps.google.com/?q=${encodeURIComponent([venueDisplayName, venueDisplayAddress, venueDisplayCity].filter(Boolean).join(', '))}`;
  return (
    <div className="w-full max-w-lg mx-auto space-y-16">
      {/* 1. Venue & Map */}
      <section id="venue" className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-[#2c5f7c]" />
          <h2 className={`text-3xl sm:text-4xl text-[#1a3a4d] ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi font-bold' : 'font-script'}`}>
            {language === 'ur' ? 'تقریب کا مقام' : language === 'hi' ? 'समारोह स्थल' : 'Venue'}
          </h2>
        </div>
        <div className="w-16 h-[1px] bg-[#d4af37] mx-auto relative my-3">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f5f0e8] px-2 text-[#d4af37] text-xs">
            ✦
          </span>
        </div>

        <div className="mt-6 bg-white/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/60 shadow-[0_6px_25px_rgba(44,95,124,0.08)]">
          <h3 className={`text-2xl font-bold text-[#1a3a4d] mb-0.5 ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
            {venueDisplayName}
          </h3>
          <p className={`text-xs sm:text-sm text-[#777] mb-4 ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
            {venueDisplayAddress} • {venueDisplayCity}
          </p>

          {/* Embedded Google Map */}
          <div className="w-full h-52 rounded-xl overflow-hidden shadow-inner border border-gray-100 relative bg-gray-100 mb-4">
            <iframe
              title="Wedding Venue Map"
              src={resolvedEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <a
              href={resolvedDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#2c5f7c] to-[#4a8bb5] hover:from-[#1a3a4d] hover:to-[#2c5f7c] text-white text-xs font-display tracking-wider shadow-md transition-all active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>
                {language === 'ur'
                  ? 'گوگل میپس پر راستہ دیکھیں'
                  : language === 'hi'
                  ? 'गूगल मैप्स पर दिशा देखें'
                  : 'View on Google Maps'}
              </span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Gifts section */}
      <section id="gifts" className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-white/90 shadow-[0_6px_20px_rgba(212,175,55,0.25)] border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Gift className="w-8 h-8 text-[#d4af37]" />
        </div>
        <h2 className={`text-3xl sm:text-4xl text-[#1a3a4d] mb-2 ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi font-bold' : 'font-script'}`}>
          {language === 'ur' ? 'تحائف' : language === 'hi' ? 'उपहार व शुभकामनाएं' : 'Gifts'}
        </h2>
        <div className="w-16 h-[1px] bg-[#d4af37] mx-auto relative my-3">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f5f0e8] px-2 text-[#d4af37] text-xs">
            🎁
          </span>
        </div>
        <p className={`text-base sm:text-lg text-[#1a3a4d] font-semibold ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
          {language === 'ur'
            ? 'آپ کی دعائیں اور تشریف آوری ہی ہمارے لیے سب سے بڑا تحفہ ہے 🎁'
            : language === 'hi'
            ? 'आपकी उपस्थिति और नेक दुआएं ही हमारे लिए सबसे अनमोल तोहफ़ा हैं 🎁'
            : 'Your blessings & presence is the greatest gift 🎁'}
        </p>
        <p className={`text-xs text-[#777] mt-1 max-w-xs mx-auto ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
          {language === 'ur'
            ? 'ہم صرف آپ کے خلوص اور نیک تمناؤں کے طلبگار ہیں'
            : language === 'hi'
            ? 'केवल आपका प्यार और दिल से दी गई दुआएं ही अपेक्षित हैं।'
            : 'No boxed gifts requested. Just your love and heartfelt prayers.'}
        </p>
      </section>
    </div>
  );
};


