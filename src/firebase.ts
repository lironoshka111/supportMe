import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
// };
export const firebaseConfig = {
  apiKey: "AIzaSyC9OX0WWG-aF4HuQ8dwKuXFNECii-clsxc",
  authDomain: "support-me-1.firebaseapp.com",
  projectId: "support-me-1",
  storageBucket: "support-me-1.appspot.com",
  messagingSenderId: "424818207732",
  appId: "1:424818207732:web:3a2aa20a95f0f05e7be7a1",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
