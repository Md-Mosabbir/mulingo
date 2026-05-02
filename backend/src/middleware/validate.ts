import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { fail } from '../utils/response';

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const first = errors.array({ onlyFirstError: true })[0];
  return fail(res, first?.msg || 'Validation error', 422);
}

