import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

if (!getApps().length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    let credential;
    if (serviceAccountStr) {
      credential = cert(JSON.parse(serviceAccountStr));
    }
    
    initializeApp({
      credential,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const getServerDb = async () => {
  return getDatabase();
};
