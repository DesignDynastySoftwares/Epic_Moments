/* eslint-disable no-undef */
import { onBackgroundMessage } from "firebase/messaging/sw";
import { messaging } from "./utils/firebase";

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.notification.data?.link) {
    clients.openWindow(event.notification.data.link);
  }
});

onBackgroundMessage(messaging, (payload) => {
  const { title, body, image, click_action } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: image,
    data: { link: click_action },
  });
});
