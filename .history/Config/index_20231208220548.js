// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCL4PnQ81s2nAtIMlgtVu9Enwb3LdjBi3Y",
  authDomain: "project-db828.firebaseapp.com",
  databaseURL: "https://project-db828-default-rtdb.firebaseio.com",
  projectId: "project-db828",
  storageBucket: "project-db828.appspot.com",
  messagingSenderId: "41697775661",
  appId: "1:41697775661:web:4cee08c023082f6726e8a4"
};

const firebase = app.initializeApp(firebaseConfig);
export default firebase;

/*
*/