export type Language = 'en' | 'ur' | 'hi';

export interface EventItem {
  id: string;
  nameEn: string;
  nameUr: string;
  nameHi?: string;
  dateStrEn: string;
  dateStrUr: string;
  dateStrHi?: string;
  locationEn: string;
  locationUr: string;
  locationHi?: string;
  icon?: string;
}

export interface GuestWish {
  id: string;
  name: string;
  email?: string;
  attendance: 'yes' | 'no' | 'maybe';
  guestsCount: number;
  message: string;
  timestamp: string;
}

export interface RsvpData {
  id: string;
  name: string;
  attending: boolean;
  guestsCount: number;
  message: string;
  phone?: string;
  createdAt?: string;
}

export interface FamilyMember {
  id: string;
  nameEn: string;
  nameUr: string;
  nameHi?: string;
  relationEn: string;
  relationUr: string;
  relationHi?: string;
}

export interface FamilySide {
  sideTitleEn: string;
  sideTitleUr: string;
  sideTitleHi?: string;
  parentsIntroEn?: string;
  parentsIntroUr?: string;
  parentsIntroHi?: string;
  members: FamilyMember[];
}

export interface WeddingData {
  groomNameEn: string;
  groomNameUr: string;
  groomNameHi?: string;
  brideNameEn: string;
  brideNameUr: string;
  brideNameHi?: string;
  weddingDate: string; // ISO or parseable string
  weddingTimeEn: string;
  weddingTimeUr: string;
  weddingTimeHi?: string;
  venueNameEn: string;
  venueNameUr: string;
  venueNameHi?: string;
  venueCityEn: string;
  venueCityUr: string;
  venueCityHi?: string;
  venueAddressEn: string;
  venueAddressUr: string;
  venueAddressHi?: string;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
  bismillahArabic: string;
  welcomeTranslit: string;
  welcomeMessageEn: string;
  welcomeMessageUr: string;
  welcomeMessageHi?: string;
  timelineEvents: EventItem[];
  preWeddingEvents: EventItem[];
  groomFamily: FamilySide;
  brideFamily: FamilySide;
  galleryImages: {
    url: string;
    captionEn: string;
    captionUr: string;
    captionHi?: string;
  }[];
  coupleImageUrl?: string;
  coupleImages?: string[];
  groomImageUrl?: string;
  brideImageUrl?: string;
  jannatVideoUrl?: string;
  haldiVideoUrl?: string;
  mehndiVideoUrl?: string;
  baraatVideoUrl?: string;
  nikahVideoUrl?: string;
  rukhsatiVideoUrl?: string;
  haldiLocationEn?: string;
  haldiLocationUr?: string;
  haldiLocationHi?: string;
  mehndiLocationEn?: string;
  mehndiLocationUr?: string;
  mehndiLocationHi?: string;
  baraatLocationEn?: string;
  baraatLocationUr?: string;
  baraatLocationHi?: string;
  nikahLocationEn?: string;
  nikahLocationUr?: string;
  nikahLocationHi?: string;
  rukhsatiLocationEn?: string;
  rukhsatiLocationUr?: string;
  rukhsatiLocationHi?: string;
  adminPin?: string;
}
