// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBctL8236TvBCzOfnXID__Kv4inMeIizBk",
  authDomain: "kghdashboard.firebaseapp.com",
  projectId: "kghdashboard",
  storageBucket: "kghdashboard.appspot.com",
  messagingSenderId: "513149796536",
  appId: "1:513149796536:web:d18a1659e062e886bcf44d",
  measurementId: "G-ZS50HV1N20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);