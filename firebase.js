import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, getDoc".js\";

const firebaseConfig = {
  apiKey: "AIzaSyC1ssvZnv2Jd8c5SlFRqPqc0SYt7iPvnm4",
  authDomain: "quantum-thoughts.firebaseapp.com",
  projectId: "quantum-thoughts",
  storageBucket: "quantum-thoughts.firebasestorage.app",
  messagingSenderId: "174553420596",
  appId: "1:174553420596:web:9cc3a0f2bb04c6885b8b61"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const POSTS = collection(db, 'blogPosts');

export { signInWithEmailAndPassword, onAuthStateChanged, signOut, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, getDoc };
