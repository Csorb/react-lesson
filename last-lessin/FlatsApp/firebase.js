
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCprgDZV6REEkc0mYIWyYKW8fcaC9UNIn4",
  authDomain: "flatsapp-b7962.firebaseapp.com",
  projectId: "flatsapp-b7962",
  storageBucket: "flatsapp-b7962.appspot.com",
  messagingSenderId: "891105778473",
  appId: "1:891105778473:web:0fb59875924d133642f538",
  measurementId: "G-GLNVG241GH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db};