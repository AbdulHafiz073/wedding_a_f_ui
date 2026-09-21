import React, { useState, useEffect } from 'react';
import { Calendar, Download, Clock } from 'lucide-react';
import { Language } from '../types';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface CountdownTimerProps {
  language: Language;
  targetDateIso: string;
  groomName: string;
  brideName: string;
  venueName: string;
  venueCity: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  language,
  targetDateIso,
  groomName,
  brideName,
  venueName,
  venueCity
}) => {
  const calculateTimeRemaining = (): TimeRemaining => {
    const target = new Date(targetDateIso).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds, isPast: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDateIso]);

  const eventTitle = `${groomName} & ${brideName} - Wedding Celebration (Nikah)`;
  const eventDetails = `You are cordially invited to celebrate the blessed Nikah of ${groomName} & ${brideName}.`;
  const eventLocation = `${venueName}, ${venueCity}`;

  const googleCalUrl = generateGoogleCalendarUrl(
    eventTitle,
    eventDetails,
    eventLocation,
    targetDateIso,
    5
  );

  const handleDownloadIcs = () => {
    downloadIcsFile(eventTitle, eventDetails, eventLocation, targetDateIso, 5);
  };

  const format2Digits = (num: number) => num.toString().padStart(2, '0');

  const targetDate = new Date(targetDateIso);
  const targetFormattedEn = !isNaN(targetDate.getTime())
    ? targetDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Wednesday, October 28, 2026';

  const urduMonths = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
  ];
  const urduDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const toUrduDigits = (num: number) =>
    num.toString().split('').map(d => urduDigits[parseInt(d, 10)] ?? d).join('');

  const targetFormattedUr = !isNaN(targetDate.getTime())
    ? `${urduDays[targetDate.getDay()]}، ${toUrduDigits(targetDate.getDate())} ${urduMonths[targetDate.getMonth()]} ${toUrduDigits(targetDate.getFullYear())}`
    : 'بدھ، ۲۸ اکتوبر ۲۰۲۶';

  const hindiMonths = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];
  const hindiDays = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

  const targetFormattedHi = !isNaN(targetDate.getTime())
    ? `${hindiDays[targetDate.getDay()]}, ${targetDate.getDate()} ${hindiMonths[targetDate.getMonth()]} ${targetDate.getFullYear()}`
    : 'बुधवार, 28 अक्टूबर 2026';

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* Title */}
      <h2 className={`text-3xl sm:text-4xl text-[#1a3a4d] mb-2 ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi font-bold' : 'font-script'}`}>
        {language === 'ur' ? 'ہمیشہ کے لیے الٹی گنتی' : language === 'hi' ? 'हमेशा के लिए उल्टी गिनती' : 'Counting Down to Forever'}
      </h2>
      <div className="w-16 h-[1px] bg-[#d4af37] mx-auto relative my-3">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f5f0e8] px-2 text-[#d4af37] text-xs">
          ⏳
        </span>
      </div>

      {/* Target Wedding Date Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-[#d4af37]/35 text-xs font-display tracking-wider text-[#2c5f7c] font-medium my-1 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>{language === 'ur' ? targetFormattedUr : language === 'hi' ? targetFormattedHi : targetFormattedEn}</span>
      </div>

      {/* Countdown 4-box display matching the video style */}
      <div className="flex gap-2 sm:gap-3 justify-center items-center my-6 px-2">
        {/* Days */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[82px] border border-white/60 shadow-[0_4px_16px_rgba(44,95,124,0.08)] flex flex-col items-center">
          <span className="font-display text-2xl sm:text-3xl font-bold text-[#1a3a4d] leading-none">
            {format2Digits(timeLeft.days)}
          </span>
          <span className={`text-[10px] sm:text-xs tracking-wider text-[#777] mt-1.5 font-semibold ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
            {language === 'ur' ? 'دن' : language === 'hi' ? 'दिन' : 'Days'}
          </span>
        </div>

        {/* Hours */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[82px] border border-white/60 shadow-[0_4px_16px_rgba(44,95,124,0.08)] flex flex-col items-center">
          <span className="font-display text-2xl sm:text-3xl font-bold text-[#1a3a4d] leading-none">
            {format2Digits(timeLeft.hours)}
          </span>
          <span className={`text-[10px] sm:text-xs tracking-wider text-[#777] mt-1.5 font-semibold ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
            {language === 'ur' ? 'گھنٹے' : language === 'hi' ? 'घंटे' : 'Hours'}
          </span>
        </div>

        {/* Minutes */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[82px] border border-white/60 shadow-[0_4px_16px_rgba(44,95,124,0.08)] flex flex-col items-center">
          <span className="font-display text-2xl sm:text-3xl font-bold text-[#1a3a4d] leading-none">
            {format2Digits(timeLeft.minutes)}
          </span>
          <span className={`text-[10px] sm:text-xs tracking-wider text-[#777] mt-1.5 font-semibold ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
            {language === 'ur' ? 'منٹ' : language === 'hi' ? 'मिनट' : 'Minutes'}
          </span>
        </div>

        {/* Seconds with soft pulse */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[82px] border border-white/60 shadow-[0_4px_16px_rgba(44,95,124,0.08)] flex flex-col items-center">
          <span className="font-display text-2xl sm:text-3xl font-bold text-[#2c5f7c] leading-none">
            {format2Digits(timeLeft.seconds)}
          </span>
          <span className={`text-[10px] sm:text-xs tracking-wider text-[#777] mt-1.5 font-semibold ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
            {language === 'ur' ? 'سیکنڈ' : language === 'hi' ? 'सेकंड' : 'Seconds'}
          </span>
        </div>
      </div>

      {/* Save date calendar action */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-display tracking-wider text-[#1a3a4d] border border-[#d4af37]/40 shadow-sm transition-all active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5 text-[#2c5f7c]" />
          <span>
            {language === 'ur'
              ? 'گوگل کیلنڈر میں محفوظ کریں'
              : language === 'hi'
              ? 'गूगल कैलेंडर में जोड़ें'
              : 'Add to Google Calendar'}
          </span>
        </a>

        <button
          onClick={handleDownloadIcs}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-display tracking-wider text-[#1a3a4d] border border-gray-200 shadow-sm transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>
            {language === 'ur'
              ? 'iCal فائل ڈاؤن لوڈ'
              : language === 'hi'
              ? 'iCal फ़ाइल डाउनलोड करें'
              : 'Download .iCal'}
          </span>
        </button>
      </div>
    </div>
  );
};
