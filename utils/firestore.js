const admin = require("firebase-admin");

const serviceAccount = require("../autopark-e1d43-firebase-adminsdk-fjv8l-57b8426a28.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://autopark-e1d43.firebaseio.com"
});

module.exports = admin.firestore();