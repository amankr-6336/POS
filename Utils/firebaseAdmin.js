// fcmService.js
const admin = require('firebase-admin');
const User = require('../Model/User');
const serviceAccount = require('../firebase-admin.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotificationToOwner = async (ownerId, notificationData) => {
  console.log("Sending notification to owner:", ownerId);

  const owner = await User.findById(ownerId);
  if (!owner || !Array.isArray(owner.fcmTokens) || owner.fcmTokens.length === 0) return;

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
    console.log('✅ Notification sent:', response);
  } catch (error) {
    console.error('❌ Error sending FCM:', error);

    // Optional: Remove invalid token if it's an auth-related error
    if (
      error.errorInfo &&
      ['messaging/invalid-argument', 'messaging/registration-token-not-registered'].includes(error.errorInfo.code)
    ) {
      owner.fcmTokens = owner.fcmTokens.filter(t => t !== token);
      await owner.save();
    }
  }
};

module.exports = { sendNotificationToOwner };
