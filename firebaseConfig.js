// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp} from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPSWrqbV-Ec3QJaPKjOXx5e9oleEIev-0",
  authDomain: "nativeapp-1ea16.firebaseapp.com",
  projectId: "nativeapp-1ea16",
  storageBucket: "nativeapp-1ea16.appspot.com",
  messagingSenderId: "944858040196",
  appId: "1:944858040196:web:fbabf52ca0edd3e807bfd1"
};

// Initialize Firebase
if(getApps().length===0){
    initializeApp(firebaseConfig);
}

const FIREBASE_APP =getApp()
export const FIREBASE_CONFIG=firebaseConfig;
export const FIREBASE_AUTH=getAuth(FIREBASE_APP);
export const db=getFirestore(FIREBASE_APP) 




