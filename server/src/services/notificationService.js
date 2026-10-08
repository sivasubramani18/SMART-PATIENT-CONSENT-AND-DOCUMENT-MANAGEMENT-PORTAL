import Notification from '../models/Notification.js';

export async function createNotification({ userId, title, message, type = 'SYSTEM', link = '' }) {
  try {
    const notif = await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      read: false
    });
    return notif;
  } catch (error) {
    console.error('[Notification Error]:', error.message);
    return null;
  }
}
