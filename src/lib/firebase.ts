import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WeddingData, RsvpData } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Firestore with specific Database ID if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const SETTINGS_DOC_ID = 'main';
const SETTINGS_COLLECTION = 'wedding_settings';
const RSVPS_COLLECTION = 'rsvps';

/**
 * Real-time subscription to the global Wedding Data in Cloud Firestore.
 * When owner updates date, names, videos, photos, or family details,
 * all guests across any device/browser receive the updates automatically!
 */
export function subscribeToCloudWeddingData(
  onData: (data: Partial<WeddingData>) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as Partial<WeddingData>;
          onData(remoteData);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Failed to attach Firestore snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Fetch wedding data once from Firestore
 */
export async function getCloudWeddingData(): Promise<Partial<WeddingData> | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as Partial<WeddingData>;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch from Firestore:', err);
    return null;
  }
}

/**
 * Save updated Wedding Data to Firestore so anyone who opens the link sees the owner's changes!
 */
export async function saveWeddingDataToCloud(data: WeddingData): Promise<boolean> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    // Remove undefined values if any
    const sanitizedData = JSON.parse(JSON.stringify(data));
    sanitizedData.updatedAt = new Date().toISOString();
    await setDoc(docRef, sanitizedData, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save wedding data to cloud:', err);
    throw err;
  }
}

/**
 * Save Guest RSVP to Firestore
 */
export async function saveRsvpToCloud(rsvp: Omit<RsvpData, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, RSVPS_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...rsvp,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to save RSVP to cloud:', err);
    throw err;
  }
}

/**
 * Subscribe to RSVPs for wishes / live guest book
 */
export function subscribeToCloudRsvps(
  onRsvps: (rsvps: RsvpData[]) => void
): () => void {
  try {
    const colRef = collection(db, RSVPS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: RsvpData[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          list.push({
            id: doc.id,
            name: d.name || '',
            attending: d.attending ?? true,
            guestsCount: d.guestsCount || 1,
            message: d.message || '',
            phone: d.phone,
            createdAt: d.createdAt || ''
          });
        });
        onRsvps(list);
      },
      (err) => {
        console.warn('RSVP subscription notice:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to listen to RSVPs:', err);
    return () => {};
  }
}
