import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Get token from "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) return res.sendStatus(403); // Forbidden if token is invalid
      
      (req as any).user = user; // Attach user to request object
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized if no header
  }
};