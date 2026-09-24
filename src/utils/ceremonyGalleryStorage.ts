import { CeremonyPhoto } from '../types';
export type { CeremonyPhoto };

export interface CeremonyThemeConfig {
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  buttonGradient: string;
  titleEn: string;
  titleUr: string;
  titleHi: string;
  tagEn: string;
  tagUr: string;
  tagHi: string;
  iconEmoji: string;
}

export const CEREMONY_THEMES: Record<string, CeremonyThemeConfig> = {
  haldi: {
    accentColor: '#d97706',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    buttonGradient: 'from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600',
    titleEn: 'Haldi Ceremony Photo Gallery',
    titleUr: 'ہلدی تقریب کی یادگار تصاویر',
    titleHi: 'हल्दी सेरेमनी फोटो गैलरी',
    tagEn: 'Haldi & Haldi Holi',
    tagUr: 'ہلدی و گلاب',
    tagHi: 'हल्दी व रंगोत्सव',
    iconEmoji: '🌼'
  },
  mehndi: {
    accentColor: '#059669',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    buttonGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
    titleEn: 'Mehndi Ceremony (Jashn-e-Hina) Gallery',
    titleUr: 'جشنِ حنا و مہندی تصویری البم',
    titleHi: 'जश्न-ए-हिना व मेहंदी फोटो गैलरी',
    tagEn: 'Jashn-e-Hina',
    tagUr: 'جشنِ حنا',
    tagHi: 'मेहंदी उत्सव',
    iconEmoji: '🍃'
  },
  baraat: {
    accentColor: '#e11d48',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    buttonGradient: 'from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700',
    titleEn: 'Royal Baraat Procession Gallery',
    titleUr: 'آمدِ شاہی بارات تصویری یادیں',
    titleHi: 'शाही बारात स्वागत फोटो गैलरी',
    tagEn: 'Royal Baraat',
    tagUr: 'آمدِ بارات',
    tagHi: 'शाही बारात',
    iconEmoji: '👑'
  },
  nikah: {
    accentColor: '#0d9488',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
    buttonGradient: 'from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800',
    titleEn: 'Sacred Nikaah Moments Gallery',
    titleUr: 'تقریبِ بابرکت نکاح تصویری البم',
    titleHi: 'मुबारक निकाह यादें फोटो गैलरी',
    tagEn: 'Sacred Nikaah',
    tagUr: 'بابرکت نکاح',
    tagHi: 'मुबारक निकाह',
    iconEmoji: '💍'
  },
  rukhsati: {
    accentColor: '#9333ea',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    buttonGradient: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    titleEn: 'Emotional Rukhsati & Departure Gallery',
    titleUr: 'سایۂ قرآن میں رخصتی کی انمول تصاویر',
    titleHi: 'सया-ए-क़ुरआन विदाई व रुखसती गैलरी',
    tagEn: 'Emotional Rukhsati',
    tagUr: 'پروقار رخصتی',
    tagHi: 'भावुक रुखसती',
    iconEmoji: '🕊️'
  }
};

export const DEFAULT_CEREMONY_PHOTOS: Record<string, CeremonyPhoto[]> = {
  haldi: [
    {
      id: 'haldi-1',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Golden Turmeric ritual & vibrant Marigold blessings',
      captionUr: 'زعفرانی ہلدی اور تازہ گیندا کے پھولوں کی برکتیں',
      captionHi: 'पीली हल्दी और गेंदे के फूलों से सजी मंगल रस्म'
    },
    {
      id: 'haldi-2',
      url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Traditional Genda Phool decor and family laughter',
      captionUr: 'روایتی گیندا پھول سجاوٹ اور اپنوں کی دلکش مسکراہٹیں',
      captionHi: 'परंपरागत गेंदा फूल सजावट और अपनों का प्यार'
    },
    {
      id: 'haldi-3',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Pre-wedding radiance and shared smiles',
      captionUr: 'شادی سے قبل چہرے کی مسرت اور دعاؤں کا روپ',
      captionHi: 'शादी की खुशियों में सराबोर यादगार पल'
    },
    {
      id: 'haldi-4',
      url: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Playful Haldi Holi colors & joy',
      captionUr: 'ہلدی ہولی کے مست رنگ اور خوشیوں کا جشن',
      captionHi: 'हल्दी होली के चहकते रंग और उल्लास'
    }
  ],
  mehndi: [
    {
      id: 'mehndi-1',
      url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Intricate bridal henna artwork depicting eternal love',
      captionUr: 'ہاتھوں پر سجی محبت بھری حسین مہندی کے نقوش',
      captionHi: 'हाथों पर रची प्रेम और समर्पण की सुंदर मेहंदी'
    },
    {
      id: 'mehndi-2',
      url: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Vibrant Jashn-e-Hina festive night & rhythmic beats',
      captionUr: 'جشنِ حنا کی پرنور رات اور ڈھولک کے مدھر گیت',
      captionHi: 'जश्न-ए-हिना की महकती शाम और ढोलक की थाप'
    },
    {
      id: 'mehndi-3',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Fairytale garden stage decorated in green & golden tones',
      captionUr: 'ہرے اور سنہری رنگوں سے سجا دلکش دیوان اسٹیج',
      captionHi: 'हरे व सुनहरे रंगों से सजा खूबसूरत उत्सव मंच'
    },
    {
      id: 'mehndi-4',
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Bangles, blossoms & joyful laughter of loved ones',
      captionUr: 'چوڑیوں کی کھنک اور مہندی کے خوشبودار لمحات',
      captionHi: 'चूड़ियों की खनक और अपनों की आत्मीय शुभकामनाएं'
    }
  ],
  baraat: [
    {
      id: 'baraat-1',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Grand royal Baraat arrival with drums and fanfare',
      captionUr: 'دھوم دھام اور شہنائیوں کے ساتھ شاہی بارات کی آمد',
      captionHi: 'बैंड-बाजों और ढोल की गूंज के साथ शाही बारात का आगमन'
    },
    {
      id: 'baraat-2',
      url: 'https://images.unsplash.com/photo-1623934820753-472496997f47?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Groom in royal Sherwani & Sehra standing proud',
      captionUr: 'شاہی شیروانی اور سہرے میں سجے دولہا میاں',
      captionHi: 'शाही शेरवानी व सेहरे में दूल्हे राजा का दीदार'
    },
    {
      id: 'baraat-3',
      url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Burj Al Arab Grand Entrance welcoming the wedding guests',
      captionUr: 'برج العرب کے پرشکوہ دروازے پر باراتیوں کا شاہانہ استقبال',
      captionHi: 'बुर्ज अल अरब के भव्य द्वार पर बारातियों का इस्तकबाल'
    },
    {
      id: 'baraat-4',
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Warm rose garland welcome by the bride\'s family',
      captionUr: 'گلاب کے ہاروں اور محبت بھری مسکراہٹوں سے پرتپاک استقبال',
      captionHi: 'गुलाब की मालाओं और स्नेह से भरपूर शानदार स्वागत'
    }
  ],
  nikah: [
    {
      id: 'nikah-1',
      url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Sacred exchange of vows & blessed wedding rings',
      captionUr: 'ایجاب و قبول کی پاکیزہ ساعت اور انگوٹھیوں کا تبادلہ',
      captionHi: 'पवित्र ईजाब-ओ-क़ुबूल और मुकद्दस अंगूठियों का आदान-प्रदान'
    },
    {
      id: 'nikah-2',
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'White Jasmine floral curtains radiating divine peace',
      captionUr: 'چنبیلی اور موتیے کے پھولوں سے مہکتا روحانی پردہ',
      captionHi: 'चमेली और मोगरे के फूलों की रूहानी खुशबू से सजा पर्दा'
    },
    {
      id: 'nikah-3',
      url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Grand Ballroom chandelier lights witness to the covenant',
      captionUr: 'شاندار فانوسوں کے تلے نکاح نامے پر برکتوں کے دستخط',
      captionHi: 'झिलमिलाते फानूसों के तले निकाहनामे पर दस्तखत'
    },
    {
      id: 'nikah-4',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Heartfelt Duas of Barakah showered upon the new couple',
      captionUr: 'بارک اللہ لکما کی دعاؤں سے جھولیاں بھر دینے والے لمحات',
      captionHi: 'बारक़ल्लाह लकुमा की अनमोल दुआओं से रोशन नया जीवन'
    }
  ],
  rukhsati: [
    {
      id: 'rukhsati-1',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Departure under the sacred shade of the Holy Quran',
      captionUr: 'سایۂ کلامِ الٰہی میں نئی بابرکت زندگی کا آغاز',
      captionHi: 'कलाम-ए-इलाही के पवित्र साए में नई जिंदगी की शुरुआत'
    },
    {
      id: 'rukhsati-2',
      url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Tearful smiles & maternal blessings of unconditional love',
      captionUr: 'آنکھوں میں نم، ہونٹوں پر دعائیں اور ماں باپ کی بےلوث محبت',
      captionHi: 'आंखों में स्नेह, लबों पर दुआएं और माता-पिता का सच्चा आशीर्वाद'
    },
    {
      id: 'rukhsati-3',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Rose petal shower lighting the path to a joyful home',
      captionUr: 'گلاب کی پتیوں کی برسات میں رخصتی کا پُرنور منظر',
      captionHi: 'गुलाब की पंखुड़ियों की बारिश के साथ विदाई का पावन दृश्य'
    },
    {
      id: 'rukhsati-4',
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1000&auto=format&fit=crop&q=80',
      captionEn: 'Stepping into a lifetime of partnership and tranquility',
      captionUr: 'ہمسفری اور محبت کے لازوال سفر کی جانب پہلا قدم',
      captionHi: 'उम्र भर के साथ और सुकून भरे सफर की ओर पहला कदम'
    }
  ]
};

const ACTIVE_STORAGE_PREFIX = 'ceremony_active_photos_v2_';
const LEGACY_STORAGE_PREFIX = 'ceremony_gallery_photos_v1_';

export const ALL_CEREMONY_IDS = ['haldi', 'mehndi', 'baraat', 'nikah', 'rukhsati'] as const;
export type CeremonyKey = typeof ALL_CEREMONY_IDS[number];

/**
 * Load all photos for a given ceremony.
 * Priority:
 * 1. Active v2 localStorage list (which supports user deletions of any photo)
 * 2. Cloud-synced list (if passed or present in WeddingData)
 * 3. Legacy v1 localStorage list merged with defaults
 * 4. Hardcoded defaults
 */
export function getCeremonyPhotos(ceremonyId: string, cloudList?: CeremonyPhoto[]): CeremonyPhoto[] {
  const defaults = DEFAULT_CEREMONY_PHOTOS[ceremonyId] || [];
  try {
    const rawV2 = localStorage.getItem(ACTIVE_STORAGE_PREFIX + ceremonyId);
    if (rawV2 !== null) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed)) return parsed;
    }

    // Check if cloud has a synced list
    if (cloudList && Array.isArray(cloudList) && cloudList.length > 0) {
      localStorage.setItem(ACTIVE_STORAGE_PREFIX + ceremonyId, JSON.stringify(cloudList));
      return cloudList;
    }

    // Check legacy v1 storage
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_PREFIX + ceremonyId);
    if (rawV1) {
      const customPhotos: CeremonyPhoto[] = JSON.parse(rawV1);
      if (Array.isArray(customPhotos) && customPhotos.length > 0) {
        const merged = [...customPhotos, ...defaults];
        localStorage.setItem(ACTIVE_STORAGE_PREFIX + ceremonyId, JSON.stringify(merged));
        return merged;
      }
    }

    return defaults;
  } catch (err) {
    console.warn('Error reading ceremony photos:', err);
    return defaults;
  }
}

/**
 * Directly save the full active photo list for a ceremony
 */
export function saveCeremonyPhotos(ceremonyId: string, photos: CeremonyPhoto[]): void {
  try {
    localStorage.setItem(ACTIVE_STORAGE_PREFIX + ceremonyId, JSON.stringify(photos));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('ceremonyPhotosUpdated', {
            detail: { ceremonyId, photos, count: photos.length }
          })
        );
      }, 0);
    }
  } catch (err) {
    console.warn('Failed to save ceremony photos:', err);
  }
}

/**
 * Add a new photo to a ceremony (adds to top of list)
 */
export function addCeremonyPhoto(ceremonyId: string, photo: CeremonyPhoto): CeremonyPhoto[] {
  const current = getCeremonyPhotos(ceremonyId);
  const updated = [photo, ...current];
  saveCeremonyPhotos(ceremonyId, updated);
  return updated;
}

/**
 * Delete ANY photo by ID (both preset and custom uploaded photos)
 */
export function deleteCeremonyPhoto(ceremonyId: string, photoId: string): CeremonyPhoto[] {
  const current = getCeremonyPhotos(ceremonyId);
  const updated = current.filter((p) => p.id !== photoId);
  saveCeremonyPhotos(ceremonyId, updated);
  return updated;
}

/**
 * Reset a ceremony back to the original default presets
 */
export function resetCeremonyPhotos(ceremonyId: string): CeremonyPhoto[] {
  const defaults = DEFAULT_CEREMONY_PHOTOS[ceremonyId] || [];
  saveCeremonyPhotos(ceremonyId, defaults);
  return defaults;
}

/**
 * Get all ceremony photos as a dictionary
 */
export function getAllCeremonyPhotosDictionary(): Record<string, CeremonyPhoto[]> {
  const result: Record<string, CeremonyPhoto[]> = {};
  for (const id of ALL_CEREMONY_IDS) {
    result[id] = getCeremonyPhotos(id);
  }
  return result;
}

/**
 * Compress an uploaded image file to max 1280px to safely persist in localStorage
 */
export async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
