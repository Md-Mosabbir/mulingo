import { apiRequest } from "./client";

/** --- Rooms (DM) --- */
export function createOrGetDmRoom(otherUserId) {
  return apiRequest("/rooms", {
    method: "POST",
    body: { other_user_id: Number(otherUserId) },
  });
}

export function listMyRooms() {
  return apiRequest("/rooms");
}

export function getRoom(roomId) {
  return apiRequest(`/rooms/${Number(roomId)}`);
}

export function getRoomMessages(roomId, { cursor, limit = 40 } = {}) {
  const q = new URLSearchParams();
  if (cursor != null) q.set("cursor", String(cursor));
  q.set("limit", String(limit));
  return apiRequest(`/rooms/${Number(roomId)}/messages?${q}`);
}

/** --- Groups --- */
export function createGroup({ name, description, image_url }) {
  return apiRequest("/groups", {
    method: "POST",
    body: {
      name,
      description: description ?? undefined,
      image_url: image_url ?? undefined,
    },
  });
}

export function listMyGroups() {
  return apiRequest("/groups");
}

export function getGroup(groupId) {
  return apiRequest(`/groups/${Number(groupId)}`);
}

export function updateGroup(groupId, body) {
  return apiRequest(`/groups/${Number(groupId)}`, {
    method: "PUT",
    body,
  });
}

export function getGroupMessages(groupId, { cursor, limit = 40 } = {}) {
  const q = new URLSearchParams();
  if (cursor != null) q.set("cursor", String(cursor));
  q.set("limit", String(limit));
  return apiRequest(`/groups/${Number(groupId)}/messages?${q}`);
}

export function addGroupMember(groupId, user_id) {
  return apiRequest(`/groups/${Number(groupId)}/members`, {
    method: "POST",
    body: { user_id },
  });
}

export function removeGroupMember(groupId, userId) {
  return apiRequest(`/groups/${Number(groupId)}/members/${Number(userId)}`, {
    method: "DELETE",
  });
}

export function muteGroupMember(groupId, userId, duration_minutes) {
  const body = {};
  if (duration_minutes != null) body.duration_minutes = duration_minutes;
  return apiRequest(`/groups/${Number(groupId)}/members/${Number(userId)}/mute`, {
    method: "POST",
    body,
  });
}

export function unmuteGroupMember(groupId, userId) {
  return apiRequest(`/groups/${Number(groupId)}/members/${Number(userId)}/mute`, {
    method: "DELETE",
  });
}

export function changeGroupMemberRole(groupId, userId, role) {
  return apiRequest(`/groups/${Number(groupId)}/members/${Number(userId)}/role`, {
    method: "PUT",
    body: { role },
  });
}

/** --- Users / search --- */
export function getUserProfile(userId) {
  return apiRequest(`/users/${Number(userId)}`);
}

export function updateMyProfile(userId, body) {
  return apiRequest(`/users/${Number(userId)}`, {
    method: "PUT",
    body,
  });
}

export function updateMyProfileSelf(body) {
  return apiRequest("/users/me", {
    method: "PUT",
    body,
  });
}

export function searchUsersList(query, limit = 20) {
  const q = encodeURIComponent(query.trim());
  return apiRequest(`/users?q=${q}&limit=${limit}`);
}

/** Alternate search endpoint used elsewhere in the backend */
export function searchUsersByUsername(username) {
  return apiRequest(`/search?username=${encodeURIComponent(username.trim())}`);
}

/** --- Reports (demo / rubric) --- */
export function getReportChatOverview(limit = 50) {
  return apiRequest(`/reports/my-chat-overview-view?limit=${limit}`);
}

export function getReportChatsInSubquery(limit = 50) {
  return apiRequest(`/reports/chats-in-subquery?limit=${limit}`);
}
