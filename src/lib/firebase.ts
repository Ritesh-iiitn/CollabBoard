
import { initializeApp } from "firebase/app";


import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKeCEM8VfGBJHUO5c2h86NUtOXPhk2wyA",
  authDomain: "colabboard-dd692.firebaseapp.com",
  projectId: "colabboard-dd692",
  storageBucket: "colabboard-dd692.firebasestorage.app",
  messagingSenderId: "291536554873",
  appId: "1:291536554873:web:28b782d9a63499958abda8",
  measurementId: "G-CCS8TG97GN"
};

const app = initializeApp(firebaseConfig);



export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);