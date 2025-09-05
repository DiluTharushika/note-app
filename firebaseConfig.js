// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBf1sU7SW-1ioRhhMHodzgBMiWhEtkqJTY",
  authDomain: "note-app-4d34d.firebaseapp.com",
  projectId: "note-app-4d34d",
  storageBucket: "note-app-4d34d.firebasestorage.app",
  messagingSenderId: "55899050122",
  appId: "1:55899050122:web:83c7f2cacb295c2d885d73",
  measurementId: "G-DRK8Q86H2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Export services
export { auth, db };