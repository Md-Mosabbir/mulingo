import { Request, Response } from 'express';
import pool from '../config/db';

export const subscribeUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { subscription } = req.body;

  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Missing userId or subscription' });
  }

  try {
    const subscriptionJson = JSON.stringify(subscription);
    
    // Check if this subscription already exists for this user to avoid duplicates
    const [existing] = await pool.execute(
      'SELECT id FROM push_subscriptions WHERE user_id = ? AND subscription_json = ?',
      [userId, subscriptionJson]
    );

    if ((existing as any[]).length > 0) {
      return res.status(200).json({ message: 'Subscription already registered' });
    }

    await pool.execute(
      'INSERT INTO push_subscriptions (user_id, subscription_json) VALUES (?, ?)',
      [userId, subscriptionJson]
    );

    res.status(201).json({ message: 'Subscription saved' });
  } catch (error: any) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unsubscribeUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { subscription } = req.body;

  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Missing userId or subscription' });
  }

  try {
    const subscriptionJson = JSON.stringify(subscription);
    await pool.execute(
      'DELETE FROM push_subscriptions WHERE user_id = ? AND subscription_json = ?',
      [userId, subscriptionJson]
    );
    res.status(200).json({ message: 'Unsubscribed' });
  } catch (error: any) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
