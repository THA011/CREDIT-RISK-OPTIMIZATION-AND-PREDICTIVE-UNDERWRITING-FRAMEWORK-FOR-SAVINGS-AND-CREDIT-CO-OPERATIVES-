// Firebase initialization
// Replace the placeholders below with your Firebase project's config
// See: https://console.firebase.google.com/ → Project settings → General → Your apps

// Import the Firebase SDKs via CDN in HTML files that use this module
// Example:
// <script src="https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.3/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.3/firebase-storage-compat.js"></script>

window.firebaseAppConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

window.initFirebaseApp = function initFirebaseApp() {
  if (!window.firebase || !firebase.initializeApp) {
    throw new Error('Firebase SDK not loaded. Include firebase-app-compat.js before this script.');
  }
  if (!window._firebaseApp) {
    window._firebaseApp = firebase.initializeApp(window.firebaseAppConfig);
    window._auth = firebase.auth();
    window._db = firebase.firestore();
    window._storage = firebase.storage();
  }
  return { app: window._firebaseApp, auth: window._auth, db: window._db, storage: window._storage };
};


