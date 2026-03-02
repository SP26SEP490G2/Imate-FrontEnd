import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
    // Thông tin cấu hình bạn đã cung cấp
    apiKey: "AIzaSyDMofIRUp4PUsk_wXstjl5hf5b-mTDc6I0",
    authDomain: "peppo-a820f.firebaseapp.com",
    projectId: "peppo-a820f",
    storageBucket: "peppo-a820f.firebasestorage.app",
    messagingSenderId: "86477519531",
    appId: "1:86477519531:web:357be4b3322fb8e1d515ee",
    measurementId: "G-6SPLGSPRVY" 
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

const auth: Auth = getAuth(firebaseApp);

export { auth, firebaseApp };
