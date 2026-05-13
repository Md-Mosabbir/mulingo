import pool from '../../config/db';

export async function getUserSubscriptions(userId: number) {
  const [rows]: any = await pool.query(
    'SELECT subscription_json FROM push_subscriptions WHERE user_id = ?',
    [userId]
  );
  return rows.map((r: any) => JSON.parse(r.subscription_json));
}

export async function deleteSubscription(userId: number, endpoint: string) {
  await pool.query(
    'DELETE FROM push_subscriptions WHERE user_id = ? AND subscription_json LIKE ?',
    [userId, `%${endpoint}%`]
  );
}
