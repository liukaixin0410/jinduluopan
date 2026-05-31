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

// 延迟初始化Firebase，只在需要时才初始化
let app: any = null;
let db: any = null;
let initialized = false;

export function getFirebaseDb() {
  if (!initialized) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log('Firebase 初始化成功');
    } catch (error) {
      console.warn('Firebase 初始化失败:', error);
      db = null;
    }
    initialized = true;
  }
  return db;
}

export default app;
