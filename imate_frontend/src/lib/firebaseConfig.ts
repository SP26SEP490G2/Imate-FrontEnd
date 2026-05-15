import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
// ...existing code...

const firebaseConfig = {
  apiKey: "AIzaSyB8qjFC1VO-ylKHIZdq783VBh7sxjLCUoI",
  authDomain: "imate-abdf4.firebaseapp.com",
  projectId: "imate-abdf4",
  storageBucket: "imate-abdf4.firebasestorage.app",
  messagingSenderId: "488073319006",
  appId: "1:488073319006:web:c74975702ac89beb71dacf",
  measurementId: "G-5GLMZQ3KFJ"
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

const auth: Auth = getAuth(firebaseApp);
export { auth, firebaseApp };
