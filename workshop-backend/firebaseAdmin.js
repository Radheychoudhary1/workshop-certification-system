const admin = require("firebase-admin");

const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();
module.exports = { db };
