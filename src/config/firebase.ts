// Firebase 配置文件
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1FBBpxi9MrQ2nCLfPWHzzdjKH1KjtAkA",
  authDomain: "jinduluopan.firebaseapp.com",
  projectId: "jinduluopan",
  storageBucket: "jinduluopan.firebasestorage.app",
  messagingSenderId: "202428312979",
  appId: "1:202428312979:web:ff72e8ea64ded03ff94c66",
  measurementId: "G-E0HHKY4NK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
