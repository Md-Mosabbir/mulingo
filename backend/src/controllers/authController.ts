import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getUserByGoogleId, createNewUser, User } from '../sql/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // 1. Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const { sub: google_id, email, name, picture, given_name, family_name } = payload;

    // 2. Use our Model to talk to DB
    let user = await getUserByGoogleId(google_id);

    if (!user) {
      const newUser: User = {
        google_id,
        email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        first_name: given_name || name?.split(' ')[0] || 'User',
        last_name: family_name || name?.split(' ').slice(1).join(' ') || '',
        profile_picture: picture || '',
      };
      const insertId = await createNewUser(newUser);
      user = { ...newUser, user_id: insertId };
    }

    // 3. Send back JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const accessToken = jwt.sign(
      { id: user.user_id, email: user.email, username: user.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        picture: user.profile_picture,
      },
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};