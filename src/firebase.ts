import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBfJaENARQHVik6j5u8MUhDHL5UIyKIzb4',
  authDomain: 'slack-copy-b1013.firebaseapp.com',
  projectId: 'slack-copy-b1013',
  storageBucket: 'slack-copy-b1013.appspot.com',
  messagingSenderId: '1079417265674',
  appId: '1:1079417265674:web:b9831d1ed9d9171c35c9f3',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
