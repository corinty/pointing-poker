// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB75i7vukCoI_4MQQ6O3NlNMFzv0QXlcB0",
  authDomain: "shopifolk-pointing-poker.firebaseapp.com",
  projectId: "shopifolk-pointing-poker",
  storageBucket: "shopifolk-pointing-poker.appspot.com",
  messagingSenderId: "1081900188975",
  appId: "1:1081900188975:web:2a273b7d454de4db9fcdda",
  databaseURL: "https://shopifolk-pointing-poker-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export const initializeFirestore = () => {};
