import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '../utils/response';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Get token from "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) return fail(res, 'Invalid token', 403);
      
      (req as any).user = user; // Attach user to request object
      next();
    });
  } else {
    return fail(res, 'Authorization header missing', 401);
  }
};