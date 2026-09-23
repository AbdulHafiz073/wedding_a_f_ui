import React from 'react';
import { Users, Heart, Sparkles, Edit3 } from 'lucide-react';
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
        className={`flex items-center justify-between gap-3 py-2 px-3 rounded-2xl bg-white/85 hover:bg-white border transition-all duration-200 group shadow-xs hover:shadow-md ${
          isGroom 
            ? 'border-amber-200/60 hover:border-amber-300' 
            : 'border-rose-200/60 hover:border-rose-300'
        }`}
      >
        {/* Avatar/Photo strictly placed BEFORE the name text in left-to-right order */}
        <div className="flex items-center gap-3 min-w-0" dir="ltr">
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
          <div className="min-w-0 text-left" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <span
              className={`text-xs sm:text-sm font-bold text-gray-900 truncate block leading-tight ${
                language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : ''
              }`}
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
              ? 'bg-amber-100/80 text-amber-900 border-amber-300/50'
              : 'bg-rose-100/80 text-rose-900 border-rose-300/50'
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

            {/* Family Members List */}
            <div className="space-y-2">
              {groomFamily.members.map((member) => renderMember(member, 'groom'))}
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

            {/* Family Members List */}
            <div className="space-y-2">
              {brideFamily.members.map((member) => renderMember(member, 'bride'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
