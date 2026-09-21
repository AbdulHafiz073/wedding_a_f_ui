export interface VideoPreset {
  id: string;
  nameEn: string;
  nameUr: string;
  nameHi?: string;
  url: string;
  type: 'youtube' | 'mp4';
  descriptionEn: string;
  descriptionUr: string;
  descriptionHi?: string;
  tag: string;
}

export const DEFAULT_MUSLIM_WEDDING_VIDEO = 'https://www.youtube.com/watch?v=kv0QZ2OirS0';

export const MUSLIM_WEDDING_VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'muslim-cartoon-couple',
    nameEn: 'Muslim Wedding Cartoon Couple (Animated)',
    nameUr: 'مسلم دلہا دلہن کارٹون اینیمیشن',
    nameHi: 'मुस्लिम दूल्हा-दुल्हन कार्टून एनिमेशन',
    url: 'https://www.youtube.com/watch?v=kv0QZ2OirS0',
    type: 'youtube',
    descriptionEn: 'Cute animated Muslim wedding couple with modest bridal attire & festive celebration',
    descriptionUr: 'خوبصورت کارٹون دلہا و دلہن اور شادی کی خوشگوار اینیمیشن',
    descriptionHi: 'प्यारा एनिमेटेड मुस्लिम दूल्हा-दुल्हन और शादी का खुशहाल कार्टून',
    tag: 'کارٹون'
  },
  {
    id: 'muslim-animated-couple-floral',
    nameEn: 'Cute Muslim Couple Love Story Animation',
    nameUr: 'سلامِ عشق کارٹون نکاح اسٹوری',
    nameHi: 'सलाम-ए-इश्क़ क्यूट कपल लव स्टोरी',
    url: 'https://www.youtube.com/watch?v=5CgPPDnyxyk',
    type: 'youtube',
    descriptionEn: 'Cute cartoon love story reveal with Nikah celebration animations',
    descriptionUr: 'کارٹون اینیمیشن اور نکاح کے پرمسرت لمحات',
    descriptionHi: 'क्यूट कार्टून एनिमेशन व निकाह समारोह',
    tag: 'اینیمیشن'
  },
  {
    id: 'muslim-animated-nikah',
    nameEn: 'Animated Muslim Wedding Invitation',
    nameUr: 'اینیمیٹڈ مسلم میرج انویٹیشن',
    nameHi: 'एनिमेटेड मुस्लिम वेडिंग आमंत्रण',
    url: 'https://www.youtube.com/watch?v=4Zj85g7rTy8',
    type: 'youtube',
    descriptionEn: 'Traditional animated Muslim couple with royal Islamic backdrop',
    descriptionUr: 'شاہی پس منظر اور کارٹون دلہا دلہن کی شاندار اینیمیشن',
    descriptionHi: 'शाही बैकड्रॉप और कार्टून दूल्हा-दुल्हन एनिमेशन',
    tag: 'نکاح'
  },
  {
    id: 'nikah-ceremony-cinematic',
    nameEn: 'Royal Nikah Ceremony (Cinematic)',
    nameUr: 'شاہی تقریبِ نکاح (پرنور لمحات)',
    nameHi: 'शाही निकाह समारोह (सिनेमैटिक)',
    url: 'https://www.youtube.com/watch?v=MINL6ki1lWU',
    type: 'youtube',
    descriptionEn: 'Sacred Nikah rituals, emotional duas & grand Islamic vows',
    descriptionUr: 'مقدس نکاح، دعائیں اور قبول ہے کا روحانی منظر',
    descriptionHi: 'पवित्र निकाह, दुआएं व कबूल है का मंज़र',
    tag: 'لائیو'
  },
  {
    id: 'qubool-hai-royal',
    nameEn: 'Qubool Hai & Royal Duas',
    nameUr: 'قبول ہے و مبارکباد کی تقریب',
    nameHi: 'क़बूल है व मुबारकबाद की तक़रीब',
    url: 'https://www.youtube.com/watch?v=Xxh-lsUBifk',
    type: 'youtube',
    descriptionEn: 'Emotional Qubool Hai vows, family blessings & eternal togetherness',
    descriptionUr: 'قبول ہے کی صدا اور خاندان والوں کی دعائیں',
    descriptionHi: 'कबूल है की सदा और खानदान वालों की दुआएं',
    tag: 'رخصتی'
  },
  {
    id: 'mehndi-jashn',
    nameEn: 'Mehndi & Jashn Celebration',
    nameUr: 'مہندی و برات کا جشن',
    nameHi: 'मेहंदी व बारात का जश्न',
    url: 'https://www.youtube.com/watch?v=hqros5XFBYA',
    type: 'youtube',
    descriptionEn: 'Joyful wedding lights, Henna rituals & vibrant celebrations',
    descriptionUr: 'مہندی کی جھلکیاں اور رشتہ داروں کی خوشیاں',
    descriptionHi: 'मेहंदी की झलकियां और जश्न की खुशियां',
    tag: 'مہندی'
  }
];

export function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function buildYoutubeEmbedUrl(id: string, controls: number = 1): string {
  // Autoplay, loop, controls enabled for reliable play & audio, modest branding, inline
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=${controls}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`;
}
