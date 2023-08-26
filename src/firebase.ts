import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCEEzD4PRGU815JG-U7naVLb6nDsps8kIQ",
  authDomain: "quartz-playground.firebaseapp.com",
  projectId: "quartz-playground",
  storageBucket: "quartz-playground.appspot.com",
  messagingSenderId: "234438551642",
  appId: "1:234438551642:web:3b95b97bba3aec82791063",
  measurementId: "G-PZK88DX36G",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
