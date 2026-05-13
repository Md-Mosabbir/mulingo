import webpush from 'web-push';
import { getUserSubscriptions, deleteSubscription } from '../sql/notification';

export async function sendPushNotification(userId: number, payload: any) {
  try {
    const subscriptions = await getUserSubscriptions(userId);
    
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload));
        } catch (error: any) {
          // If subscription is expired or invalid, remove it
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`Removing expired subscription for user ${userId}`);
            await deleteSubscription(userId, sub.endpoint);
          } else {
            console.error(`Error sending push to user ${userId}:`, error);
          }
        }
      })
    );

    return results;
  } catch (error) {
    console.error(`Error in sendPushNotification for user ${userId}:`, error);
  }
}
