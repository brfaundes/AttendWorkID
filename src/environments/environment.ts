// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export const firebaseConfig = {
  production: false,
  apiKey: "AIzaSyArom3bvpZ5HLDwzQhNG4Ex986uctuvoqk",
  authDomain: "attendworkid-fd400.firebaseapp.com",
  projectId: "attendworkid-fd400",
  storageBucket: "attendworkid-fd400.appspot.com",
  messagingSenderId: "519135910094",
  appId: "1:519135910094:web:88819b0553e8d6aeb6189f",
  measurementId: "G-XWV9JN4GBR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
