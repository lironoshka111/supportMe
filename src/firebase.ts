import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAexVy59-pSAeG2f92zaFjrwfP4clCmBMI",
  authDomain: "supportme-ced41.firebaseapp.com",
  projectId: "supportme-ced41",
  storageBucket: "supportme-ced41.appspot.com",
  messagingSenderId: "274960225547",
  appId: "1:274960225547:web:d64ab6474810f1f44bbe0e",
  measurementId: "G-93K4ZDMNVG"
}


const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
