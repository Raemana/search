import * as firebase from 'firebase'
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyBBqo54EXyRlNw3G1mNmeYbu3PNSgPobK4",
    authDomain: "wireless-library-fe15b.firebaseapp.com",
    projectId: "wireless-library-fe15b",
    storageBucket: "wireless-library-fe15b.appspot.com",
    messagingSenderId: "938288756175",
    appId: "1:938288756175:web:bc862c7f70600cfc110eba"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
export default firebase.firestore()