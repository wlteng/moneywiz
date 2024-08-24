// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0NGdnJivrRhtgpZzwYrkY6itL6uwlPpk",
  authDomain: "moneywiz-518c2.firebaseapp.com",
  projectId: "moneywiz-518c2",
  storageBucket: "moneywiz-518c2.appspot.com",
  messagingSenderId: "402809772687",
  appId: "1:402809772687:web:cbd2b2c02a2617121b2efa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the Firebase services to use them throughout your app
export { auth, db, storage };

