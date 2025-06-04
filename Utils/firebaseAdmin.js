// fcmService.js
const admin = require("firebase-admin");
const User = require("../Model/User");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    }),
  });
}

const sendNotificationToOwner = async (ownerId, notificationData) => {
  console.log("Sending notification to owner:", ownerId);

  const owner = await User.findById(ownerId);
  if (!owner || !Array.isArray(owner.fcmTokens) || owner.fcmTokens.length === 0)
    return;

  const token = owner.fcmTokens[0]; // ✅ pick the first (or preferred) token

  const message = {
    notification: {
      title: notificationData.title,
      body: notificationData.body,
    },
    token: token, // ✅ this is for a single device
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
  } catch (error) {
    console.error("❌ Error sending FCM:", error);

    // Optional: Remove invalid token if it's an auth-related error
    if (
      error.errorInfo &&
      [
        "messaging/invalid-argument",
        "messaging/registration-token-not-registered",
      ].includes(error.errorInfo.code)
    ) {
      owner.fcmTokens = owner.fcmTokens.filter((t) => t !== token);
      await owner.save();
    }
  }
};

module.exports = { sendNotificationToOwner };
