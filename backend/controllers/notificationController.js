import admin from "firebase-admin";
import userModel from "../models/userModel.js";

export const sendPushNotification = async (req, res) => {
  const { title, message, image, link } = req.body;

  const users = await userModel.find({
    fcmToken: { $exists: true }
  });

  const tokens = users.map(u => u.fcmToken);

  const payload = {
    notification: {
      title,
      body: message,
      image
    },
    webpush: {
      fcmOptions: {
        link
      }
    }
  };

  await admin.messaging().sendEachForMulticast({
    tokens,
    ...payload
  });

  res.json({ success: true, sent: tokens.length });
};
