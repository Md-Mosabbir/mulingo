import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { translateText } from '../services/translation';
import { fail, ok } from '../utils/response';

export const llmTestValidation = [
  body('text').isString().isLength({ min: 1, max: 5000 }).withMessage('text must be 1-5000 chars'),
  body('from').isString().isLength({ min: 2, max: 10 }).withMessage('from must be a language code'),
  body('to').isString().isLength({ min: 2, max: 10 }).withMessage('to must be a language code'),
];

export async function testTranslation(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0]?.msg || 'Validation error', 422);

  try {
    const { text, from, to } = req.body as { text: string; from: string; to: string };
    const translated = await translateText({ text, from, to });
    return ok(res, { original: text, from, to, translated });
  } catch (error: any) {
    console.error('LLM test route error:', error);
    return fail(res, error?.message || 'LLM translation test failed', 500);
  }
}

