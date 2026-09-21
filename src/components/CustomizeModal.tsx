import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  SlidersHorizontal, 
  Sparkles, 
  Calendar, 
  MapPin, 
  User, 
  ExternalLink, 
  RefreshCw, 
  Heart,
  Users,
  Plus,
  Trash2,
  Video,
  Film,
  Upload
} from 'lucide-react';
import { WeddingData, Language, FamilyMember } from '../types';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeddingData;
  onSave: (updatedData: WeddingData) => void;
  language: Language;
}

type TabType = 'names' | 'family' | 'datetime' | 'location' | 'video';

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  language
}) => {
  const [formData, setFormData] = useState<WeddingData>({ ...data });
  const [activeTab, setActiveTab] = useState<TabType>('names');

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...data });
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  // Helpers for managing family members
  const handleAddMember = (side: 'groom' | 'bride') => {
    const newMember: FamilyMember = {
      id: `${side}-${Date.now()}`,
      nameEn: '',
      nameUr: '',
      nameHi: '',
      relationEn: '',
      relationUr: '',
      relationHi: ''
    };
    if (side === 'groom') {
      setFormData(prev => ({
        ...prev,
        groomFamily: {
          ...prev.groomFamily,
          members: [...(prev.groomFamily?.members || []), newMember]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        brideFamily: {
          ...prev.brideFamily,
          members: [...(prev.brideFamily?.members || []), newMember]
        }
      }));
    }
  };

  const handleUpdateMember = (side: 'groom' | 'bride', index: number, field: keyof FamilyMember, val: string) => {
    if (side === 'groom') {
      const updated = [...(formData.groomFamily?.members || [])];
      if (!updated[index]) return;
      updated[index] = { ...updated[index], [field]: val };
      setFormData(prev => ({
        ...prev,
        groomFamily: { ...prev.groomFamily, members: updated }
      }));
    } else {
      const updated = [...(formData.brideFamily?.members || [])];
      if (!updated[index]) return;
      updated[index] = { ...updated[index], [field]: val };
      setFormData(prev => ({
        ...prev,
        brideFamily: { ...prev.brideFamily, members: updated }
      }));
    }
  };

  const handleRemoveMember = (side: 'groom' | 'bride', index: number) => {
    if (side === 'groom') {
      const updated = (formData.groomFamily?.members || []).filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        groomFamily: { ...prev.groomFamily, members: updated }
      }));
    } else {
      const updated = (formData.brideFamily?.members || []).filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        brideFamily: { ...prev.brideFamily, members: updated }
      }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'groomImageUrl' | 'brideImageUrl' | 'coupleImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setFormData(prev => ({ ...prev, [field]: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-format dates in English & Urdu based on datetime input
  const handleAutoFormatDate = (dateTimeIso: string) => {
    const d = new Date(dateTimeIso);
    if (isNaN(d.getTime())) return;

    const weekdayEn = d.toLocaleDateString('en-US', { weekday: 'long' });
    const timeEn = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const newTimeEn = `${weekdayEn} • ${timeEn}`;

    const urduDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
    const urduMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    
    const toUrduNumerals = (num: number | string) => {
      const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return num.toString().replace(/\d/g, (ch) => urduDigits[parseInt(ch, 10)]);
    };

    const dayNum = d.getDate();
    const monthIdx = d.getMonth();
    const yearNum = d.getFullYear();
    const weekdayUr = urduDays[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const periodUr = hours >= 12 ? 'شام / رات' : 'صبح';
    const hour12 = hours % 12 || 12;

    const newTimeUr = `${toUrduNumerals(dayNum)} ${urduMonths[monthIdx]} ${toUrduNumerals(yearNum)}، ${weekdayUr} • ${periodUr} ${toUrduNumerals(hour12)}:${toUrduNumerals(minutes)} بجے`;

    const hindiDays = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const hindiMonths = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const weekdayHi = hindiDays[d.getDay()];
    const periodHi = hours >= 12 ? 'शाम' : 'सुबह';
    const newTimeHi = `${dayNum} ${hindiMonths[monthIdx]} ${yearNum}, ${weekdayHi} • ${periodHi} ${hour12}:${minutes} बजे`;

    setFormData(prev => ({
      ...prev,
      weddingDate: dateTimeIso,
      weddingTimeEn: newTimeEn,
      weddingTimeUr: newTimeUr,
      weddingTimeHi: newTimeHi
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    handleAutoFormatDate(newDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#d4af37]/40 flex flex-col relative animate-scaleUp">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#f7fafc] via-white to-[#f5f0e8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1a3a4d] text-[#ffeaa7] flex items-center justify-center shadow-md">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#1a3a4d] flex items-center gap-1.5">
                <span>
                  {language === 'ur'
                    ? 'دعوت نامہ کی تفصیلات تبدیل کریں'
                    : language === 'hi'
                    ? 'निमंत्रण विवरण संपादित करें'
                    : 'Edit Invitation Details'}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              </h3>
              <p className="text-[11px] text-gray-500 font-body">
                {language === 'ur'
                  ? 'نام، تاریخ، وینیو/مقام اور ویڈیو باآسانی تبدیل کریں'
                  : language === 'hi'
                  ? 'नाम, विवाह तिथि, वैन्यू/स्थान और बैकग्राउंड वीडियो बदलें'
                  : 'Customize couple names, wedding date, venue & video'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close customizer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setActiveTab('names')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-display transition-all shrink-0 cursor-pointer ${
              activeTab === 'names'
                ? 'bg-white text-[#1a3a4d] shadow-sm border border-gray-200 text-[#2c5f7c]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>
              {language === 'ur'
                ? '۱. نام (Names)'
                : language === 'hi'
                ? '१. नाम (Names)'
                : '1. Names'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-display transition-all shrink-0 cursor-pointer ${
              activeTab === 'family'
                ? 'bg-white text-[#1a3a4d] shadow-sm border border-gray-200 text-[#2c5f7c]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>
              {language === 'ur'
                ? '۲. اہلِ خانہ (Family)'
                : language === 'hi'
                ? '२. परिवारजन (Family)'
                : '2. Family'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('datetime')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-display transition-all shrink-0 cursor-pointer ${
              activeTab === 'datetime'
                ? 'bg-white text-[#1a3a4d] shadow-sm border border-gray-200 text-[#2c5f7c]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>
              {language === 'ur'
                ? '۳. تاریخ و وقت (Date)'
                : language === 'hi'
                ? '३. तारीख व समय (Date)'
                : '3. Date & Time'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-display transition-all shrink-0 cursor-pointer ${
              activeTab === 'location'
                ? 'bg-white text-[#1a3a4d] shadow-sm border border-gray-200 text-[#2c5f7c]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>
              {language === 'ur'
                ? '۴. مقام و وینیو (Location)'
                : language === 'hi'
                ? '४. स्थान व वैन्यू (Location)'
                : '4. Location'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-display transition-all shrink-0 cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white text-[#1a3a4d] shadow-sm border border-gray-200 text-[#2c5f7c]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#e74c3c]" />
            <span>
              {language === 'ur'
                ? '۵. ویڈیوز و تصاویر (Media)'
                : language === 'hi'
                ? '५. वीडियो व फोटो (Media)'
                : '5. Videos & Photos'}
            </span>
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-body">

          {/* TAB 1: NAMES */}
          {activeTab === 'names' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <p className="text-[11px] text-amber-900">
                  {language === 'ur'
                    ? 'یہاں دولہا اور دلہن کے نام انگریزی اور اردو دونوں زبانوں میں تبدیل کریں۔ یہ نام کارڈ، ہیرو سیکشن اور دروازے کے انٹرو پر فوری تبدیل ہو جائیں گے۔'
                    : 'Edit groom & bride names in English and Urdu. Updates appear immediately across the hero section, intro gates, and scratch card.'}
                </p>
              </div>

              {/* English Names */}
              <div>
                <h4 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
                  <span>English Names (انگریزی نام)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Groom Name (English)</label>
                    <input
                      type="text"
                      value={formData.groomNameEn}
                      onChange={(e) => setFormData({ ...formData, groomNameEn: e.target.value })}
                      placeholder="e.g. Abdul Qadir"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] focus:ring-2 focus:ring-[#2c5f7c]/20 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Bride Name (English)</label>
                    <input
                      type="text"
                      value={formData.brideNameEn}
                      onChange={(e) => setFormData({ ...formData, brideNameEn: e.target.value })}
                      placeholder="e.g. Fozia Khan"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] focus:ring-2 focus:ring-[#2c5f7c]/20 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Urdu Names */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
                  <span>Urdu Names (اردو نام)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">دولہا کا نام (اردو)</label>
                    <input
                      type="text"
                      value={formData.groomNameUr}
                      onChange={(e) => setFormData({ ...formData, groomNameUr: e.target.value })}
                      placeholder="مثال: عبد القادر"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] focus:ring-2 focus:ring-[#2c5f7c]/20 outline-none text-base text-right font-urdu font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">دلہن کا نام (اردو)</label>
                    <input
                      type="text"
                      value={formData.brideNameUr}
                      onChange={(e) => setFormData({ ...formData, brideNameUr: e.target.value })}
                      placeholder="مثال: فوزیہ خان"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] focus:ring-2 focus:ring-[#2c5f7c]/20 outline-none text-base text-right font-urdu font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Hindi Names */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
                  <span>Hindi Names (हिन्दी नाम)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 font-hindi">दूल्हे का नाम (हिन्दी)</label>
                    <input
                      type="text"
                      value={formData.groomNameHi || ''}
                      onChange={(e) => setFormData({ ...formData, groomNameHi: e.target.value })}
                      placeholder="उदा. अब्दुल क़ादिर"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] focus:ring-2 focus:ring-[#2c5f7c]/20 outline-none text-sm font-hindi font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 font-hindi">दुल्हन का नाम (हिन्दी)</label>
                    <input
                      type="text"
                      value={formData.brideNameHi || ''}
                      onChange={(e) => setFormData({ ...formData, brideNameHi: e.target.value })}
                      placeholder="उदा. फ़ौज़िया ख़ान"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] focus:ring-2 focus:ring-[#2c5f7c]/20 outline-none text-sm font-hindi font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Quick helper button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('family')}
                  className="px-4 py-2 rounded-xl bg-[#1a3a4d] text-[#ffeaa7] font-semibold text-xs flex items-center gap-1 hover:bg-[#2c5f7c] transition-all cursor-pointer"
                >
                  <span>
                    {language === 'ur'
                      ? 'اگلا: اہلِ خانہ کی تفصیلات ←'
                      : language === 'hi'
                      ? 'आगे: परिवारजन की सूची →'
                      : 'Next: Family Members →'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: FAMILY MEMBERS */}
          {activeTab === 'family' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-3 bg-amber-50/80 border border-amber-300/80 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#b89125]" />
                  <span className="font-bold text-amber-950 text-xs">
                    {language === 'ur'
                      ? 'دولہا اور دلہن کے اہلِ خانہ کی تفصیلات (Family Members of Groom & Bride)'
                      : language === 'hi'
                      ? 'दूल्हा व दुल्हन के परिवारजनों की सूची (Family Members)'
                      : 'Groom & Bride Family Members Setup'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {language === 'ur'
                    ? 'یہاں عبد القادر اور فوزیہ خان دونوں کے خاندان کے افراد، والدین اور رشتہ داری شامل یا تبدیل کریں۔ یہ ویب سائٹ کے فوٹر میں خوبصورتی کے ساتھ آویزاں ہوگی۔'
                    : language === 'hi'
                    ? 'यहाँ अब्दुल क़ादिर व फ़ौज़िया ख़ान दोनों परिवारों के सदस्यों, माता-पिता व रिश्तों को जोड़ें या बदलें। यह वेबसाइट के फुटर में ससम्मान प्रदर्शित होगा।'
                    : 'Manage family members, parent titles, and relationships for both Abdul Qadir and Fozia Khan. Displayed prominently in the website footer.'}
                </p>
              </div>

              {/* 1. GROOM'S FAMILY (Abdul Qadir) */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1a3a4d]" />
                    <h4 className="font-bold text-gray-900 text-sm">
                      {language === 'ur'
                        ? '۱. خاندانِ دولہا — عبد القادر'
                        : language === 'hi'
                        ? '१. दूल्हे का परिवार — अब्दुल क़ादिर'
                        : "1. Groom's Family (Abdul Qadir)"}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMember('groom')}
                    className="px-2.5 py-1 rounded-lg bg-[#1a3a4d] text-white hover:bg-[#2c5f7c] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'ur' ? 'نیا رکن شامل کریں' : 'Add Member'}</span>
                  </button>
                </div>

                {/* Parent Intro Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                      Parent Intro (English)
                    </label>
                    <input
                      type="text"
                      value={formData.groomFamily?.parentsIntroEn || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groomFamily: { ...formData.groomFamily, parentsIntroEn: e.target.value }
                        })
                      }
                      placeholder="e.g. Son of Late Janab Mohammad Rafiq & Begum Nasreen Rafiq"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                      والدین کا تعارف (اردو)
                    </label>
                    <input
                      type="text"
                      value={formData.groomFamily?.parentsIntroUr || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groomFamily: { ...formData.groomFamily, parentsIntroUr: e.target.value }
                        })
                      }
                      placeholder="فرزندِ ارجمند: مرحوم جناب محمد رفیق و محترمہ نسرین رفیق"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs text-right font-urdu"
                    />
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-gray-600 block">
                    {language === 'ur' ? 'ارکان کی فہرست:' : 'Family Members List:'}
                  </span>
                  {(formData.groomFamily?.members || []).map((member, mIdx) => (
                    <div
                      key={member.id || mIdx}
                      className="p-2.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-2"
                    >
                      <input
                        type="text"
                        value={member.nameEn}
                        onChange={(e) => handleUpdateMember('groom', mIdx, 'nameEn', e.target.value)}
                        placeholder="Name (English)"
                        className="w-full sm:flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={member.nameUr}
                        onChange={(e) => handleUpdateMember('groom', mIdx, 'nameUr', e.target.value)}
                        placeholder="نام (اردو)"
                        className="w-full sm:flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-right font-urdu"
                      />
                      <input
                        type="text"
                        value={member.relationEn}
                        onChange={(e) => handleUpdateMember('groom', mIdx, 'relationEn', e.target.value)}
                        placeholder="Relation (e.g. Brother)"
                        className="w-full sm:w-28 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={member.relationUr}
                        onChange={(e) => handleUpdateMember('groom', mIdx, 'relationUr', e.target.value)}
                        placeholder="رشتہ (اردو)"
                        className="w-full sm:w-28 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-right font-urdu"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMember('groom', mIdx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. BRIDE'S FAMILY (Fozia Khan) */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b89125]" />
                    <h4 className="font-bold text-gray-900 text-sm">
                      {language === 'ur'
                        ? '۲. خاندانِ دلہن — فوزیہ خان'
                        : language === 'hi'
                        ? '२. दुल्हन का परिवार — फ़ौज़िया ख़ान'
                        : "2. Bride's Family (Fozia Khan)"}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMember('bride')}
                    className="px-2.5 py-1 rounded-lg bg-[#b89125] text-white hover:bg-amber-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'ur' ? 'نیا رکن شامل کریں' : 'Add Member'}</span>
                  </button>
                </div>

                {/* Parent Intro Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                      Parent Intro (English)
                    </label>
                    <input
                      type="text"
                      value={formData.brideFamily?.parentsIntroEn || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brideFamily: { ...formData.brideFamily, parentsIntroEn: e.target.value }
                        })
                      }
                      placeholder="e.g. Daughter of Janab Tariq Mehmood Khan & Begum Farzana Khan"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 text-[11px] mb-1">
                      والدین کا تعارف (اردو)
                    </label>
                    <input
                      type="text"
                      value={formData.brideFamily?.parentsIntroUr || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brideFamily: { ...formData.brideFamily, parentsIntroUr: e.target.value }
                        })
                      }
                      placeholder="دخترِ نیک اختر: جناب طارق محمود خان و محترمہ فرزانہ خان"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs text-right font-urdu"
                    />
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-gray-600 block">
                    {language === 'ur' ? 'ارکان کی فہرست:' : 'Family Members List:'}
                  </span>
                  {(formData.brideFamily?.members || []).map((member, mIdx) => (
                    <div
                      key={member.id || mIdx}
                      className="p-2.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-2"
                    >
                      <input
                        type="text"
                        value={member.nameEn}
                        onChange={(e) => handleUpdateMember('bride', mIdx, 'nameEn', e.target.value)}
                        placeholder="Name (English)"
                        className="w-full sm:flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={member.nameUr}
                        onChange={(e) => handleUpdateMember('bride', mIdx, 'nameUr', e.target.value)}
                        placeholder="نام (اردو)"
                        className="w-full sm:flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-right font-urdu"
                      />
                      <input
                        type="text"
                        value={member.relationEn}
                        onChange={(e) => handleUpdateMember('bride', mIdx, 'relationEn', e.target.value)}
                        placeholder="Relation (e.g. Sister)"
                        className="w-full sm:w-28 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={member.relationUr}
                        onChange={(e) => handleUpdateMember('bride', mIdx, 'relationUr', e.target.value)}
                        placeholder="رشتہ (اردو)"
                        className="w-full sm:w-28 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-right font-urdu"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMember('bride', mIdx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation between tabs */}
              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('names')}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <span>{language === 'hi' ? '← पिछला' : '← Previous'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('datetime')}
                  className="px-4 py-2 rounded-xl bg-[#1a3a4d] text-[#ffeaa7] font-semibold text-xs flex items-center gap-1 hover:bg-[#2c5f7c] transition-all cursor-pointer"
                >
                  <span>
                    {language === 'ur'
                      ? 'اگلا: تاریخ و وقت ←'
                      : language === 'hi'
                      ? 'आगे: तारीख व समय →'
                      : 'Next: Date & Time →'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DATE & TIME */}
          {activeTab === 'datetime' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
                <p className="text-[11px] text-blue-950">
                  {language === 'ur'
                    ? 'کلینڈر سے تاریخ اور وقت منتخب کریں۔ کاؤنٹ ڈاؤن ٹائمر اور تاریخیں خود بخود اپ ڈیٹ ہو جائیں گی۔'
                    : 'Pick the wedding date & time from the calendar. The live countdown timer and display dates will update automatically.'}
                </p>
              </div>

              {/* Datetime input */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Wedding Date & Time (کلینڈر سلیکٹر)</span>
                  <span className="text-[10px] text-gray-500 font-normal">ISO Format / Calendar</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.weddingDate.slice(0, 16)}
                  onChange={handleDateChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] focus:ring-2 focus:ring-[#2c5f7c]/20 outline-none text-sm font-semibold bg-white"
                  required
                />
              </div>

              {/* Auto Format Helper Button */}
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                <span className="text-[11px] text-gray-600">
                  {language === 'ur' ? 'تاریخ کو انگریزی اور اردو الفاظ میں ترتیب دیں:' : 'Auto-sync display text from calendar:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleAutoFormatDate(formData.weddingDate)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#2c5f7c] text-xs font-semibold text-[#1a3a4d] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3 h-3 text-[#2c5f7c]" />
                  <span>{language === 'ur' ? 'آٹو فارمیٹ کریں' : 'Auto Format'}</span>
                </button>
              </div>

              {/* English & Urdu Display Text */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Display Time Text (English)
                  </label>
                  <input
                    type="text"
                    value={formData.weddingTimeEn}
                    onChange={(e) => setFormData({ ...formData, weddingTimeEn: e.target.value })}
                    placeholder="e.g. Wednesday • 6:00 PM"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Shown on hero badge, e.g. "October 28, 2026 • Wednesday • 6:00 PM"
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    شادی کا وقت اور دن (اردو)
                  </label>
                  <input
                    type="text"
                    value={formData.weddingTimeUr}
                    onChange={(e) => setFormData({ ...formData, weddingTimeUr: e.target.value })}
                    placeholder="مثال: ۲۸ اکتوبر ۲۰۲۶، بدھ • شام ۶:۰۰ بجے"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-sm text-right font-urdu"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block text-right">
                    اردو ورژن میں ہیرو بیج اور تفصیلات پر ظاہر ہوگا
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 font-hindi">
                    विवाह का समय व दिन (हिन्दी)
                  </label>
                  <input
                    type="text"
                    value={formData.weddingTimeHi || ''}
                    onChange={(e) => setFormData({ ...formData, weddingTimeHi: e.target.value })}
                    placeholder="उदा. 28 अक्टूबर 2026, बुधवार • शाम 6:00 बजे"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs font-hindi"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block font-hindi">
                    हिन्दी वर्शन में हीरो बैज और निमंत्रण पर दिखेगा
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('names')}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <span>{language === 'hi' ? '← पिछला' : '← Previous'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('location')}
                  className="px-4 py-2 rounded-xl bg-[#1a3a4d] text-[#ffeaa7] font-semibold text-xs flex items-center gap-1 hover:bg-[#2c5f7c] transition-all cursor-pointer"
                >
                  <span>
                    {language === 'ur'
                      ? 'اگلا: مقام و وینیو تبدیل کریں ←'
                      : language === 'hi'
                      ? 'आगे: स्थान व वैन्यू बदलें →'
                      : 'Next: Edit Location →'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION & VENUE */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <p className="text-[11px] text-emerald-950">
                  {language === 'ur'
                    ? 'شادی کے ہال / مقام کا نام، مکمل پتہ اور گوگل میپ کا لنک درج کریں تاکہ مہمان باآسانی تشریف لا سکیں۔'
                    : 'Enter the wedding venue name, street address, and Google Maps direction link for your guests.'}
                </p>
              </div>

              {/* Venue Name En, Ur & Hi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue Name (English)</label>
                  <input
                    type="text"
                    value={formData.venueNameEn}
                    onChange={(e) => setFormData({ ...formData, venueNameEn: e.target.value })}
                    placeholder="e.g. Burj Al Arab"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">وینیو / ہال کا نام (اردو)</label>
                  <input
                    type="text"
                    value={formData.venueNameUr}
                    onChange={(e) => setFormData({ ...formData, venueNameUr: e.target.value })}
                    placeholder="مثال: برج العرب"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-sm text-right font-urdu font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 font-hindi">वैन्यू / हॉल का नाम (हिन्दी)</label>
                  <input
                    type="text"
                    value={formData.venueNameHi || ''}
                    onChange={(e) => setFormData({ ...formData, venueNameHi: e.target.value })}
                    placeholder="उदा. बुर्ज अल अरब"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs font-hindi font-medium"
                  />
                </div>
              </div>

              {/* Venue Address En, Ur & Hi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Street Address (English)</label>
                  <input
                    type="text"
                    value={formData.venueAddressEn}
                    onChange={(e) => setFormData({ ...formData, venueAddressEn: e.target.value })}
                    placeholder="e.g. Jumeirah Beach Road"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">مکمل پتہ (اردو)</label>
                  <input
                    type="text"
                    value={formData.venueAddressUr}
                    onChange={(e) => setFormData({ ...formData, venueAddressUr: e.target.value })}
                    placeholder="مثال: جمیرہ بیچ روڈ"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-sm text-right font-urdu"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 font-hindi">पूरा पता (हिन्दी)</label>
                  <input
                    type="text"
                    value={formData.venueAddressHi || ''}
                    onChange={(e) => setFormData({ ...formData, venueAddressHi: e.target.value })}
                    placeholder="उदा. जुमेराह बीच रोड"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs font-hindi"
                  />
                </div>
              </div>

              {/* City & Country En, Ur & Hi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City / Country (English)</label>
                  <input
                    type="text"
                    value={formData.venueCityEn}
                    onChange={(e) => setFormData({ ...formData, venueCityEn: e.target.value })}
                    placeholder="e.g. Dubai, UAE"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">شہر / ملک (اردو)</label>
                  <input
                    type="text"
                    value={formData.venueCityUr}
                    onChange={(e) => setFormData({ ...formData, venueCityUr: e.target.value })}
                    placeholder="مثال: دبئی، متحدہ عرب امارات"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-sm text-right font-urdu"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 font-hindi">शहर / देश (हिन्दी)</label>
                  <input
                    type="text"
                    value={formData.venueCityHi || ''}
                    onChange={(e) => setFormData({ ...formData, venueCityHi: e.target.value })}
                    placeholder="उदा. दुबई, संयुक्त अरब अमीरात"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs font-hindi"
                  />
                </div>
              </div>

              {/* Google Maps Direction Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-gray-700">Google Maps Direction URL</label>
                  {formData.mapDirectionsUrl && (
                    <a
                      href={formData.mapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2c5f7c] hover:underline flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{language === 'ur' ? 'میپ کھول کر چیک کریں' : 'Test Link'}</span>
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.mapDirectionsUrl}
                  onChange={(e) => setFormData({ ...formData, mapDirectionsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=Royal+Palm+Lahore"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {language === 'ur' ? 'مہمان جب "Get Directions" پر کلک کریں گے تو یہ لنک کھلے گا' : 'Guests will open this link when tapping "Get Directions"'}
                </span>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('datetime')}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <span>{language === 'hi' ? '← पिछला' : '← Previous'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className="px-4 py-2 rounded-xl bg-[#1a3a4d] text-[#ffeaa7] font-semibold text-xs flex items-center gap-1 hover:bg-[#2c5f7c] transition-all cursor-pointer"
                >
                  <span>
                    {language === 'ur'
                      ? 'اگلا: ویڈیو بیک گراؤنڈ ←'
                      : language === 'hi'
                      ? 'आगे: वीडियो बैकग्राउंड →'
                      : 'Next: Video Background →'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: COUPLE PHOTO & ANIMATION */}
          {activeTab === 'video' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-amber-50/90 border border-amber-300/80 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                  <span className="font-bold text-amber-950 text-xs">
                    {language === 'ur'
                      ? 'شاہی دروازہ کھلنے پر جوڑے کی تصویر (Gate Reveal Couple Image)'
                      : language === 'hi'
                      ? 'शाही दरवाज़ा खुलने पर युगल की तस्वीर (Gate Reveal Couple Image)'
                      : 'Gate Reveal Couple Image & Atmosphere'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {language === 'ur'
                    ? 'جب مہمان شاہی دروازہ کھولیں گے تو انگوٹھی کے بجائے دلہا اور دلہن کی شاندار شاہی تصویر گلاب کی پتیوں اور سنہری روشنی کے ساتھ نظر آئے گی۔'
                    : language === 'hi'
                    ? 'जब मेहमान शाही दरवाज़ा खोलेंगे तो अंगूठियों की जगह दूल्हा-दुल्हन की भव्य शाही तस्वीर, गिरती गुलाब की पंखुड़ियों और सुनहरी रोशनी के साथ दिखाई देगी।'
                    : 'When guests open the royal door, rings are replaced with the elegant couple portrait, floating rose petals, and golden stardust.'}
                </p>
              </div>

              {/* Current Couple Image Preview */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>{language === 'hi' ? 'युगल फोटो URL (Couple Photo)' : 'Couple Photo URL'}</span>
                  {formData.coupleImageUrl && (
                    <span className="text-[10px] text-emerald-600 font-medium">Active Photo Ready ✓</span>
                  )}
                </label>
                <input
                  type="url"
                  value={formData.coupleImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, coupleImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#2c5f7c] outline-none text-xs font-mono"
                />
              </div>

              {/* Live Thumbnail Preview */}
              {formData.coupleImageUrl && (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-[#d4af37]/60 shadow-md flex items-center justify-center bg-black/80">
                  <img
                    src={formData.coupleImageUrl}
                    alt="Couple Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <div className="absolute bottom-2 inset-x-3 text-center text-white">
                    <p className="text-xs font-bold text-[#ffeaa7]">
                      {formData.groomNameEn} <span className="font-script lowercase text-white">weds</span> {formData.brideNameEn}
                    </p>
                    <p className="text-[10px] text-amber-200/80">Gate Opening Reveal Preview</p>
                  </div>
                </div>
              )}

              {/* Presets to Choose From */}
              <div>
                <p className="font-semibold text-gray-700 mb-1.5 text-xs">
                  {language === 'hi' ? 'या तैयार शाही फोटो चुनें (Presets):' : 'Or select a curated royal portrait:'}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=85',
                      label: 'Royal Nikah'
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=85',
                      label: 'Warm Glow'
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1623934820753-472496997f47?w=800&auto=format&fit=crop&q=85',
                      label: 'Regal Attire'
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=85',
                      label: 'Joyful Couple'
                    }
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setFormData({ ...formData, coupleImageUrl: preset.url })}
                      className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all cursor-pointer group ${
                        formData.coupleImageUrl === preset.url
                          ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-102 shadow-md'
                          : 'border-transparent hover:border-gray-300 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white py-0.5 text-center font-medium">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Groom and Bride Window View Photos */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#b89125]" />
                  <span>{language === 'hi' ? 'गेट के दोनों ओर दूल्हा और दुल्हन की फोटो (Window View Left & Right)' : 'Groom & Bride Window View Photos (Left & Right of Gate)'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Groom Photo */}
                  <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 space-y-2">
                    <label className="block font-semibold text-gray-700 text-xs">
                      {language === 'hi' ? 'दूल्हा फोटो (Groom - Gate Left Side)' : 'Groom Photo (Gate Left Side)'}
                    </label>

                    <div className="flex items-center gap-2">
                      <div className="w-14 h-18 rounded-lg overflow-hidden border border-sky-300 shrink-0 bg-white shadow-xs">
                        {formData.groomImageUrl ? (
                          <img src={formData.groomImageUrl} alt="Groom" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 text-center p-0.5">No Photo</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="w-full px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                          <Upload className="w-3 h-3" />
                          <span>{language === 'hi' ? 'फोटो चुनें (Upload)' : 'Upload from Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileChange(e, 'groomImageUrl')}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="url"
                          value={formData.groomImageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, groomImageUrl: e.target.value })}
                          placeholder="or paste image URL..."
                          className="w-full px-2.5 py-1 border border-gray-200 rounded-lg text-[11px] font-mono focus:border-[#2c5f7c] outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bride Photo */}
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 space-y-2">
                    <label className="block font-semibold text-gray-700 text-xs">
                      {language === 'hi' ? 'दुल्हन फोटो (Bride - Gate Right Side)' : 'Bride Photo (Gate Right Side)'}
                    </label>

                    <div className="flex items-center gap-2">
                      <div className="w-14 h-18 rounded-lg overflow-hidden border border-rose-300 shrink-0 bg-white shadow-xs">
                        {formData.brideImageUrl ? (
                          <img src={formData.brideImageUrl} alt="Bride" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 text-center p-0.5">No Photo</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="w-full px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                          <Upload className="w-3 h-3" />
                          <span>{language === 'hi' ? 'फोटो चुनें (Upload)' : 'Upload from Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileChange(e, 'brideImageUrl')}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="url"
                          value={formData.brideImageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, brideImageUrl: e.target.value })}
                          placeholder="or paste image URL..."
                          className="w-full px-2.5 py-1 border border-gray-200 rounded-lg text-[11px] font-mono focus:border-[#2c5f7c] outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* SECTION: CEREMONY & BACKGROUND VIDEOS */}
              <div className="pt-4 border-t border-gray-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#2c5f7c]" />
                  <h4 className="font-bold text-gray-900 text-xs">
                    {language === 'ur'
                      ? 'تقاریب کی ویڈیوز (Ceremony & Background Video URLs)'
                      : language === 'hi'
                      ? 'रस्मों व बैकग्राउंड वीडियो (Ceremony & Background Videos)'
                      : 'Ceremony & Background Video URLs'}
                  </h4>
                </div>

                {/* 1. Jannat Door Background Video */}
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-gray-800 text-[11px]">
                      {language === 'ur' ? 'شاہی جنت بیک گراؤنڈ ویڈیو (Jannat Opening Video)' : 'Royal Opening Background Video'}
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">MP4 or YouTube</span>
                  </div>
                  <input
                    type="url"
                    value={formData.jannatVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, jannatVideoUrl: e.target.value })}
                    placeholder="https://commondatastorage.googleapis.com/... or YouTube URL"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>

                {/* 2. Haldi Ceremony Video */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-amber-950 text-[11px]">
                      {language === 'ur' ? '۱. ہلدی تقریب کی ویڈیو (Haldi Video URL)' : '1. Haldi Ceremony Video'}
                    </label>
                    <span className="text-[10px] text-amber-700 font-mono">YouTube URL / Embed</span>
                  </div>
                  <input
                    type="url"
                    value={formData.haldiVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, haldiVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>

                {/* 3. Mehndi Ceremony Video */}
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-emerald-950 text-[11px]">
                      {language === 'ur' ? '۲. مہندی تقریب کی ویڈیو (Mehndi Video URL)' : '2. Mehndi Ceremony Video'}
                    </label>
                    <span className="text-[10px] text-emerald-700 font-mono">YouTube URL / Embed</span>
                  </div>
                  <input
                    type="url"
                    value={formData.mehndiVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, mehndiVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>

                {/* 4. Baraat Ceremony Video */}
                <div className="p-3 bg-red-50/40 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-red-950 text-[11px]">
                      {language === 'ur' ? '۳. بارات تقریب کی ویڈیو (Baraat Video URL)' : '3. Royal Baraat Video'}
                    </label>
                    <span className="text-[10px] text-red-700 font-mono">YouTube URL / Embed</span>
                  </div>
                  <input
                    type="url"
                    value={formData.baraatVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, baraatVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>

                {/* 5. Nikah Ceremony Video */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-blue-950 text-[11px]">
                      {language === 'ur' ? '۴. نکاح تقریب کی ویڈیو (Nikah Video URL)' : '4. Sacred Nikah Video'}
                    </label>
                    <span className="text-[10px] text-blue-700 font-mono">YouTube URL / Embed</span>
                  </div>
                  <input
                    type="url"
                    value={formData.nikahVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, nikahVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>

                {/* 6. Rukhsati Ceremony Video */}
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-purple-950 text-[11px]">
                      {language === 'ur' ? '۵. رخصتی تقریب کی ویڈیو (Rukhsati Video URL)' : '5. Emotional Rukhsati Video'}
                    </label>
                    <span className="text-[10px] text-purple-700 font-mono">YouTube URL / Embed</span>
                  </div>
                  <input
                    type="url"
                    value={formData.rukhsatiVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, rukhsatiVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cloud Sync Assurance Note */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="leading-snug">
              {language === 'ur'
                ? '☁️ کلاؤڈ لائیو مطابقت پذیری: آپ جو بھی تبدیلی کریں گے وہ کلاؤڈ میں محفوظ ہو جائے گی اور لنک شیئر کرنے پر تمام مہمانوں کو وہی نظر آئے گی۔'
                : language === 'hi'
                ? '☁️ क्लाउड लाइव सिंक: आप जो भी बदलाव करेंगे वो ऑनलाइन क्लाउड में सुरक्षित होगा और लिंक शेयर करने पर हर व्यक्ति को वही दिखेगा।'
                : '☁️ Cloud Live Sync: Any changes you save here are stored in the cloud and instantly reflected for anyone opening the shared link.'}
            </p>
          </div>

          {/* Bottom Save / Actions Bar */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
            >
              {language === 'ur'
                ? 'منسوخ کریں (Cancel)'
                : language === 'hi'
                ? 'रद्द करें (Cancel)'
                : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1a3a4d] to-[#2c5f7c] hover:from-[#2c5f7c] hover:to-[#1a3a4d] text-[#ffeaa7] text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 border border-[#d4af37]/40"
            >
              <Check className="w-4 h-4 text-[#ffeaa7]" />
              <span>
                {language === 'ur'
                  ? 'محفوظ کریں اور لاگو کریں (Save & Apply)'
                  : language === 'hi'
                  ? 'सुरक्षित करें व लागू करें (Save & Apply)'
                  : 'Save & Apply Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
