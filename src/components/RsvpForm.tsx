import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, MessageSquareHeart, Users, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GuestWish, Language } from '../types';
import { saveRsvpToCloud, subscribeToCloudRsvps } from '../lib/firebase';

interface RsvpFormProps {
  language: Language;
  initialWishes: GuestWish[];
}

export const RsvpForm: React.FC<RsvpFormProps> = ({ language, initialWishes }) => {
  const [wishes, setWishes] = useState<GuestWish[]>(initialWishes);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attendance: 'yes' as 'yes' | 'no' | 'maybe',
    guestsCount: 1,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Subscribe to Cloud RSVPs from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToCloudRsvps((cloudRsvps) => {
      if (cloudRsvps && cloudRsvps.length > 0) {
        const mappedWishes: GuestWish[] = cloudRsvps.map((r) => ({
          id: r.id,
          name: r.name,
          attendance: r.attending ? 'yes' : 'no',
          guestsCount: r.guestsCount,
          message: r.message,
          timestamp: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'
        }));
        setWishes(mappedWishes);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    const messageText = formData.message.trim() || (
      language === 'ur'
        ? 'مبارک ہو! اللہ آپ دونوں کو خوش رکھے۔'
        : language === 'hi'
        ? 'मुबारक़ ہو! अल्लाह आप दोनों को हमेशा खुश और सलामत रखे।'
        : 'Congratulations and best wishes!'
    );

    const newWish: GuestWish = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      attendance: formData.attendance,
      guestsCount: Number(formData.guestsCount) || 1,
      message: messageText,
      timestamp: language === 'ur' ? 'ابھی ابھی' : language === 'hi' ? 'अभी-अभी' : 'Just now'
    };

    // Optimistically update local list
    setWishes(prev => [newWish, ...prev]);

    try {
      // Save to Cloud Firestore
      await saveRsvpToCloud({
        name: formData.name.trim(),
        attending: formData.attendance === 'yes',
        guestsCount: Number(formData.guestsCount) || 1,
        message: messageText,
        phone: formData.email.trim()
      });
    } catch (err) {
      console.warn('Saved RSVP locally (cloud sync offline):', err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Trigger confetti celebration on RSVP
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#2c5f7c', '#d4af37', '#e74c3c']
    });

    // Reset form after 4 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        attendance: 'yes',
        guestsCount: 1,
        message: ''
      });
    }, 3500);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* RSVP Form Card with Rich Colorful Royal Gradient & Golden Accents */}
      <div className="relative rounded-3xl p-6 sm:p-9 bg-gradient-to-br from-white/95 via-[#fffdf9]/95 to-[#f7f2ea]/95 backdrop-blur-xl border-2 border-[#d4af37]/45 shadow-[0_18px_50px_rgba(44,95,124,0.18),0_0_24px_rgba(212,175,55,0.18)] overflow-hidden">
        
        {/* Subtle Decorative Floral Background Glow Accents */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#ffd166]/25 via-[#f43f5e]/15 to-transparent blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-gradient-to-tr from-[#38bdf8]/20 via-[#d4af37]/20 to-transparent blur-xl pointer-events-none" />

        <div className="relative z-10 text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1a3a4d] via-[#2c5f7c] to-[#3a7396] text-[#ffd166] flex items-center justify-center mx-auto mb-2.5 border-2 border-[#d4af37]/60 shadow-md shadow-[#1a3a4d]/20">
            <MessageSquareHeart className="w-7 h-7 text-[#ffeaa7]" />
          </div>
          <h2 className={`text-3xl sm:text-4xl text-[#1a3a4d] mb-1 font-bold ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-display'}`}>
            {language === 'ur' ? 'پیغام اور جواب بھیجیں' : language === 'hi' ? 'संदेश व उपस्थिति दर्ज करें' : 'Send a Message'}
          </h2>
          
          <div className="flex items-center justify-center gap-2 my-2.5">
            <span className="w-10 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            <span className="text-[#d4af37] text-sm">✦ ✉ ✦</span>
            <span className="w-10 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          </div>

          <p className={`text-xs sm:text-sm text-[#4a5568] max-w-sm mx-auto font-medium ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
            {language === 'ur'
              ? 'اپنی شرکت کی تصدیق کریں اور دعا کا تحفہ بھیجیں'
              : language === 'hi'
              ? 'कृपया अपनी उपस्थिति बताएं और नए जोड़े को दिल से दुआएं भेजें'
              : 'Please RSVP and share your heartfelt wishes & prayers'}
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border-2 border-emerald-300 shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className={`text-xl font-bold text-[#1a3a4d] mb-1 ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
              {language === 'ur' ? 'پیغام کامیابی سے موصول ہوا!' : language === 'hi' ? 'संदेश व जवाब सफलतापूर्वक भेजा गया!' : 'Message & RSVP Sent!'}
            </h3>
            <p className={`text-xs text-[#555] ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
              {language === 'ur'
                ? 'آپ کی محبت اور نیک تمناؤں کا شکریہ! جزاکم اللہ خیراً۔'
                : language === 'hi'
                ? 'आपके प्यार, दुआओं और जवाब के लिए बहुत-बहुत शुक्रिया! जज़ाकअल्लाह ख़ैर।'
                : 'Thank you for your blessings and RSVP. JazakAllah Khair!'}
            </p>
          </div>
        ) : (
          <form id="rsvpForm" onSubmit={handleSubmit} className="relative z-10 space-y-4">
            {/* Guest Name */}
            <div>
              <label className={`block text-xs font-bold tracking-wider text-[#1a3a4d] mb-1.5 ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
                {language === 'ur' ? 'آپ کا نام' : language === 'hi' ? 'आपका नाम' : 'Your Name'} <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'ur' ? 'اپنا مکمل نام درج کریں' : language === 'hi' ? 'पूरा नाम दर्ज करें' : 'Full name'}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/80 bg-white text-[#1a3a4d] placeholder-gray-400 text-sm focus:outline-none focus:border-[#b89125] focus:ring-3 focus:ring-[#d4af37]/20 transition-all shadow-inner"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className={`block text-xs font-bold tracking-wider text-[#1a3a4d] mb-1.5 ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
                {language === 'ur' ? 'ای میل پتہ' : language === 'hi' ? 'ईमेल पता' : 'Email Address'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/80 bg-white text-[#1a3a4d] placeholder-gray-400 text-sm focus:outline-none focus:border-[#b89125] focus:ring-3 focus:ring-[#d4af37]/20 transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Attendance Select */}
              <div>
                <label className={`block text-xs font-bold tracking-wider text-[#1a3a4d] mb-1.5 ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
                  {language === 'ur' ? 'کیا آپ شریک ہوں گے؟' : language === 'hi' ? 'क्या आप शामिल होंगे?' : 'Will you attend?'}
                </label>
                <select
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.value as 'yes' | 'no' | 'maybe' })}
                  className="w-full px-3 py-3 rounded-xl border-2 border-amber-200/80 bg-white text-[#1a3a4d] text-sm focus:outline-none focus:border-[#b89125] focus:ring-3 focus:ring-[#d4af37]/20 transition-all cursor-pointer font-medium shadow-inner"
                >
                  <option value="yes">
                    {language === 'ur' ? '✨ جی ہاں، ضرور آؤں گا' : language === 'hi' ? '✨ हाँ, ज़रूर आऊँगा/आऊँगी' : '✨ Yes, I will be there'}
                  </option>
                  <option value="maybe">
                    {language === 'ur' ? '⏳ شاید / کوشش کروں گا' : language === 'hi' ? '⏳ शायद / कोशिश रहेगी' : '⏳ Maybe'}
                  </option>
                  <option value="no">
                    {language === 'ur' ? '🤍 معذرت، شریک نہیں ہو سکوں گا' : language === 'hi' ? '🤍 माफ़ करें, नहीं आ पाऊँगा/पाऊँगी' : "🤍 Sorry, can't make it"}
                  </option>
                </select>
              </div>

              {/* Number of Guests */}
              <div>
                <label className={`block text-xs font-bold tracking-wider text-[#1a3a4d] mb-1.5 ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
                  {language === 'ur' ? 'افراد کی تعداد' : language === 'hi' ? 'मेहमानों की संख्या' : 'No. of Guests'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/80 bg-white text-[#1a3a4d] text-sm focus:outline-none focus:border-[#b89125] focus:ring-3 focus:ring-[#d4af37]/20 transition-all shadow-inner font-bold"
                  />
                  <Users className="w-4 h-4 text-amber-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Message / Dua Textarea */}
            <div>
              <label className={`block text-xs font-bold tracking-wider text-[#1a3a4d] mb-1.5 ${language === 'hi' ? 'font-hindi' : 'font-display uppercase'}`}>
                {language === 'ur' ? 'آپ کی دعائیں اور پیغام' : language === 'hi' ? 'आपकी दुआएं व शुभकामनाएं' : 'Your Wishes / Message'}
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={
                  language === 'ur'
                    ? 'نئے جوڑے کے لیے اپنی دعائیں اور نیک تمنائیں لکھیں...'
                    : language === 'hi'
                    ? 'दूल्हा-दुल्हन के लिए अपनी दुआएं और शुभकामनाएं लिखें...'
                    : 'Write your wishes and blessings for the couple...'
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200/80 bg-white text-[#1a3a4d] placeholder-gray-400 text-sm focus:outline-none focus:border-[#b89125] focus:ring-3 focus:ring-[#d4af37]/20 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Submit Button with Rich Royal Gold Gradient */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl font-display font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#1a3a4d] via-[#2c5f7c] to-[#b89125] hover:opacity-95 shadow-lg shadow-[#1a3a4d]/25 border border-[#d4af37]/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#ffeaa7]" />
              <span>
                {isSubmitting
                  ? (language === 'ur' ? 'بھیجا جا رہا ہے...' : language === 'hi' ? 'भेजा जा रहा है...' : 'Sending...')
                  : (language === 'ur' ? 'پیغام اور جواب بھیجیں' : language === 'hi' ? 'संदेश व जवाब भेजें' : 'Send Message')}
              </span>
            </button>
          </form>
        )}
      </div>

      {/* Guestbook Feed with custom-scroll */}
      {wishes.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className={`text-lg font-bold text-[#1a3a4d] flex items-center gap-2 ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
              <Heart className="w-4 h-4 text-[#e74c3c] fill-[#e74c3c]" />
              <span>{language === 'ur' ? 'مہمانوں کی دعائیں' : language === 'hi' ? 'मेहमानों की दुआएं' : 'Guest Blessings & Wishes'}</span>
            </h3>
            <span className={`text-xs text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-bold ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
              {wishes.length} {language === 'ur' ? 'پیغامات' : language === 'hi' ? 'संदेश' : 'wishes'}
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1.5 custom-scroll">
            {wishes.map((item) => (
              <div
                key={item.id}
                className="bg-white/85 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a3a4d] via-[#2c5f7c] to-[#b89125] text-white text-xs font-bold flex items-center justify-center border border-amber-300">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-display text-sm font-bold text-[#1a3a4d]">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-body">{item.timestamp}</span>
                </div>
                <p className={`text-xs text-gray-700 pl-10 leading-relaxed font-medium ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
                  "{item.message}"
                </p>
                {item.attendance === 'yes' && (
                  <div className={`mt-2 pl-10 flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold ${language === 'hi' ? 'font-hindi' : ''}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>
                      {language === 'ur'
                        ? 'تقریب میں شرکت کی تصدیق کی'
                        : language === 'hi'
                        ? `शामिल होंगे (${item.guestsCount} सदस्य)`
                        : `Attending (${item.guestsCount} guest${item.guestsCount > 1 ? 's' : ''})`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
