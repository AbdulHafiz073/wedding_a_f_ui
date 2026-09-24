import React, { useRef, useState, useEffect } from 'react';
import { Users, Heart, Sparkles, Edit3, ChevronUp, ChevronDown } from 'lucide-react';
import { Language, WeddingData, FamilyMember } from '../types';

interface FamilySectionProps {
  language: Language;
  data: WeddingData;
  onOpenCustomize?: () => void;
}

export const FamilySection: React.FC<FamilySectionProps> = ({
  language,
  data,
  onOpenCustomize
}) => {
  const groomFamily = data.groomFamily;
  const brideFamily = data.brideFamily;

  const groomListRef = useRef<HTMLDivElement>(null);
  const brideListRef = useRef<HTMLDivElement>(null);

  const [groomCanScrollUp, setGroomCanScrollUp] = useState(false);
  const [groomCanScrollDown, setGroomCanScrollDown] = useState(false);
  const [brideCanScrollUp, setBrideCanScrollUp] = useState(false);
  const [brideCanScrollDown, setBrideCanScrollDown] = useState(false);

  const updateScrollState = (
    el: HTMLDivElement | null,
    setUp: React.Dispatch<React.SetStateAction<boolean>>,
    setDown: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setUp(scrollTop > 4);
    setDown(scrollTop + clientHeight < scrollHeight - 6);
  };

  useEffect(() => {
    const groomEl = groomListRef.current;
    const brideEl = brideListRef.current;

    const handleGroomScroll = () =>
      updateScrollState(groomEl, setGroomCanScrollUp, setGroomCanScrollDown);
    const handleBrideScroll = () =>
      updateScrollState(brideEl, setBrideCanScrollUp, setBrideCanScrollDown);

    if (groomEl) {
      handleGroomScroll();
      groomEl.addEventListener('scroll', handleGroomScroll, { passive: true });
    }
    if (brideEl) {
      handleBrideScroll();
      brideEl.addEventListener('scroll', handleBrideScroll, { passive: true });
    }

    const timer = setTimeout(() => {
      handleGroomScroll();
      handleBrideScroll();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (groomEl) groomEl.removeEventListener('scroll', handleGroomScroll);
      if (brideEl) brideEl.removeEventListener('scroll', handleBrideScroll);
    };
  }, [groomFamily.members, brideFamily.members]);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (!ref.current) return;
    const scrollAmount = direction === 'up' ? -180 : 180;
    ref.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
  };

  const groomName =
    language === 'ur'
      ? data.groomNameUr
      : language === 'hi'
      ? data.groomNameHi || data.groomNameEn
      : data.groomNameEn;

  const brideName =
    language === 'ur'
      ? data.brideNameUr
      : language === 'hi'
      ? data.brideNameHi || data.brideNameEn
      : data.brideNameEn;

  const renderMember = (member: FamilyMember, side: 'groom' | 'bride') => {
    const name =
      language === 'ur'
        ? member.nameUr
        : language === 'hi'
        ? member.nameHi || member.nameEn
        : member.nameEn;

    const relation =
      language === 'ur'
        ? member.relationUr
        : language === 'hi'
        ? member.relationHi || member.relationEn
        : member.relationEn;

    const isGroom = side === 'groom';

    return (
      <div
        key={member.id}
        className={`flex items-center justify-between gap-2.5 sm:gap-3 py-2.5 px-3 sm:px-3.5 rounded-2xl bg-white/90 hover:bg-white border transition-all duration-200 group shadow-xs hover:shadow-md ${
          isGroom 
            ? 'border-amber-200/70 hover:border-amber-400' 
            : 'border-rose-200/70 hover:border-rose-400'
        }`}
      >
        {/* Avatar/Photo strictly placed BEFORE the name text in left-to-right order */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1" dir="ltr">
          {/* Member Photo Avatar / Badge */}
          {member.imageUrl ? (
            <div className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border-2 shadow-xs group-hover:scale-105 transition-transform duration-200 ${
              isGroom ? 'border-amber-400 ring-2 ring-amber-200/60' : 'border-rose-400 ring-2 ring-rose-200/60'
            }`}>
              <img
                src={member.imageUrl}
                alt={member.nameEn || 'Family Member'}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 border-2 flex items-center justify-center font-bold text-xs shadow-xs ${
              isGroom 
                ? 'bg-gradient-to-tr from-amber-100 via-amber-50 to-amber-200 text-amber-900 border-amber-300/90' 
                : 'bg-gradient-to-tr from-rose-100 via-rose-50 to-rose-200 text-rose-900 border-rose-300/90'
            }`}>
              {name.charAt(0) || (isGroom ? 'Q' : 'K')}
            </div>
          )}

          {/* Member Name and Sub-relation text placed after image */}
          <div className="min-w-0 flex-1 text-left" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <span
              className={`text-xs sm:text-sm font-bold text-gray-900 truncate block leading-tight ${
                language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''
              }`}
              title={name}
            >
              {name}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] font-medium text-gray-500 block truncate ${
                language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''
              }`}
            >
              {relation}
            </span>
          </div>
        </div>

        <span
          className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border uppercase tracking-wider ${
            isGroom
              ? 'bg-amber-100/90 text-amber-900 border-amber-300/60'
              : 'bg-rose-100/90 text-rose-900 border-rose-300/60'
          } ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''}`}
        >
          {relation}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Title & Section Divider */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#d4af37]/40 shadow-xs mb-3">
          <Users className="w-4 h-4 text-[#b89125]" />
          <span
            className={`text-xs sm:text-sm font-bold text-[#1a3a4d] uppercase tracking-wider ${
              language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-display'
            }`}
          >
            {language === 'ur'
              ? 'معزز اہلِ خانہ و سرپرستان'
              : language === 'hi'
              ? 'सम्मानित परिवारजन व अभिभावक'
              : 'With The Blessings of Our Families'}
          </span>
        </div>

        <h3
          className={`text-2xl sm:text-3xl font-extrabold text-[#1a3a4d] ${
            language === 'ur' ? 'font-urdu leading-loose' : language === 'hi' ? 'font-hindi' : 'font-display'
          }`}
        >
          {language === 'ur'
            ? 'خاندانِ قادر و خاندانِ خان'
            : language === 'hi'
            ? 'क़ादिर परिवार व ख़ान परिवार'
            : 'Family of Abdul Qadir & Family of Foziya Khan'}
        </h3>

        <p
          className={`text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1 ${
            language === 'hi' ? 'font-hindi' : ''
          }`}
        >
          {language === 'ur'
            ? 'آپ تمام معزز مہمانوں کے استقبال کے لیے چشم براہ ہیں'
            : language === 'hi'
            ? 'आप सभी सम्मानीय मेहमानों के स्नेहपूर्ण स्वागत के लिए आकांक्षी'
            : 'Warmly solicit your gracious presence and heartfelt blessings'}
        </p>
      </div>

      {/* Side-by-Side Family Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Central Flourish Heart (Desktop only) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-[#d4af37]/60 items-center justify-center text-[#d4af37] z-10 pointer-events-none">
          <Heart className="w-5 h-5 fill-[#d4af37]/20" />
        </div>

        {/* 1. GROOM SIDE: ABDUL QADIR & FAMILY */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-white/90 via-white/80 to-[#fcfaf5]/90 backdrop-blur-md border border-[#d4af37]/35 shadow-[0_10px_30px_rgba(212,175,55,0.08)] flex flex-col justify-between transition-all hover:shadow-[0_15px_35px_rgba(212,175,55,0.14)]">
          <div>
            {/* Groom Side Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-3 min-w-0" dir="ltr">
                {groomFamily.badgeImageUrl ? (
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-amber-50">
                    <img
                      src={groomFamily.badgeImageUrl}
                      alt="Groom Family Logo"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-xl shadow-xs border border-amber-300 shrink-0">
                    <span>🤵</span>
                  </div>
                )}
                <div className="min-w-0 text-left" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 block">
                    {language === 'ur'
                      ? groomFamily.sideTitleUr
                      : language === 'hi'
                      ? groomFamily.sideTitleHi || groomFamily.sideTitleEn
                      : groomFamily.sideTitleEn}
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold text-[#1a3a4d] truncate">
                    {groomName}
                  </h4>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-extrabold uppercase shrink-0">
                {language === 'ur' ? 'دولہا' : language === 'hi' ? 'दूल्हा' : 'Groom'}
              </span>
            </div>

            {/* Parents Lineage Subtitle */}
            <p
              className={`text-xs text-amber-900/90 font-medium mb-4 italic bg-amber-50/70 py-1.5 px-3 rounded-xl border border-amber-200/40 text-center ${
                language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''
              }`}
            >
              {language === 'ur'
                ? groomFamily.parentsIntroUr
                : language === 'hi'
                ? groomFamily.parentsIntroHi || groomFamily.parentsIntroEn
                : groomFamily.parentsIntroEn}
            </p>

            {/* Family Members List with smooth touch & mouse scroll + Up/Down Control Buttons */}
            <div className="relative group/list">
              {/* Up Scroll Floating Button */}
              {groomCanScrollUp && (
                <button
                  type="button"
                  onClick={() => scrollContainer(groomListRef, 'up')}
                  aria-label="Scroll Up"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-[11px] font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 border border-white/60 animate-bounce cursor-pointer select-none"
                >
                  <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === 'ur' ? 'اوپر' : language === 'hi' ? 'ऊपर' : 'Scroll Up'}</span>
                </button>
              )}

              {/* Scrollable list (Exactly 5 names visible in view on window/tablet/mobile, rest accessible via scroll) */}
              <div
                ref={groomListRef}
                className="space-y-2 max-h-[300px] overflow-y-auto pr-1.5 custom-scroll touch-pan-y"
              >
                {groomFamily.members.map((member) => renderMember(member, 'groom'))}
              </div>

              {/* Down Scroll Floating Button */}
              {groomCanScrollDown && (
                <button
                  type="button"
                  onClick={() => scrollContainer(groomListRef, 'down')}
                  aria-label="Scroll Down"
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-[11px] font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 border border-white/60 animate-bounce cursor-pointer select-none"
                >
                  <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === 'ur' ? 'مزید نام دیکھیں' : language === 'hi' ? 'और नाम देखें' : 'Scroll Down'}</span>
                </button>
              )}
            </div>

            {/* Permanent Quick Scroll Navigation Controls Bar (Mobile, Tablet, Windows) */}
            <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between gap-2 text-xs">
              <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {language === 'ur'
                  ? 'تمام نام دیکھنے کے لیے اسکرول کریں'
                  : language === 'hi'
                  ? 'सभी नाम देखने के लिए स्क्रोल करें'
                  : 'Scroll to explore full list'}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollContainer(groomListRef, 'up')}
                  disabled={!groomCanScrollUp}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                    groomCanScrollUp
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 active:scale-90 shadow-xs cursor-pointer'
                      : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Scroll Up"
                >
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollContainer(groomListRef, 'down')}
                  disabled={!groomCanScrollDown}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                    groomCanScrollDown
                      ? 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700 active:scale-90 shadow-sm cursor-pointer'
                      : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Scroll Down"
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BRIDE SIDE: FOZIA KHAN & FAMILY */}
        <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-white/90 via-white/80 to-[#fdf9f7]/90 backdrop-blur-md border border-rose-300/40 shadow-[0_10px_30px_rgba(244,63,94,0.08)] flex flex-col justify-between transition-all hover:shadow-[0_15px_35px_rgba(244,63,94,0.14)]">
          <div>
            {/* Bride Side Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-3 min-w-0" dir="ltr">
                {brideFamily.badgeImageUrl ? (
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-md shrink-0 bg-rose-50">
                    <img
                      src={brideFamily.badgeImageUrl}
                      alt="Bride Family Logo"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-400 to-rose-200 flex items-center justify-center text-xl shadow-xs border border-rose-300 shrink-0">
                    <span>👰</span>
                  </div>
                )}
                <div className="min-w-0 text-left" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-800 block">
                    {language === 'ur'
                      ? brideFamily.sideTitleUr
                      : language === 'hi'
                      ? brideFamily.sideTitleHi || brideFamily.sideTitleEn
                      : brideFamily.sideTitleEn}
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold text-[#1a3a4d] truncate">
                    {brideName}
                  </h4>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-900 text-[10px] font-extrabold uppercase shrink-0">
                {language === 'ur' ? 'دلہن' : language === 'hi' ? 'दुल्हन' : 'Bride'}
              </span>
            </div>

            {/* Parents Lineage Subtitle */}
            <p
              className={`text-xs text-rose-900/90 font-medium mb-4 italic bg-rose-50/70 py-1.5 px-3 rounded-xl border border-rose-200/40 text-center ${
                language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''
              }`}
            >
              {language === 'ur'
                ? brideFamily.parentsIntroUr
                : language === 'hi'
                ? brideFamily.parentsIntroHi || brideFamily.parentsIntroEn
                : brideFamily.parentsIntroEn}
            </p>

            {/* Family Members List with smooth touch & mouse scroll + Up/Down Control Buttons */}
            <div className="relative group/list">
              {/* Up Scroll Floating Button */}
              {brideCanScrollUp && (
                <button
                  type="button"
                  onClick={() => scrollContainer(brideListRef, 'up')}
                  aria-label="Scroll Up"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-[11px] font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 border border-white/60 animate-bounce cursor-pointer select-none"
                >
                  <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === 'ur' ? 'اوپر' : language === 'hi' ? 'ऊपर' : 'Scroll Up'}</span>
                </button>
              )}

              {/* Scrollable list with fixed 5-names scroll viewport */}
              <div
                ref={brideListRef}
                className="space-y-2 max-h-[300px] overflow-y-auto pr-1.5 custom-scroll touch-pan-y"
              >
                {brideFamily.members.map((member) => renderMember(member, 'bride'))}
              </div>

              {/* Down Scroll Floating Button */}
              {brideCanScrollDown && (
                <button
                  type="button"
                  onClick={() => scrollContainer(brideListRef, 'down')}
                  aria-label="Scroll Down"
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-[11px] font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 border border-white/60 animate-bounce cursor-pointer select-none"
                >
                  <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === 'ur' ? 'مزید نام دیکھیں' : language === 'hi' ? 'और नाम देखें' : 'Scroll Down'}</span>
                </button>
              )}
            </div>

            {/* Permanent Quick Scroll Navigation Controls Bar (Mobile, Tablet, Windows) */}
            <div className="mt-3 pt-2.5 border-t border-rose-200/50 flex items-center justify-between gap-2 text-xs">
              <span className="text-[10px] sm:text-[11px] font-semibold text-rose-800/80 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-600 fill-rose-600/20" />
                {language === 'ur'
                  ? 'تمام نام دیکھنے کے لیے اسکرول کریں'
                  : language === 'hi'
                  ? 'सभी नाम देखने के लिए स्क्रोल करें'
                  : 'Scroll to explore full list'}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollContainer(brideListRef, 'up')}
                  disabled={!brideCanScrollUp}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                    brideCanScrollUp
                      ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200 active:scale-90 shadow-xs cursor-pointer'
                      : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Scroll Up"
                >
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollContainer(brideListRef, 'down')}
                  disabled={!brideCanScrollDown}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                    brideCanScrollDown
                      ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700 active:scale-90 shadow-sm cursor-pointer'
                      : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Scroll Down"
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
