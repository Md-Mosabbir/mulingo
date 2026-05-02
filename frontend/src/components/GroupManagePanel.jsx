import { useEffect, useState } from "react";
import {
  addGroupMember,
  changeGroupMemberRole,
  muteGroupMember,
  removeGroupMember,
  unmuteGroupMember,
  updateGroup,
} from "../api/mulingo";
import UserPickerModal from "./UserPickerModal";

function roleLabel(role) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "Member";
}

export default function GroupManagePanel({
  groupId,
  groupName,
  groupImage,
  members,
  currentUserId,
  myRole,
  onRefresh,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editName, setEditName] = useState(groupName || "");
  const [editImage, setEditImage] = useState(groupImage || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const isAdmin = myRole === "owner" || myRole === "admin";

  useEffect(() => {
    setEditName(groupName || "");
    setEditImage(groupImage || "");
  }, [groupName, groupImage]);

  async function handleSaveGroupMeta(e) {
    e.preventDefault();
    if (!isAdmin) return;
    setBusy(true);
    setMsg("");
    try {
      await updateGroup(groupId, {
        name: editName.trim() || undefined,
        image_url: editImage.trim() || undefined,
      });
      await onRefresh?.();
      setMsg("Group updated.");
    } catch (err) {
      setMsg(err.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddMember(user) {
    setBusy(true);
    setMsg("");
    try {
      await addGroupMember(groupId, user.user_id);
      await onRefresh?.();
      setMsg("Member added.");
    } catch (err) {
      setMsg(err.message || "Could not add member");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(userId) {
    if (!window.confirm("Remove this member from the group?")) return;
    setBusy(true);
    setMsg("");
    try {
      await removeGroupMember(groupId, userId);
      await onRefresh?.();
    } catch (err) {
      setMsg(err.message || "Remove failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleMute(userId, mute) {
    setBusy(true);
    setMsg("");
    try {
      if (mute) await muteGroupMember(groupId, userId);
      else await unmuteGroupMember(groupId, userId);
      await onRefresh?.();
    } catch (err) {
      setMsg(err.message || "Mute change failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleRole(userId, role) {
    setBusy(true);
    setMsg("");
    try {
      await changeGroupMemberRole(groupId, userId, role);
      await onRefresh?.();
    } catch (err) {
      setMsg(err.message || "Role change failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <form onSubmit={handleSaveGroupMeta} className="rounded-2xl border border-[#273149] bg-[#141F35] p-4 space-y-3">
          <p className="text-sm font-semibold text-white">Edit group</p>
          <div>
            <label className="text-xs text-[#9CA3AF]">Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#34415E] bg-[#0E1628] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF]">Image URL</label>
            <input
              value={editImage}
              onChange={(e) => setEditImage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#34415E] bg-[#0E1628] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[#7b61ff] px-3 py-2 text-xs font-semibold text-white hover:bg-[#6b52e0] disabled:opacity-50"
          >
            Save group
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-[#273149] bg-[#141F35] p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-sm font-semibold text-white">Members ({members?.length ?? 0})</p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-full bg-[#1F2937] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#374151] transition-colors"
            >
              Add member
            </button>
          )}
        </div>

        {msg && <p className="mb-2 text-xs text-[#93C5FD]">{msg}</p>}

        <div className="space-y-2">
          {(members || []).map((m) => {
            const isSelf = m.user_id === currentUserId;
            const canModerate = isAdmin && !isSelf && m.member_role !== "owner";
            return (
              <div key={m.user_id} className="flex flex-col gap-2 rounded-xl bg-[#0E1628] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#E5E7EB]">{m.username}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {roleLabel(m.member_role)}
                    {m.is_muted ? " · muted" : ""}
                  </p>
                </div>

                {canModerate && (
                  <div className="flex flex-wrap gap-1">
                    <select
                      value={m.member_role === "admin" ? "admin" : "member"}
                      onChange={(e) => handleRole(m.user_id, e.target.value)}
                      className="rounded-lg border border-[#34415E] bg-[#111926] px-2 py-1 text-[11px] text-white"
                      disabled={busy}
                      title="Change role"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleMute(m.user_id, !m.is_muted)}
                      className="rounded-lg border border-[#34415E] px-2 py-1 text-[11px] text-[#E5E7EB] hover:bg-[#1F2937]"
                    >
                      {m.is_muted ? "Unmute" : "Mute"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(m.user_id)}
                      className="rounded-lg border border-red-900/50 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-[#33405D] px-3 py-3 text-[11px] text-[#9CA3AF]">
          Ban / unban endpoints exist but return{" "}
          <span className="font-mono text-[#FBBF24]">501</span> until the schema supports persisted bans.
        </div>
      </div>

      <UserPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectUser={handleAddMember}
        title="Add group member"
      />
    </div>
  );
}
