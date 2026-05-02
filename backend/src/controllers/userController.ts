import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { fail, ok } from '../utils/response';
import { getLanguageIdByCode, getUserById, listUsers, updateUserProfile } from '../sql/user/profile';

export async function getUserProfile(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return fail(res, 'Invalid user id', 400);

    const user = await getUserById(userId);
    if (!user) return fail(res, 'User not found', 404);

    return ok(res, user);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return fail(res, 'Invalid user id', 400);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);
    if (authUserId !== userId) return fail(res, 'Forbidden', 403);

    const data = matchedData(req, { locations: ['body'] }) as {
      display_name?: string;
      preferred_language_code?: string;
      preferred_language_id?: number;
      avatar_url?: string;
    };

    // Schema has first_name/last_name (no display_name column). We store display_name into first_name.
    const firstName = typeof data.display_name === 'string' ? data.display_name.trim() : null;
    const profilePicture = typeof data.avatar_url === 'string' ? data.avatar_url.trim() : null;

    let preferredLanguageId: number | null = null;
    if (typeof data.preferred_language_id === 'number') {
      preferredLanguageId = data.preferred_language_id;
    } else if (typeof data.preferred_language_code === 'string') {
      preferredLanguageId = await getLanguageIdByCode(data.preferred_language_code.trim());
      if (!preferredLanguageId) return fail(res, 'Unknown preferred language code', 400);
    }

    await updateUserProfile({
      userId,
      firstName,
      profilePicture,
      preferredLanguageId,
    });

    const updated = await getUserById(userId);
    return ok(res, updated);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function updateMyOwnProfile(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const data = matchedData(req, { locations: ['body'] }) as {
      display_name?: string;
      preferred_language_code?: string;
      preferred_language_id?: number;
      avatar_url?: string;
    };

    const firstName = typeof data.display_name === 'string' ? data.display_name.trim() : null;
    const profilePicture = typeof data.avatar_url === 'string' ? data.avatar_url.trim() : null;

    let preferredLanguageId: number | null = null;
    if (typeof data.preferred_language_id === 'number') {
      preferredLanguageId = data.preferred_language_id;
    } else if (typeof data.preferred_language_code === 'string') {
      preferredLanguageId = await getLanguageIdByCode(data.preferred_language_code.trim());
      if (!preferredLanguageId) return fail(res, 'Unknown preferred language code', 400);
    }

    await updateUserProfile({
      userId: authUserId,
      firstName,
      profilePicture,
      preferredLanguageId,
    });

    const updated = await getUserById(authUserId);
    return ok(res, updated);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

export async function listOrSearchUsers(req: Request, res: Response) {
  try {
    const authUserId = Number((req as any).user?.id);
    if (!Number.isFinite(authUserId)) return fail(res, 'Unauthorized', 401);

    const q = String(req.query.q || req.query.username || '').trim();
    if (!q) return fail(res, 'Query is required', 400);

    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const users = await listUsers(authUserId, q, Number.isFinite(limit) ? limit : 20);
    return ok(res, users);
  } catch (err) {
    console.error(err);
    return fail(res, 'Internal server error', 500);
  }
}

