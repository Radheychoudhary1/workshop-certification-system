// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDJiH1pS5cXOT_emTaLOc7ZgLjgq2eQafw",
  authDomain: "workshop-feedback-system-afd1b.firebaseapp.com",
  projectId: "workshop-feedback-system-afd1b",
  storageBucket: "workshop-feedback-system-afd1b.appspot.com",
  messagingSenderId: "868846175967",
  appId: "1:868846175967:web:070a00515ce20026fd0b6a"
};

const app = initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const functions: Functions = getFunctions(app);

export { app, auth, db, storage, functions };
