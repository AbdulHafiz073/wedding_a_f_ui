import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Calendar, 
  MapPin, 
  User, 
  Lock, 
  Unlock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Users, 
  Plus, 
  Trash2, 
  Video, 
  Film, 
  Cloud, 
  Download, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HeartHandshake,
  Upload,
  FolderOpen,
  Image as ImageIcon,
  DoorOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WeddingData, Language, FamilyMember, RsvpData } from '../types';
import { subscribeToCloudRsvps, saveWeddingDataToCloud } from '../lib/firebase';

interface OwnerAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeddingData;
  onSave: (updated: WeddingData) => void;
  language: Language;
}

type AdminTab = 'names' | 'videos' | 'family' | 'datetime' | 'location' | 'rsvps' | 'security';

export const ROYAL_GATE_PRESETS = [
  {
    name: 'Classic Royal Nikah',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=85'
  },
  {
    name: 'Traditional Royal Attire',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=85'
  },
  {
    name: 'Grand Stage Elegance',
    url: 'https://images.unsplash.com/photo-1623934820753-472496997f47?w=1000&auto=format&fit=crop&q=85'
  },
  {
    name: 'Floral Arch Bliss',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1000&auto=format&fit=crop&q=85'
  }
];

export const OwnerAdminPanel: React.FC<OwnerAdminPanelProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  language
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('owner_auth_verified') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WeddingData>({ ...data });
  const [activeTab, setActiveTab] = useState<AdminTab>('names');
  const [ceremonyBoxFilter, setCeremonyBoxFilter] = useState<'all' | 'haldi' | 'mehndi' | 'baraat' | 'nikah' | 'rukhsati' | 'main'>('all');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [showHelperPin, setShowHelperPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  // Tabs Slider ref & scroll state for mobile and small screens
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkTabsScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkTabsScroll();
    window.addEventListener('resize', checkTabsScroll);
    return () => window.removeEventListener('resize', checkTabsScroll);
  }, [isOpen, isAuthenticated]);

  const slideTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkTabsScroll, 250);
    }
  };

  // RSVPs State
  const [rsvps, setRsvps] = useState<RsvpData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync with incoming data
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...data });
    }
  }, [isOpen, data]);

  // Subscribe to RSVPs for owner review
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const unsubscribe = subscribeToCloudRsvps((list) => {
        setRsvps(list);
      });
      return () => unsubscribe();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const currentAdminPin = data.adminPin || '7860';

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === currentAdminPin.trim()) {
      setIsAuthenticated(true);
      sessionStorage.setItem('owner_auth_verified', 'true');
      setPinError(false);
      setEnteredPin('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('owner_auth_verified');
    onClose();
  };

  // Helper to compress local images from phone/computer gallery to lightweight Base64
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSetGatePhoto = (url: string) => {
    setFormData(prev => ({
      ...prev,
      coupleImageUrl: url,
      coupleImages: url ? [url, ...(prev.coupleImages?.filter(x => x !== url) || [])] : []
    }));
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      handleSetGatePhoto(compressed);
      setSaveSuccessMsg('Gate Opening photo updated! Click "Save All Changes to Cloud" to make it live.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Error reading image file:', err);
    }
  };

  const handleGroomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setFormData(prev => ({ ...prev, groomImageUrl: compressed }));
      setSaveSuccessMsg('Groom photo (Left side) updated! Click "Save All Changes to Cloud" to apply.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Error reading groom image file:', err);
    }
  };

  const handleBrideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setFormData(prev => ({ ...prev, brideImageUrl: compressed }));
      setSaveSuccessMsg('Bride photo (Right side) updated! Click "Save All Changes to Cloud" to apply.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Error reading bride image file:', err);
    }
  };

  const handleVideoFilePick = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: keyof WeddingData) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size <= 8 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, [fieldKey]: event.target!.result as string }));
          setSaveSuccessMsg('Video file loaded from device! Click Save to apply.');
          setTimeout(() => setSaveSuccessMsg(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [fieldKey]: objectUrl }));
      setSaveSuccessMsg('Video selected! (Tip: For 10MB+ videos, YouTube links give fastest streaming for guests)');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Add family member
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
      setFormData({
        ...formData,
        groomFamily: {
          ...formData.groomFamily,
          members: [...formData.groomFamily.members, newMember]
        }
      });
    } else {
      setFormData({
        ...formData,
        brideFamily: {
          ...formData.brideFamily,
          members: [...formData.brideFamily.members, newMember]
        }
      });
    }
  };

  const handleRemoveMember = (side: 'groom' | 'bride', id: string) => {
    if (side === 'groom') {
      setFormData({
        ...formData,
        groomFamily: {
          ...formData.groomFamily,
          members: formData.groomFamily.members.filter(m => m.id !== id)
        }
      });
    } else {
      setFormData({
        ...formData,
        brideFamily: {
          ...formData.brideFamily,
          members: formData.brideFamily.members.filter(m => m.id !== id)
        }
      });
    }
  };

  const handleMemberChange = (
    side: 'groom' | 'bride',
    id: string,
    field: keyof FamilyMember,
    value: string
  ) => {
    if (side === 'groom') {
      setFormData({
        ...formData,
        groomFamily: {
          ...formData.groomFamily,
          members: formData.groomFamily.members.map(m =>
            m.id === id ? { ...m, [field]: value } : m
          )
        }
      });
    } else {
      setFormData({
        ...formData,
        brideFamily: {
          ...formData.brideFamily,
          members: formData.brideFamily.members.map(m =>
            m.id === id ? { ...m, [field]: value } : m
          )
        }
      });
    }
  };

  // Save changes to Cloud
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      await saveWeddingDataToCloud(formData);
      onSave(formData);
      setSaveSuccessMsg('All changes synced to Cloud! All guests will now see this update.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      onSave(formData);
      setSaveSuccessMsg('Saved locally (Offline mode).');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Change PIN handler
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      alert('Please enter at least 4 digits/characters for your secret PIN.');
      return;
    }
    const updated = { ...formData, adminPin: newPinInput.trim() };
    setFormData(updated);
    onSave(updated);
    setPinChangeSuccess(true);
    setNewPinInput('');
    setTimeout(() => setPinChangeSuccess(false), 4000);
  };

  // Export RSVPs to CSV
  const handleExportCsv = () => {
    if (rsvps.length === 0) {
      alert('No guest RSVPs yet to export.');
      return;
    }

    const headers = ['Guest Name', 'Attending', 'Number of Guests', 'Phone/Contact', 'Blessing Message', 'Submission Date'];
    const rows = rsvps.map(r => [
      `"${r.name.replace(/"/g, '""')}"`,
      r.attending ? 'Yes' : 'No',
      r.guestsCount || 1,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${r.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wedding_Guest_RSVPs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // 1. PIN LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md bg-gradient-to-b from-[#162235] to-[#0d1624] border-2 border-[#d4af37]/60 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f39c12] p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#0f172a] rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#d4af37]" />
              </div>
            </div>
            <h2 className="text-xl font-bold font-display text-[#ffeaa7]">
              صاحبِ دعوت پورٹل (Owner Portal)
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              Private panel for changing dates, photos, ceremony videos, names & family members.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#d4af37]" />
                Enter Owner Security PIN / پاس ورڈ
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter 4-digit PIN"
                  className={`w-full px-4 py-3 bg-[#0a101d] border ${
                    pinError ? 'border-red-500' : 'border-[#d4af37]/40 focus:border-[#d4af37]'
                  } rounded-xl text-center text-xl tracking-widest font-mono text-white placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-sm outline-none transition-all`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <p className="text-red-400 text-xs mt-1.5 text-center font-medium">
                  Invalid PIN! Please check and try again.
                </p>
              )}
            </div>

            {/* Security PIN Protection & Discretion */}
            <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-3 text-[11px] text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-300">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                Owner PIN Protected:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#ffeaa7] bg-black/50 px-2.5 py-0.5 rounded border border-[#d4af37]/40">
                  {showHelperPin ? currentAdminPin : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHelperPin(!showHelperPin)}
                  className="text-[10px] text-[#ffeaa7] hover:text-white underline cursor-pointer"
                  title={showHelperPin ? 'Hide default password' : 'Show default password'}
                >
                  {showHelperPin ? 'Hide' : 'Reveal'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b89125] hover:from-[#e5c158] hover:to-[#cfa735] text-[#0f172a] font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Unlock className="w-4 h-4" />
              Unlock Owner Dashboard
            </button>
          </form>

          <p className="text-[10px] text-center text-gray-400 mt-4">
            Only the wedding host/owner can access this panel.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED OWNER DASHBOARD
  // ==========================================
  const attendingCount = rsvps.filter(r => r.attending).reduce((sum, r) => sum + (r.guestsCount || 1), 0);
  const totalRsvpCount = rsvps.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-[#131d2e] to-[#0a111c] border-2 border-[#d4af37]/70 rounded-3xl flex flex-col text-white shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#d4af37]/30 bg-[#0f1826] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#e67e22] p-0.5 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0a111c] rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-[#ffeaa7]">
                  Owner Management Dashboard
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">
                  <Cloud className="w-3 h-3" /> Live Cloud Sync
                </span>
              </div>
              <p className="text-xs text-gray-400">
                You have exclusive access to update text, videos, photos, and family details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const secretLink = `${window.location.origin}${window.location.pathname}?admin=true`;
                navigator.clipboard.writeText(secretLink);
                setSaveSuccessMsg('Secret Admin Link copied to clipboard! Keep this private for yourself.');
                setTimeout(() => setSaveSuccessMsg(''), 4000);
              }}
              title="Copy Secret Admin Link"
              className="px-2.5 py-1.5 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#ffeaa7] border border-[#d4af37]/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Copy Admin Link</span>
            </button>
            <button
              onClick={handleLogout}
              title="Lock & Logout"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cloud Notification Banner */}
        {saveSuccessMsg && (
          <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              {saveSuccessMsg}
            </span>
            <span className="text-[10px] text-emerald-300">All guests will see this live</span>
          </div>
        )}

        {/* Navigation Tabs Bar with Mobile Slider Controls */}
        <div className="relative bg-[#090f19] border-b border-white/10 select-none">
          {/* Left Arrow Slide Button (Visible when scrolled) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => slideTabs('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#1e293b]/95 hover:bg-[#d4af37] text-white hover:text-black border border-white/20 shadow-lg flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
              aria-label="Slide tabs left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right Arrow Slide Button (Visible when can scroll right) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => slideTabs('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#1e293b]/95 hover:bg-[#d4af37] text-white hover:text-black border border-white/20 shadow-lg flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
              aria-label="Slide tabs right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Left / Right Gradient Fade cues for smooth slider look */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#090f19] to-transparent z-5 transition-opacity ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#090f19] to-transparent z-5 transition-opacity ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Scrollable Tabs Slider Container */}
          <div
            ref={tabsContainerRef}
            onScroll={checkTabsScroll}
            className="flex items-center gap-1.5 p-2 px-3 overflow-x-auto no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <button
              onClick={() => setActiveTab('names')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'names'
                  ? 'bg-[#d4af37] text-[#0f172a] shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              1. Names & Couple
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-[#d4af37] text-[#0f172a] shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5 text-amber-300" />
              2. 🚪 Gate & Side Photos (گیٹ اور دونوں سائیڈ کی تصاویر)
            </button>

            <button
              onClick={() => setActiveTab('family')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'family'
                  ? 'bg-[#d4af37] text-[#0f172a] shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              3. Family Members (اہلِ خانہ)
            </button>

            <button
              onClick={() => setActiveTab('datetime')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'datetime'
                  ? 'bg-[#d4af37] text-[#0f172a] shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              4. Date & Countdown
            </button>

            <button
              onClick={() => setActiveTab('location')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'location'
                  ? 'bg-[#d4af37] text-[#0f172a] shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              5. Venue & Maps
            </button>

            <button
              onClick={() => setActiveTab('rsvps')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'rsvps'
                  ? 'bg-[#d4af37] text-[#0f172a] shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              6. Guest RSVPs ({totalRsvpCount})
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#d4af37] text-[#0f172a] shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              7. Owner PIN
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          
          {/* ======================================================== */}
          {/* TAB 1: NAMES & COUPLE */}
          {/* ======================================================== */}
          {activeTab === 'names' && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-[#ffeaa7] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d4af37]" />
                  Groom Details (دولہا کے کوائف)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">English Name</label>
                    <input
                      type="text"
                      value={formData.groomNameEn}
                      onChange={(e) => setFormData({ ...formData, groomNameEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Urdu Name (اردو)</label>
                    <input
                      type="text"
                      value={formData.groomNameUr}
                      dir="rtl"
                      onChange={(e) => setFormData({ ...formData, groomNameUr: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Hindi Name (हिन्दी)</label>
                    <input
                      type="text"
                      value={formData.groomNameHi || ''}
                      onChange={(e) => setFormData({ ...formData, groomNameHi: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-[#ffeaa7] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d4af37]" />
                  Bride Details (دلہن کے کوائف)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">English Name</label>
                    <input
                      type="text"
                      value={formData.brideNameEn}
                      onChange={(e) => setFormData({ ...formData, brideNameEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Urdu Name (اردو)</label>
                    <input
                      type="text"
                      value={formData.brideNameUr}
                      dir="rtl"
                      onChange={(e) => setFormData({ ...formData, brideNameUr: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Hindi Name (हिन्दी)</label>
                    <input
                      type="text"
                      value={formData.brideNameHi || ''}
                      onChange={(e) => setFormData({ ...formData, brideNameHi: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-[#ffeaa7] mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  Welcome Message & Dua
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Welcome Message (English)</label>
                    <textarea
                      rows={2}
                      value={formData.welcomeMessageEn}
                      onChange={(e) => setFormData({ ...formData, welcomeMessageEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Welcome Dua & Greeting (اردو)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={formData.welcomeMessageUr}
                      onChange={(e) => setFormData({ ...formData, welcomeMessageUr: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs text-amber-300 font-bold mb-1">
                      🪙 Scratch Reveal Secret Surprise Message (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.scratchSurpriseMessageEn || ''}
                      onChange={(e) => setFormData({ ...formData, scratchSurpriseMessageEn: e.target.value })}
                      placeholder="Special secret invitation blessing shown after scratch reveal..."
                      className="w-full px-3 py-2 bg-[#090f19] border border-amber-400/30 rounded-xl text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-amber-300 font-bold mb-1">
                      🪙 سکریچ ریویل کا خفیہ پیغام و خاص دعا (اردو)
                    </label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={formData.scratchSurpriseMessageUr || ''}
                      onChange={(e) => setFormData({ ...formData, scratchSurpriseMessageUr: e.target.value })}
                      placeholder="سونے کا سکہ کھرچنے کے بعد ظاہر ہونے والی خصوصی دعا یا پیغام..."
                      className="w-full px-3 py-2 bg-[#090f19] border border-amber-400/30 rounded-xl text-white font-urdu outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Gate Photos Overview in Tab 1 */}
              <div className="bg-[#d4af37]/10 border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d4af37]/20 pb-2.5">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#ffeaa7] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#d4af37]" />
                      شاہی گیٹ اور سائیڈ تصاویر (Gate & Left-Right Photos)
                    </h4>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      گیٹ کے بائیں طرف دولہا، دائیں طرف دلہن اور گیٹ کھلنے پر ریویل تصویر لائیو نظر آتی ہے۔
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('videos')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89125] hover:from-[#e5c158] hover:to-[#cfa735] text-[#0f172a] text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>تصاویر تبدیل کریں (Change Photos) ➔</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
                  {/* Left Groom Thumbnail */}
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-black/30 border border-sky-400/20">
                    <span className="text-[10px] text-sky-300 font-bold mb-1">1. بائیں (دولہا)</span>
                    <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-t-xl rounded-b-md overflow-hidden border border-[#d4af37] shadow-sm bg-black/60">
                      <img
                        src={formData.groomImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85'}
                        alt="Groom"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  {/* Center Gate Reveal Thumbnail */}
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-black/30 border border-amber-400/30">
                    <span className="text-[10px] text-amber-300 font-bold mb-1">2. گیٹ ریویل</span>
                    <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-t-xl rounded-b-md overflow-hidden border-2 border-[#d4af37] shadow-md bg-black/60">
                      <img
                        src={formData.coupleImageUrl || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80'}
                        alt="Gate Reveal"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Right Bride Thumbnail */}
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-black/30 border border-rose-400/20">
                    <span className="text-[10px] text-rose-300 font-bold mb-1">3. دائیں (دلہن)</span>
                    <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-t-xl rounded-b-md overflow-hidden border border-[#d4af37] shadow-sm bg-black/60">
                      <img
                        src={formData.brideImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85'}
                        alt="Bride"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: VIDEOS & PHOTO (ALL 5 CEREMONIES + JANNAT GATE) */}
          {/* ======================================================== */}
          {activeTab === 'videos' && (
            <div className="space-y-5">
              <div className="p-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl text-xs text-gray-200">
                💡 <strong>Photo & Video options:</strong> You can either <strong>choose directly from your phone/computer gallery</strong> or <strong>paste any YouTube / MP4 video link</strong>. All changes sync dynamically!
              </div>

              {/* ======================================================== */}
              {/* 1. GATE OPENING REVEAL PHOTO (گیٹ کھلنے والی تصویر) */}
              {/* ======================================================== */}
              <div className="bg-gradient-to-b from-[#182638] to-[#0e1724] border-2 border-[#d4af37]/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d4af37]/20 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#ffeaa7] flex items-center gap-2">
                      <DoorOpen className="w-5 h-5 text-[#d4af37]" />
                      1. گیٹ کھلنے پر نظر آنے والی شاہی تصویر (Gate Opening Reveal Photo)
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      جب مہمان یا آپ شاہی گیٹ پر ٹیپ کرتے ہیں اور دروازہ کھلتا ہے تو یہ تصویر سامنے آتی ہے۔
                    </p>
                  </div>
                  <span className="text-[11px] text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full font-medium shrink-0 self-start sm:self-auto">
                    ✓ Live Gate Sync
                  </span>
                </div>

                {/* Upload or URL Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Gallery File Upload */}
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#d4af37]/60 hover:border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 cursor-pointer transition-all text-center group">
                    <Upload className="w-6 h-6 text-[#d4af37] mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">📁 Choose from Phone / Computer</span>
                    <span className="text-[11px] text-[#ffeaa7] mt-0.5">گیلری سے دلہا دلہن کی تصویر لگائیں</span>
                    <span className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP (Auto-optimized)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Option B: Direct Image URL */}
                  <div className="flex flex-col justify-between p-3 rounded-xl bg-[#090f19] border border-white/15">
                    <div>
                      <label className="text-xs font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                        🔗 Or Paste Direct Image URL (انٹرنیٹ لنک):
                      </label>
                      <input
                        type="text"
                        value={formData.coupleImageUrl || ''}
                        onChange={(e) => handleSetGatePhoto(e.target.value)}
                        placeholder="https://example.com/couple-photo.jpg"
                        className="w-full px-3 py-2 bg-[#0d1624] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      💡 Aap Imgur, Cloudinary, Drive ya koi bhi direct photo link paste kar sakte hain.
                    </p>
                  </div>
                </div>

                {/* 1-Click Royal Presets */}
                <div>
                  <label className="text-xs font-semibold text-[#ffeaa7] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    یا خوبصورت تیار شاہی تصویر منتخب کریں (Quick 1-Click Royal Presets):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ROYAL_GATE_PRESETS.map((preset, pIdx) => {
                      const isSelected = (formData.coupleImageUrl || '').includes(preset.url.split('?')[0]);
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleSetGatePhoto(preset.url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all p-1.5 flex flex-col items-center gap-1 cursor-pointer text-left ${
                            isSelected
                              ? 'border-[#d4af37] bg-[#d4af37]/20 shadow-md scale-102'
                              : 'border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10'
                          }`}
                        >
                          <div className="w-full h-20 rounded-lg overflow-hidden relative">
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#d4af37] text-[#0f172a] flex items-center justify-center font-bold text-xs shadow-md">
                                ✓
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-gray-300 truncate w-full text-center">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Gate Preview Frame */}
                {formData.coupleImageUrl && (
                  <div className="mt-3 p-4 bg-[#090f19] rounded-2xl border border-[#d4af37]/40 flex flex-col sm:flex-row items-center gap-4">
                    {/* Arched Gate Preview */}
                    <div className="relative w-32 h-44 rounded-t-[50px] overflow-hidden border-2 border-[#d4af37] shadow-xl shrink-0 bg-black/60">
                      <img
                        src={formData.coupleImageUrl}
                        alt="Gate Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end p-2 text-center">
                        <span className="text-[10px] font-bold text-[#ffeaa7] font-urdu truncate w-full">
                          {formData.groomNameUr || 'عبد القادر'} ❤️ {formData.brideNameUr || 'فوزیہ'}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-white font-semibold">
                          Gate Reveal Photo
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 text-xs text-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                          <Check className="w-4 h-4 text-emerald-400" />
                          تصویر کامیابی سے لگ گئی ہے (Gate Photo Ready)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetGatePhoto('')}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        جیسے ہی کوئی مہمان یا آپ گیٹ پر ٹیپ کریں گے، دروازہ کھلتے ہی سامنے یہ تصویر نظر آئے گی۔ نیچے <strong>"Save All Changes to Cloud"</strong> پر کلک کر کے محفوظ کر لیں۔
                      </p>
                      <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-[10px] text-amber-200">
                        ✨ <strong>Tip:</strong> بہترین ویو کے لیے پورٹریٹ (Vertical/کھڑی) تصویر سب سے اچھی نظر آتی ہے۔
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Window View Left & Right Groom & Bride Hanging Photos */}
              <div className="bg-gradient-to-br from-[#1a2936]/80 via-[#0d1721]/90 to-[#121b24]/80 border-2 border-[#d4af37]/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#ffeaa7] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#d4af37]" />
                      گیٹ کے بائیں اور دائیں طرف تصاویر (Left & Right Hanging Photos)
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      ٹ themبلٹ اور ونڈو ویو میں گیٹ کے بائیں طرف دولہا (Groom) اور دائیں طرف دلہن (Bride) کی جھولتی ہوئی شاہی تصویر دکھائی دے گی۔
                    </p>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[11px] text-amber-200 font-medium whitespace-nowrap self-start sm:self-auto">
                    📱 Tablet & Window View
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* LEFT: Groom Hanging Photo */}
                  <div className="p-4 bg-white/5 rounded-2xl border border-sky-400/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xs font-bold text-sky-300">
                          1
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-sky-200">
                            دولہا کی تصویر (Left Side - Groom)
                          </h4>
                          <p className="text-[10px] text-gray-400">گیٹ کے بائیں طرف رسی سے لٹکے گی</p>
                        </div>
                      </div>
                      {formData.groomImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, groomImageUrl: '' }))}
                          className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                        >
                          تصویر ہٹائیں
                        </button>
                      )}
                    </div>

                    {/* Preview Box & Upload Controls */}
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-28 rounded-t-2xl rounded-b-lg overflow-hidden border-2 border-[#d4af37] bg-black/50 shrink-0 shadow-md relative group">
                        {formData.groomImageUrl ? (
                          <img
                            src={formData.groomImageUrl}
                            alt="Groom Preview"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-gray-500 p-1 text-center">
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* Device File Upload Button */}
                        <label className="w-full px-3 py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md">
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>فون یا کمپیوٹر سے اپلوڈ کریں</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleGroomImageUpload}
                            className="hidden"
                          />
                        </label>

                        {/* URL input */}
                        <input
                          type="url"
                          value={formData.groomImageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, groomImageUrl: e.target.value })}
                          placeholder="یا امیج URL پیسٹ کریں..."
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white font-mono placeholder:text-gray-500 focus:border-sky-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Photos */}
                    <div>
                      <span className="block text-[10px] text-gray-400 mb-1 font-medium">نمونہ تصاویر (Quick Presets):</span>
                      <div className="flex items-center gap-2">
                        {[
                          { label: 'Sherwani', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85' },
                          { label: 'Royal Groom', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=85' },
                          { label: 'Festive', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=85' },
                        ].map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, groomImageUrl: p.url }))}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                              formData.groomImageUrl === p.url
                                ? 'bg-sky-500 text-white font-bold'
                                : 'bg-white/10 text-gray-300 hover:bg-white/15'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Bride Hanging Photo */}
                  <div className="p-4 bg-white/5 rounded-2xl border border-rose-400/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-xs font-bold text-rose-300">
                          2
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-rose-200">
                            دلہن کی تصویر (Right Side - Bride)
                          </h4>
                          <p className="text-[10px] text-gray-400">گیٹ کے دائیں طرف رسی سے لٹکے گی</p>
                        </div>
                      </div>
                      {formData.brideImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, brideImageUrl: '' }))}
                          className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                        >
                          تصویر ہٹائیں
                        </button>
                      )}
                    </div>

                    {/* Preview Box & Upload Controls */}
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-28 rounded-t-2xl rounded-b-lg overflow-hidden border-2 border-[#d4af37] bg-black/50 shrink-0 shadow-md relative group">
                        {formData.brideImageUrl ? (
                          <img
                            src={formData.brideImageUrl}
                            alt="Bride Preview"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-gray-500 p-1 text-center">
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* Device File Upload Button */}
                        <label className="w-full px-3 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md">
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>فون یا کمپیوٹر سے اپلوڈ کریں</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBrideImageUpload}
                            className="hidden"
                          />
                        </label>

                        {/* URL input */}
                        <input
                          type="url"
                          value={formData.brideImageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, brideImageUrl: e.target.value })}
                          placeholder="یا امیج URL پیسٹ کریں..."
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white font-mono placeholder:text-gray-500 focus:border-rose-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Photos */}
                    <div>
                      <span className="block text-[10px] text-gray-400 mb-1 font-medium">نمونہ تصاویر (Quick Presets):</span>
                      <div className="flex items-center gap-2">
                        {[
                          { label: 'Royal Bride', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85' },
                          { label: 'Bridal Portrait', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=85' },
                          { label: 'Traditional', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=85' },
                        ].map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, brideImageUrl: p.url }))}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                              formData.brideImageUrl === p.url
                                ? 'bg-rose-500 text-white font-bold'
                                : 'bg-white/10 text-gray-300 hover:bg-white/15'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-200">
                  <span>💡 تبدیلیاں لائیو کرنے کے لیے نیچے دیے گئے <strong>"Save All Changes to Cloud"</strong> بٹن کو کلک کریں۔</span>
                </div>
              </div>


              {/* Jannat Gate Video */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-[#ffeaa7] mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#d4af37]" />
                  2. Jannat Gate Intro Video
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.jannatVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, jannatVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="flex-1 px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                  <label className="px-3 py-2 bg-white/10 hover:bg-[#d4af37]/20 hover:text-[#d4af37] border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Video File</span>
                    <span className="sm:hidden">Upload</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFilePick(e, 'jannatVideoUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Ceremony 1: Haldi */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-[#f1c40f] mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#f1c40f]" />
                  3. Dedicated Haldi Ceremony Video (ہلدی تقریب)
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.haldiVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, haldiVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="flex-1 px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#f1c40f]"
                  />
                  <label className="px-3 py-2 bg-white/10 hover:bg-[#f1c40f]/20 hover:text-[#f1c40f] border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Video File</span>
                    <span className="sm:hidden">Upload</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFilePick(e, 'haldiVideoUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Ceremony 2: Mehndi */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-[#2ecc71] mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#2ecc71]" />
                  4. Dedicated Mehndi Ceremony Video (جشنِ حنا)
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.mehndiVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, mehndiVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="flex-1 px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#2ecc71]"
                  />
                  <label className="px-3 py-2 bg-white/10 hover:bg-[#2ecc71]/20 hover:text-[#2ecc71] border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Video File</span>
                    <span className="sm:hidden">Upload</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFilePick(e, 'mehndiVideoUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Ceremony 3: Baraat */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-[#e67e22] mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#e67e22]" />
                  5. Dedicated Royal Baraat Procession Video (آمدِ بارات)
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.baraatVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, baraatVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="flex-1 px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#e67e22]"
                  />
                  <label className="px-3 py-2 bg-white/10 hover:bg-[#e67e22]/20 hover:text-[#e67e22] border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Video File</span>
                    <span className="sm:hidden">Upload</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFilePick(e, 'baraatVideoUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Ceremony 4: Sacred Nikah */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-[#d4af37] mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#d4af37]" />
                  6. Dedicated Sacred Nikah Video (مقدس نکاح)
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.nikahVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, nikahVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="flex-1 px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                  <label className="px-3 py-2 bg-white/10 hover:bg-[#d4af37]/20 hover:text-[#d4af37] border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Video File</span>
                    <span className="sm:hidden">Upload</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFilePick(e, 'nikahVideoUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Ceremony 5: Rukhsati */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-[#e74c3c] mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#e74c3c]" />
                  7. Dedicated Emotional Rukhsati Video (سایۂ قرآن رخصتی)
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.rukhsatiVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, rukhsatiVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="flex-1 px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#e74c3c]"
                  />
                  <label className="px-3 py-2 bg-white/10 hover:bg-[#e74c3c]/20 hover:text-[#e74c3c] border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Video File</span>
                    <span className="sm:hidden">Upload</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFilePick(e, 'rukhsatiVideoUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: FAMILY MEMBERS (AHL-E-KHANA) */}
          {/* ======================================================== */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              {/* Groom's Family */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#ffeaa7] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#d4af37]" />
                    Groom's Family Honors (دولہا کا خاندان)
                  </h3>
                  <button
                    onClick={() => handleAddMember('groom')}
                    className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0f172a] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member
                  </button>
                </div>

                {/* Groom Family Badge / Logo Image */}
                <div className="p-3 bg-[#090f19] border border-amber-500/20 rounded-xl mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                      Groom's Family Badge / Logo / Icon Image
                    </label>
                    {formData.groomFamily.badgeImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          groomFamily: { ...formData.groomFamily, badgeImageUrl: undefined }
                        })}
                        className="text-[10px] text-red-400 hover:text-red-300"
                      >
                        Reset to 🤵 icon
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.groomFamily.badgeImageUrl ? (
                      <img
                        src={formData.groomFamily.badgeImageUrl}
                        alt="Groom Family Logo"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-xl shrink-0">
                        🤵
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        placeholder="Paste image / logo URL or use Upload"
                        value={formData.groomFamily.badgeImageUrl || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          groomFamily: { ...formData.groomFamily, badgeImageUrl: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium cursor-pointer border border-white/20 transition-all">
                        <Upload className="w-3 h-3 text-[#d4af37]" />
                        <span>Upload Family Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImageFile(file);
                                setFormData(prev => ({
                                  ...prev,
                                  groomFamily: { ...prev.groomFamily, badgeImageUrl: compressed }
                                }));
                                setSaveSuccessMsg('Groom Family logo uploaded! Click Save to apply.');
                                setTimeout(() => setSaveSuccessMsg(null), 3500);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-gray-300 mb-1">Parents Honor Intro (English)</label>
                  <input
                    type="text"
                    value={formData.groomFamily.parentsIntroEn || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      groomFamily: { ...formData.groomFamily, parentsIntroEn: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-3">
                  {formData.groomFamily.members.map((member) => (
                    <div key={member.id} className="p-3 bg-[#090f19] border border-white/10 rounded-xl space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Name (English)"
                            value={member.nameEn}
                            onChange={(e) => handleMemberChange('groom', member.id, 'nameEn', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Relation (e.g. Elder Brother)"
                            value={member.relationEn}
                            onChange={(e) => handleMemberChange('groom', member.id, 'relationEn', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRemoveMember('groom', member.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Member Photo Controls */}
                      <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.nameEn || 'Member'}
                            className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                            👤
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Member Photo URL (optional)"
                          value={member.imageUrl || ''}
                          onChange={(e) => handleMemberChange('groom', member.id, 'imageUrl', e.target.value)}
                          className="flex-1 px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-white text-[11px]"
                        />
                        <label className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium cursor-pointer border border-white/20 shrink-0 flex items-center gap-1">
                          <Upload className="w-2.5 h-2.5 text-[#d4af37]" />
                          <span>Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImageFile(file);
                                  handleMemberChange('groom', member.id, 'imageUrl', compressed);
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bride's Family */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#ffeaa7] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#d4af37]" />
                    Bride's Family Honors (دلہن کا خاندان)
                  </h3>
                  <button
                    onClick={() => handleAddMember('bride')}
                    className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0f172a] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member
                  </button>
                </div>

                {/* Bride Family Badge / Logo Image */}
                <div className="p-3 bg-[#090f19] border border-rose-500/20 rounded-xl mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                      Bride's Family Badge / Logo / Icon Image
                    </label>
                    {formData.brideFamily.badgeImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          brideFamily: { ...formData.brideFamily, badgeImageUrl: undefined }
                        })}
                        className="text-[10px] text-red-400 hover:text-red-300"
                      >
                        Reset to 👰 icon
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.brideFamily.badgeImageUrl ? (
                      <img
                        src={formData.brideFamily.badgeImageUrl}
                        alt="Bride Family Logo"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-rose-400 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-rose-400/20 border border-rose-400/50 flex items-center justify-center text-xl shrink-0">
                        👰
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        placeholder="Paste image / logo URL or use Upload"
                        value={formData.brideFamily.badgeImageUrl || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          brideFamily: { ...formData.brideFamily, badgeImageUrl: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs outline-none focus:border-rose-400"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium cursor-pointer border border-white/20 transition-all">
                        <Upload className="w-3 h-3 text-rose-400" />
                        <span>Upload Family Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImageFile(file);
                                setFormData(prev => ({
                                  ...prev,
                                  brideFamily: { ...prev.brideFamily, badgeImageUrl: compressed }
                                }));
                                setSaveSuccessMsg('Bride Family logo uploaded! Click Save to apply.');
                                setTimeout(() => setSaveSuccessMsg(null), 3500);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-gray-300 mb-1">Parents Honor Intro (English)</label>
                  <input
                    type="text"
                    value={formData.brideFamily.parentsIntroEn || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      brideFamily: { ...formData.brideFamily, parentsIntroEn: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-3">
                  {formData.brideFamily.members.map((member) => (
                    <div key={member.id} className="p-3 bg-[#090f19] border border-white/10 rounded-xl space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Name (English)"
                            value={member.nameEn}
                            onChange={(e) => handleMemberChange('bride', member.id, 'nameEn', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Relation (e.g. Sister)"
                            value={member.relationEn}
                            onChange={(e) => handleMemberChange('bride', member.id, 'relationEn', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRemoveMember('bride', member.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Member Photo Controls */}
                      <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.nameEn || 'Member'}
                            className="w-8 h-8 rounded-full object-cover border border-rose-400 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                            👤
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Member Photo URL (optional)"
                          value={member.imageUrl || ''}
                          onChange={(e) => handleMemberChange('bride', member.id, 'imageUrl', e.target.value)}
                          className="flex-1 px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-white text-[11px]"
                        />
                        <label className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium cursor-pointer border border-white/20 shrink-0 flex items-center gap-1">
                          <Upload className="w-2.5 h-2.5 text-rose-400" />
                          <span>Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImageFile(file);
                                  handleMemberChange('bride', member.id, 'imageUrl', compressed);
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: DATE, TIME & COUNTDOWN */}
          {/* ======================================================== */}
          {activeTab === 'datetime' && (
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-[#ffeaa7] mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  Wedding Date & Countdown Target
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">
                      ISO Date / Countdown Target (e.g. 2026-10-28T18:00:00)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.weddingDate ? formData.weddingDate.substring(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-sm outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-300 mb-1">Display Time String (English)</label>
                      <input
                        type="text"
                        value={formData.weddingTimeEn}
                        onChange={(e) => setFormData({ ...formData, weddingTimeEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-300 mb-1">Display Time String (اردو)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={formData.weddingTimeUr}
                        onChange={(e) => setFormData({ ...formData, weddingTimeUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: VENUE & CEREMONY CARDS (EACH BOX IN ITS OWN SECTION) */}
          {/* ======================================================== */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              {/* Introduction Banner with Box Selector Chips */}
              <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#ffeaa7] flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#d4af37]" />
                      Ceremony Locations & Cards (ہر کارڈ کا الگ سیکشن)
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      ہر تقریب کے کارڈ کا اپنا الگ مقام، پتہ، تاریخ، وقت اور گوگل میپ لنک ہے۔ آپ نیچے کسی بھی باکس کو الگ سے ایڈٹ کر سکتے ہیں۔
                    </p>
                  </div>
                  <span className="text-[11px] bg-[#d4af37]/20 text-[#ffeaa7] border border-[#d4af37]/40 px-3 py-1 rounded-full font-bold self-start sm:self-auto shrink-0">
                    6 Dedicated Sections
                  </span>
                </div>

                {/* Sub-filter / Jump-to chips */}
                <div className="flex items-center gap-1.5 mt-4 overflow-x-auto no-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={() => setCeremonyBoxFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      ceremonyBoxFilter === 'all'
                        ? 'bg-[#d4af37] text-gray-950 shadow-md'
                        : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    ✦ All Sections (سبھی)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeremonyBoxFilter('haldi')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      ceremonyBoxFilter === 'haldi'
                        ? 'bg-amber-500 text-gray-950 shadow-md'
                        : 'bg-white/10 text-amber-300 hover:bg-white/15'
                    }`}
                  >
                    <span>🌼</span> Haldi Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeremonyBoxFilter('mehndi')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      ceremonyBoxFilter === 'mehndi'
                        ? 'bg-emerald-500 text-gray-950 shadow-md'
                        : 'bg-white/10 text-emerald-300 hover:bg-white/15'
                    }`}
                  >
                    <span>🌿</span> Mehndi Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeremonyBoxFilter('baraat')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      ceremonyBoxFilter === 'baraat'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-white/10 text-rose-300 hover:bg-white/15'
                    }`}
                  >
                    <span>🎺</span> Baraat Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeremonyBoxFilter('nikah')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      ceremonyBoxFilter === 'nikah'
                        ? 'bg-teal-500 text-gray-950 shadow-md'
                        : 'bg-white/10 text-teal-300 hover:bg-white/15'
                    }`}
                  >
                    <span>💍</span> Nikah Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeremonyBoxFilter('rukhsati')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      ceremonyBoxFilter === 'rukhsati'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-white/10 text-pink-300 hover:bg-white/15'
                    }`}
                  >
                    <span>✨</span> Rukhsati Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeremonyBoxFilter('main')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                      ceremonyBoxFilter === 'main'
                        ? 'bg-[#ffeaa7] text-gray-950 shadow-md'
                        : 'bg-white/10 text-[#ffeaa7] hover:bg-white/15'
                    }`}
                  >
                    <span>🏛️</span> Main Venue & Hall
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION 1: HALDI CEREMONY BOX (ہلدی کارڈ باکس) */}
              {/* ========================================================= */}
              {(ceremonyBoxFilter === 'all' || ceremonyBoxFilter === 'haldi') && (
                <div className="bg-gradient-to-b from-amber-950/30 to-amber-900/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-lg">
                        🌼
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-amber-300 flex items-center gap-2">
                          1. Haldi Ceremony Box (ہلدی کارڈ سیکشن)
                        </h4>
                        <p className="text-[11px] text-gray-300">
                          Dedicated location, address, date & Google Map link for Haldi card
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                      Haldi Box
                    </span>
                  </div>

                  {/* 1. Venue / Hall Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-amber-200">
                      Haldi Location / Hall Name (ہلدی کا مقام / ہال)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English (e.g. Royal Sunlit Courtyard, Dubai)"
                        value={formData.haldiLocationEn || ''}
                        onChange={(e) => setFormData({ ...formData, haldiLocationEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو (مثلاً سن لِٹ رائل کورٹ یارڈ، دبئی)"
                        value={formData.haldiLocationUr || ''}
                        onChange={(e) => setFormData({ ...formData, haldiLocationUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी (जैसे: सन लिट रॉयल कोर्टयार्ड, दुबई)"
                        value={formData.haldiLocationHi || ''}
                        onChange={(e) => setFormData({ ...formData, haldiLocationHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* 2. Street / Area Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-amber-200">
                      Haldi Specific Address (ہلدی کا مکمل پتہ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English Address"
                        value={formData.haldiAddressEn || ''}
                        onChange={(e) => setFormData({ ...formData, haldiAddressEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو پتہ"
                        value={formData.haldiAddressUr || ''}
                        onChange={(e) => setFormData({ ...formData, haldiAddressUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी पता"
                        value={formData.haldiAddressHi || ''}
                        onChange={(e) => setFormData({ ...formData, haldiAddressHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* 3. Date & Time Strings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-amber-200">Haldi Date (تاریخ)</label>
                      <input
                        type="text"
                        placeholder="English Date (e.g. Oct 26, 2026)"
                        value={formData.haldiDateEn || ''}
                        onChange={(e) => setFormData({ ...formData, haldiDateEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-amber-200">Haldi Time (وقت)</label>
                      <input
                        type="text"
                        placeholder="English Time (e.g. 10:30 AM)"
                        value={formData.haldiTimeEn || ''}
                        onChange={(e) => setFormData({ ...formData, haldiTimeEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* 4. Google Maps Link */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-bold text-amber-200 flex items-center justify-between">
                      <span>Haldi Google Maps Direct Link</span>
                      {formData.haldiMapUrl && (
                        <a
                          href={formData.haldiMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                        >
                          Test Link ↗
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.haldiMapUrl || ''}
                      onChange={(e) => setFormData({ ...formData, haldiMapUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SECTION 2: MEHNDI CEREMONY BOX (مہندی کارڈ باکس) */}
              {/* ========================================================= */}
              {(ceremonyBoxFilter === 'all' || ceremonyBoxFilter === 'mehndi') && (
                <div className="bg-gradient-to-b from-emerald-950/30 to-emerald-900/10 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-lg">
                        🌿
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                          2. Mehndi Night Box (مہندی کارڈ سیکشن)
                        </h4>
                        <p className="text-[11px] text-gray-300">
                          Dedicated location, address, date & Google Map link for Mehndi card
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Mehndi Box
                    </span>
                  </div>

                  {/* 1. Venue / Hall Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-emerald-200">
                      Mehndi Location / Hall Name (مہندی کا مقام / ہال)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English (e.g. The Royal Palm Garden, Dubai)"
                        value={formData.mehndiLocationEn || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiLocationEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو (مثلاً دی رائل پام گارڈن، دبئی)"
                        value={formData.mehndiLocationUr || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiLocationUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी (जैसे: द रॉयल पाम गार्डन, दुबई)"
                        value={formData.mehndiLocationHi || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiLocationHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* 2. Street / Area Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-emerald-200">
                      Mehndi Specific Address (مہندی کا مکمل پتہ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English Address"
                        value={formData.mehndiAddressEn || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiAddressEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو پتہ"
                        value={formData.mehndiAddressUr || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiAddressUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी पता"
                        value={formData.mehndiAddressHi || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiAddressHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* 3. Date & Time Strings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-emerald-200">Mehndi Date (تاریخ)</label>
                      <input
                        type="text"
                        placeholder="English Date (e.g. Oct 27, 2026)"
                        value={formData.mehndiDateEn || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiDateEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-emerald-200">Mehndi Time (وقت)</label>
                      <input
                        type="text"
                        placeholder="English Time (e.g. 7:00 PM)"
                        value={formData.mehndiTimeEn || ''}
                        onChange={(e) => setFormData({ ...formData, mehndiTimeEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* 4. Google Maps Link */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-bold text-emerald-200 flex items-center justify-between">
                      <span>Mehndi Google Maps Direct Link</span>
                      {formData.mehndiMapUrl && (
                        <a
                          href={formData.mehndiMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Test Link ↗
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.mehndiMapUrl || ''}
                      onChange={(e) => setFormData({ ...formData, mehndiMapUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SECTION 3: BARAAT CEREMONY BOX (بارات کارڈ باکس) */}
              {/* ========================================================= */}
              {(ceremonyBoxFilter === 'all' || ceremonyBoxFilter === 'baraat') && (
                <div className="bg-gradient-to-b from-rose-950/30 to-rose-900/10 border-2 border-rose-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center font-bold text-lg">
                        🎺
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-rose-300 flex items-center gap-2">
                          3. Baraat Procession Box (بارات کارڈ سیکشن)
                        </h4>
                        <p className="text-[11px] text-gray-300">
                          Dedicated departure location, assembly point, date & Google Map link for Baraat card
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30">
                      Baraat Box
                    </span>
                  </div>

                  {/* 1. Venue / Hall Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-rose-200">
                      Baraat Location / Departure Point (بارات کی روانگی کا مقام)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English (e.g. Burj Al Arab Grand Concourse, Dubai)"
                        value={formData.baraatLocationEn || ''}
                        onChange={(e) => setFormData({ ...formData, baraatLocationEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-rose-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو (مثلاً برج العرب گرینڈ کنکورس، دبئی)"
                        value={formData.baraatLocationUr || ''}
                        onChange={(e) => setFormData({ ...formData, baraatLocationUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-rose-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी (जैसे: बुर्ज अल अरब ग्रैंड कॉन्कोर्स, दुबई)"
                        value={formData.baraatLocationHi || ''}
                        onChange={(e) => setFormData({ ...formData, baraatLocationHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  {/* 2. Street / Area Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-rose-200">
                      Baraat Specific Address (بارات کا مکمل پتہ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English Address"
                        value={formData.baraatAddressEn || ''}
                        onChange={(e) => setFormData({ ...formData, baraatAddressEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-rose-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو پتہ"
                        value={formData.baraatAddressUr || ''}
                        onChange={(e) => setFormData({ ...formData, baraatAddressUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-rose-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी पता"
                        value={formData.baraatAddressHi || ''}
                        onChange={(e) => setFormData({ ...formData, baraatAddressHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  {/* 3. Date & Time Strings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-rose-200">Baraat Date (تاریخ)</label>
                      <input
                        type="text"
                        placeholder="English Date (e.g. Oct 28, 2026)"
                        value={formData.baraatDateEn || ''}
                        onChange={(e) => setFormData({ ...formData, baraatDateEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-rose-200">Baraat Time (وقت)</label>
                      <input
                        type="text"
                        placeholder="English Time (e.g. 5:30 PM)"
                        value={formData.baraatTimeEn || ''}
                        onChange={(e) => setFormData({ ...formData, baraatTimeEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  {/* 4. Google Maps Link */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-bold text-rose-200 flex items-center justify-between">
                      <span>Baraat Google Maps Direct Link</span>
                      {formData.baraatMapUrl && (
                        <a
                          href={formData.baraatMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                        >
                          Test Link ↗
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.baraatMapUrl || ''}
                      onChange={(e) => setFormData({ ...formData, baraatMapUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SECTION 4: NIKAH CEREMONY BOX (نکاح کارڈ باکس) */}
              {/* ========================================================= */}
              {(ceremonyBoxFilter === 'all' || ceremonyBoxFilter === 'nikah') && (
                <div className="bg-gradient-to-b from-teal-950/30 to-teal-900/10 border-2 border-teal-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-teal-500/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-lg">
                        💍
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-teal-300 flex items-center gap-2">
                          4. Sacred Nikah Box (نکاح کارڈ سیکشن)
                        </h4>
                        <p className="text-[11px] text-gray-300">
                          Dedicated venue hall, address, date & Google Map link for Sacred Nikah card
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30">
                      Nikah Box
                    </span>
                  </div>

                  {/* 1. Venue / Hall Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-teal-200">
                      Nikah Location / Hall Name (نکاح کا مقام / بال روم)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English (e.g. Al Falak Grand Ballroom, Burj Al Arab, Dubai)"
                        value={formData.nikahLocationEn || ''}
                        onChange={(e) => setFormData({ ...formData, nikahLocationEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-teal-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو (مثلاً الفلک گرینڈ بال روم، برج العرب، دبئی)"
                        value={formData.nikahLocationUr || ''}
                        onChange={(e) => setFormData({ ...formData, nikahLocationUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-teal-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी (जैसे: अल फलक ग्रैंड बॉलरूम, बुर्ज अल अरब, दुबई)"
                        value={formData.nikahLocationHi || ''}
                        onChange={(e) => setFormData({ ...formData, nikahLocationHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  {/* 2. Street / Area Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-teal-200">
                      Nikah Specific Address (نکاح کا مکمل پتہ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English Address"
                        value={formData.nikahAddressEn || ''}
                        onChange={(e) => setFormData({ ...formData, nikahAddressEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-teal-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو پتہ"
                        value={formData.nikahAddressUr || ''}
                        onChange={(e) => setFormData({ ...formData, nikahAddressUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-teal-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी पता"
                        value={formData.nikahAddressHi || ''}
                        onChange={(e) => setFormData({ ...formData, nikahAddressHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  {/* 3. Date & Time Strings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-teal-200">Nikah Date (تاریخ)</label>
                      <input
                        type="text"
                        placeholder="English Date (e.g. Oct 28, 2026)"
                        value={formData.nikahDateEn || ''}
                        onChange={(e) => setFormData({ ...formData, nikahDateEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-teal-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-teal-200">Nikah Time (وقت)</label>
                      <input
                        type="text"
                        placeholder="English Time (e.g. 7:30 PM)"
                        value={formData.nikahTimeEn || ''}
                        onChange={(e) => setFormData({ ...formData, nikahTimeEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  {/* 4. Google Maps Link */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-bold text-teal-200 flex items-center justify-between">
                      <span>Nikah Google Maps Direct Link</span>
                      {formData.nikahMapUrl && (
                        <a
                          href={formData.nikahMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
                        >
                          Test Link ↗
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.nikahMapUrl || ''}
                      onChange={(e) => setFormData({ ...formData, nikahMapUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SECTION 5: RUKHSATI CEREMONY BOX (رخصتی کارڈ باکس) */}
              {/* ========================================================= */}
              {(ceremonyBoxFilter === 'all' || ceremonyBoxFilter === 'rukhsati') && (
                <div className="bg-gradient-to-b from-pink-950/30 to-pink-900/10 border-2 border-pink-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-pink-500/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center font-bold text-lg">
                        ✨
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-pink-300 flex items-center gap-2">
                          5. Emotional Rukhsati Box (رخصتی کارڈ سیکشن)
                        </h4>
                        <p className="text-[11px] text-gray-300">
                          Dedicated portico/lounge, address, date & Google Map link for Rukhsati card
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 px-2.5 py-1 rounded-full border border-pink-500/30">
                      Rukhsati Box
                    </span>
                  </div>

                  {/* 1. Venue / Hall Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-pink-200">
                      Rukhsati Location / Hall Name (رخصتی کا مقام / لاؤنج)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English (e.g. Burj Al Arab Portico & Lobby Lounge, Dubai)"
                        value={formData.rukhsatiLocationEn || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiLocationEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-pink-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو (مثلاً برج العرب پورٹیکو اینڈ لابی لاؤنج، دبئی)"
                        value={formData.rukhsatiLocationUr || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiLocationUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-pink-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी (जैसे: बुर्ज अल अरब पोर्टिको एंड लॉबी लाउंज, दुबई)"
                        value={formData.rukhsatiLocationHi || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiLocationHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>

                  {/* 2. Street / Area Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-pink-200">
                      Rukhsati Specific Address (رخصتی کا مکمل پتہ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English Address"
                        value={formData.rukhsatiAddressEn || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiAddressEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-pink-400"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو پتہ"
                        value={formData.rukhsatiAddressUr || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiAddressUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-pink-400"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी पता"
                        value={formData.rukhsatiAddressHi || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiAddressHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>

                  {/* 3. Date & Time Strings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-pink-200">Rukhsati Date (تاریخ)</label>
                      <input
                        type="text"
                        placeholder="English Date (e.g. Oct 28, 2026)"
                        value={formData.rukhsatiDateEn || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiDateEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-pink-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-pink-200">Rukhsati Time (وقت)</label>
                      <input
                        type="text"
                        placeholder="English Time (e.g. 9:00 PM)"
                        value={formData.rukhsatiTimeEn || ''}
                        onChange={(e) => setFormData({ ...formData, rukhsatiTimeEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>

                  {/* 4. Google Maps Link */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-bold text-pink-200 flex items-center justify-between">
                      <span>Rukhsati Google Maps Direct Link</span>
                      {formData.rukhsatiMapUrl && (
                        <a
                          href={formData.rukhsatiMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-pink-400 hover:underline flex items-center gap-1"
                        >
                          Test Link ↗
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.rukhsatiMapUrl || ''}
                      onChange={(e) => setFormData({ ...formData, rukhsatiMapUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-pink-400"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SECTION 6: MAIN WEDDING VENUE & RECEPTION (مرکزی شادی ہال اور استقبالیہ) */}
              {/* ========================================================= */}
              {(ceremonyBoxFilter === 'all' || ceremonyBoxFilter === 'main') && (
                <div className="bg-gradient-to-b from-[#1a3a4d]/40 to-[#0e212d]/20 border-2 border-[#d4af37]/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#d4af37]/40 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#ffeaa7] flex items-center justify-center font-bold text-lg">
                        🏛️
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#ffeaa7] flex items-center gap-2">
                          6. Main Venue, Hall & Reception (مرکزی شادی ہال اور استقبالیہ)
                        </h4>
                        <p className="text-[11px] text-gray-300">
                          Primary venue information shown in the bottom Timeline & Venue Map section
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#ffeaa7] px-2.5 py-1 rounded-full border border-[#d4af37]/40">
                      Main Reception
                    </span>
                  </div>

                  {/* 1. Venue Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#ffeaa7]">
                      Main Venue Name (مرکزی شادی ہال کا نام)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English (e.g. Burj Al Arab)"
                        value={formData.venueNameEn || ''}
                        onChange={(e) => setFormData({ ...formData, venueNameEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو (مثلاً برج العرب)"
                        value={formData.venueNameUr || ''}
                        onChange={(e) => setFormData({ ...formData, venueNameUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-[#d4af37]"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी (जैसे: बुर्ज अल अरब)"
                        value={formData.venueNameHi || ''}
                        onChange={(e) => setFormData({ ...formData, venueNameHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  {/* 2. City */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#ffeaa7]">
                      City / Emirate (شہر کا نام)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English City (Dubai, UAE)"
                        value={formData.venueCityEn || ''}
                        onChange={(e) => setFormData({ ...formData, venueCityEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو شہر (دبئی، متحدہ عرب امارات)"
                        value={formData.venueCityUr || ''}
                        onChange={(e) => setFormData({ ...formData, venueCityUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-[#d4af37]"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी शहर (दुबई, यूएई)"
                        value={formData.venueCityHi || ''}
                        onChange={(e) => setFormData({ ...formData, venueCityHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  {/* 3. Full Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#ffeaa7]">
                      Main Venue Full Address (مرکزی وینیو کا تفصیلی پتہ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="English Address"
                        value={formData.venueAddressEn || ''}
                        onChange={(e) => setFormData({ ...formData, venueAddressEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اردو پتہ"
                        value={formData.venueAddressUr || ''}
                        onChange={(e) => setFormData({ ...formData, venueAddressUr: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-urdu text-xs outline-none focus:border-[#d4af37]"
                      />
                      <input
                        type="text"
                        placeholder="हिन्दी पता"
                        value={formData.venueAddressHi || ''}
                        onChange={(e) => setFormData({ ...formData, venueAddressHi: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white font-hindi text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  {/* 4. Google Maps Links */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#ffeaa7] mb-1 flex items-center justify-between">
                        <span>Google Maps Direct Link (for Guests Button)</span>
                        {formData.mapDirectionsUrl && (
                          <a
                            href={formData.mapDirectionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#ffeaa7] hover:underline flex items-center gap-1"
                          >
                            Test Link ↗
                          </a>
                        )}
                      </label>
                      <input
                        type="url"
                        value={formData.mapDirectionsUrl || ''}
                        onChange={(e) => setFormData({ ...formData, mapDirectionsUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-300">
                          Google Maps Embed URL or iframe code
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const query = [formData.venueNameEn, formData.venueAddressEn, formData.venueCityEn].filter(Boolean).join(', ');
                            if (query) {
                              const autoUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                              const directUrl = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
                              setFormData({
                                ...formData,
                                mapEmbedUrl: autoUrl,
                                mapDirectionsUrl: formData.mapDirectionsUrl || directUrl
                              });
                            }
                          }}
                          className="text-[11px] text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          ⚡ Auto-Generate from Venue Name
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Paste https://maps.google.com/... or iframe code or click Auto-Generate"
                        value={formData.mapEmbedUrl || ''}
                        onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-white text-xs outline-none focus:border-[#d4af37]"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        💡 Tip: Aap Google Maps link, pura iframe code ya seedhe Venue Name se Auto-Generate kar sakte hain. Changes save karne ke baad neeche <strong>"Save All Changes to Cloud"</strong> dabayein.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: GUEST RSVPS & WISHES REVIEW */}
          {/* ======================================================== */}
          {activeTab === 'rsvps' && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#090f19] border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#d4af37]">{totalRsvpCount}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Total Responses</div>
                </div>
                <div className="bg-[#090f19] border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{attendingCount}</div>
                  <div className="text-xs text-emerald-300/80 uppercase tracking-wider">Confirmed Attendees</div>
                </div>
                <div className="bg-[#090f19] border border-white/10 rounded-2xl p-4 flex items-center justify-center">
                  <button
                    onClick={handleExportCsv}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV / Excel
                  </button>
                </div>
              </div>

              {/* Guest Submissions List */}
              <div className="space-y-2.5">
                {rsvps.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 bg-white/5 border border-white/10 rounded-2xl">
                    <HeartHandshake className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    No guest RSVPs submitted yet. As soon as guests fill the RSVP form, their details will appear here live!
                  </div>
                ) : (
                  rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="p-3.5 bg-[#090f19] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{rsvp.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            rsvp.attending ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}>
                            {rsvp.attending ? `Attending (${rsvp.guestsCount || 1} Guests)` : 'Cannot Attend'}
                          </span>
                        </div>
                        {rsvp.phone && (
                          <div className="text-xs text-gray-400 mt-0.5">📞 {rsvp.phone}</div>
                        )}
                        {rsvp.message && (
                          <p className="text-xs text-gray-300 mt-1 italic">"{rsvp.message}"</p>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 shrink-0">
                        {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleString() : 'Recent'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: OWNER PIN & SECURITY */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-[#ffeaa7] mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#d4af37]" />
                  Change Owner Security PIN
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Set a custom secret PIN so only you can enter this management dashboard.
                </p>

                <form onSubmit={handleChangePin} className="space-y-3 max-w-sm">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">New Secret PIN (4 to 8 characters)</label>
                    <div className="relative">
                      <input
                        type={showNewPin ? 'text' : 'password'}
                        placeholder="e.g. 9821 or your secret code"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-[#090f19] border border-white/20 rounded-xl text-white text-sm outline-none focus:border-[#d4af37]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                        title={showNewPin ? 'Hide PIN' : 'Show PIN'}
                      >
                        {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-[#0f172a] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Update Owner PIN
                  </button>

                  {pinChangeSuccess && (
                    <p className="text-emerald-400 text-xs font-medium">
                      ✓ Owner PIN updated successfully!
                    </p>
                  )}
                </form>
              </div>

              {/* Secret Direct URL */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#ffeaa7] mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#d4af37]" />
                    خفیہ ایڈمن لنک و پاتھ (Secret Owner Direct Path & Link)
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    مہمانوں (Guests) کے لیے ایڈمن پینل مکمل چھپا ہوا ہے۔ آپ ان دونوں میں سے کوئی بھی لنک استعمال کر سکتے ہیں:
                  </p>
                </div>

                {/* Option 1: URL Path /admin */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#d4af37] mb-1">
                    طریقہ 1: سیدھا پاتھ (Direct Path /admin)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/admin`}
                      className="w-full px-3 py-2 bg-[#090f19] border border-[#d4af37]/40 rounded-xl text-[#ffeaa7] text-xs font-mono outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/admin`);
                        alert('Path /admin copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-[#0f172a] text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      Copy /admin
                    </button>
                  </div>
                </div>

                {/* Option 2: Parameter Link ?admin=true */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    طریقہ 2: پیرامیٹر لنک (Parameter ?admin=true)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${window.location.pathname}?admin=true`}
                      className="w-full px-3 py-2 bg-[#090f19] border border-white/20 rounded-xl text-gray-300 text-xs font-mono outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?admin=true`);
                        alert('Link ?admin=true copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl shrink-0 cursor-pointer transition-all active:scale-95"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-gray-300 space-y-1.5">
                  <p>💡 <strong>طریقہ کار (How it works):</strong></p>
                  <p>1. ویب سائٹ پر کوئی بھی لاگ ان یا ایڈمن بٹن مہمانوں کو نظر نہیں آتا۔</p>
                  <p>2. صرف جب آپ یو آر ایل میں <code>/admin</code> یا <code>?admin=true</code> لکھیں گے تب ہی یہ خفیہ پینل کھلے گا۔</p>
                  <p>3. پن درج کریں (ڈیفالٹ: <code>{currentAdminPin}</code>) اور تبدیلیاں کر کے <strong>"Save All Changes to Cloud"</strong> دبائیں۔ تمام تبدیلیاں فوراً لائیو ہو جائیں گی۔</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Save / Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-[#d4af37]/30 bg-[#0f1826] flex items-center justify-between gap-3">
          <div className="text-[11px] text-gray-400 hidden sm:block">
            💾 Changes are permanently saved to Firebase Cloud Firestore.
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89125] hover:from-[#e5c158] hover:to-[#cfa735] text-[#0f172a] text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {isSaving ? 'Saving to Cloud...' : 'Save All Changes to Cloud'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
