import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChatPanel from "./components/ChatPanel";
import ConversationList from "./components/ConversationList";
import TopOptionBar from "./components/TopOptionBar";
import Login from "./pages/Login";
import ReportsPage from "./pages/Reports";
import ProfileModal from "./components/ProfileModal";
import CreateGroupModal from "./components/CreateGroupModal";
import {
  createOrGetDmRoom,
  getGroup,
  getGroupMessages,
  getRoom,
  getRoomMessages,
  getUserProfile,
  listMyGroups,
  listMyRooms,
} from "./api/mulingo";
import { disconnectChatSocket, getChatSocket } from "./socket/chatSocket";
import { getUserIdFromToken } from "./utils/jwt";
import { formatListTime, formatMessageTime } from "./utils/format";
import { languageLabelById } from "./constants/languages";

const FAV_KEY = "mulingo:favorites";

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpointPx;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);

    const onChange = () => setIsMobile(mql.matches);
    onChange();

    if (typeof mql.addEventListener === "function") mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (typeof mql.removeEventListener === "function") mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [breakpointPx]);

  return isMobile;
}

function rowToMessage(row, myId) {
  const translated = row.translated_text ?? row.original_text ?? "";
  const original = row.original_text ?? "";
  const differs = Boolean(original) && String(translated) !== String(original);
  return {
    id: row.message_id,
    sender_id: row.sender_id,
    sender: Number(row.sender_id) === Number(myId) ? "user" : "other",
    text: translated,
    originalText: differs ? original : null,
    time: formatMessageTime(row.sent_at),
    senderUsername: row.sender_username,
    avatarUrl: row.sender_avatar,
  };
}

function socketToMessage(p, myId) {
  const translated = p.text ?? "";
  const original = p.originalText ?? "";
  const differs = Boolean(original) && String(translated) !== String(original);
  return {
    id: p.messageId,
    sender_id: p.senderId,
    sender: Number(p.senderId) === Number(myId) ? "user" : "other",
    text: translated,
    originalText: differs ? original : null,
    time: formatMessageTime(p.sentAt),
    senderUsername: null,
    avatarUrl: null,
  };
}

async function mapDmRow(roomRow, myUserId) {
  const detail = await getRoom(roomRow.chat_id);
  const participants = detail.participants || [];
  const other = participants.find((p) => Number(p.user_id) !== Number(myUserId));
  const title = other?.username || detail.chat_name || `Direct · ${detail.chat_id}`;
  const lang =
    other?.preferred_language_id != null ? languageLabelById(other.preferred_language_id) : null;

  return {
    key: `dm:${detail.chat_id}`,
    kind: "dm",
    chatId: detail.chat_id,
    title,
    preview: "Open to chat across languages",
    timeLabel: formatListTime(roomRow.updated_at),
    status: "online",
    avatar: (title || "?").slice(0, 2).toUpperCase(),
    avatarUrl: other?.profile_picture || null,
    updatedAt: roomRow.updated_at,
    otherUser: other ? { user_id: other.user_id, username: other.username } : null,
    participants,
    languageLabel: lang || "Unknown",
  };
}

async function mapGroupRow(groupRow, myUserId) {
  const detail = await getGroup(groupRow.chat_id);
  const members = detail.members || [];
  const me = members.find((m) => Number(m.user_id) === Number(myUserId));

  return {
    key: `group:${detail.chat_id}`,
    kind: "group",
    chatId: detail.chat_id,
    title: detail.chat_name || `Group · ${detail.chat_id}`,
    preview: "Group conversation",
    timeLabel: formatListTime(groupRow.updated_at),
    status: "seen",
    avatar: (detail.chat_name || "GR").slice(0, 2).toUpperCase(),
    avatarUrl: detail.chat_image || null,
    updatedAt: groupRow.updated_at,
    members,
    myRole: me?.member_role,
    participants: members,
    languageLabel: "Multiple languages",
  };
}

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState("");

  const [activeChat, setActiveChat] = useState({ kind: null, chatId: null });
  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const [nicknamesByConversation, setNicknamesByConversation] = useState({});
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [msgNextCursor, setMsgNextCursor] = useState(null);
  const [msgHasMore, setMsgHasMore] = useState(true);

  const [chatMeta, setChatMeta] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingMap, setTypingMap] = useState({});
  const [sendError, setSendError] = useState("");
  const [sendLangId, setSendLangId] = useState(null);

  const [messageSearch, setMessageSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });

  const didPickInitial = useRef(false);

  const handleLogout = useCallback(() => {
    disconnectChatSocket();
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setProfile(null);
    setConversations([]);
    setActiveChat({ kind: null, chatId: null });
    setMessages([]);
    setChatMeta(null);
    didPickInitial.current = false;
    navigate("/login");
  }, [navigate]);

  /** Bootstrap session from JWT */
  useEffect(() => {
    if (!token) return;
    const uid = getUserIdFromToken(token);
    if (!uid) {
      handleLogout();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const p = await getUserProfile(uid);
        if (cancelled) return;
        setProfile(p);
        setUser({
          id: p.user_id,
          username: p.username,
          picture: p.profile_picture,
        });
        setSendLangId(Number(p.preferred_language_id) || 1);
      } catch {
        handleLogout();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, handleLogout]);

  useEffect(() => {
    if (!token) didPickInitial.current = false;
  }, [token]);

  const refreshConversations = useCallback(async () => {
    if (!profile?.user_id) return;
    setConvLoading(true);
    setConvError("");
    try {
      const [rooms, groups] = await Promise.all([listMyRooms(), listMyGroups()]);
      const dmItems = await Promise.all((rooms || []).map((r) => mapDmRow(r, profile.user_id)));
      const groupItems = await Promise.all((groups || []).map((g) => mapGroupRow(g, profile.user_id)));
      const merged = [...dmItems, ...groupItems].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      setConversations(merged);
    } catch (e) {
      console.error(e);
      setConvError(e.message || "Could not load chats");
    } finally {
      setConvLoading(false);
    }
  }, [profile?.user_id]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (convLoading || didPickInitial.current || conversations.length === 0) return;
    if (isMobile) return;
    const first = conversations[0];
    setActiveChat({ kind: first.kind, chatId: first.chatId });
    didPickInitial.current = true;
  }, [convLoading, conversations, isMobile]);

  /** Socket lifecycle */
  useEffect(() => {
    if (!token) {
      disconnectChatSocket();
      setSocketConnected(false);
      return;
    }
    const socket = getChatSocket(token);
    if (!socket) return;

    function onConnect() {
      setSocketConnected(true);
    }
    function onDisconnect() {
      setSocketConnected(false);
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setSocketConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [token]);

  /** Realtime events */
  useEffect(() => {
    if (!token || !profile?.user_id) return;
    const socket = getChatSocket(token);
    if (!socket) return;

    function onRecv(p) {
      const myId = profile.user_id;
      setConversations((prev) =>
        prev.map((c) =>
          c.chatId === p.chatId
            ? {
                ...c,
                preview: String(p.text || "").slice(0, 140),
                timeLabel: formatListTime(new Date().toISOString()),
              }
            : c,
        ),
      );

      const current = activeChatRef.current;
      if (!current?.chatId || current.chatId !== p.chatId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === p.messageId)) return prev;
        const nm = socketToMessage(p, myId);
        return [...prev, nm].sort((a, b) => a.id - b.id);
      });
    }

    function onTyping({ chatId, userId, isTyping }) {
      if (Number(userId) === Number(profile.user_id)) return;
      setTypingMap((prev) => {
        const next = { ...prev };
        const inner = { ...(next[chatId] || {}) };
        inner[userId] = isTyping;
        next[chatId] = inner;
        return next;
      });
    }

    function onSendErr(evt) {
      setSendError(evt?.message || "Could not send message");
    }

    socket.on("receive_message", onRecv);
    socket.on("typing", onTyping);
    socket.on("send_message_error", onSendErr);

    return () => {
      socket.off("receive_message", onRecv);
      socket.off("typing", onTyping);
      socket.off("send_message_error", onSendErr);
    };
  }, [token, profile?.user_id]);

  /** Load header/meta for active chat */
  useEffect(() => {
    if (!activeChat.chatId || !token || !profile?.user_id) return;
    let cancelled = false;
    (async () => {
      try {
        if (activeChat.kind === "dm") {
          const d = await getRoom(activeChat.chatId);
          if (!cancelled) setChatMeta({ kind: "dm", participants: d.participants || [] });
        } else {
          const d = await getGroup(activeChat.chatId);
          const members = d.members || [];
          const me = members.find((m) => Number(m.user_id) === Number(profile.user_id));
          if (!cancelled) {
            setChatMeta({
              kind: "group",
              members,
              myRole: me?.member_role,
              title: d.chat_name,
              image: d.chat_image,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChat.chatId, activeChat.kind, token, profile?.user_id]);

  /** Load messages */
  useEffect(() => {
    if (!activeChat.chatId || !profile?.user_id) return;
    let cancelled = false;
    (async () => {
      setMessagesLoading(true);
      setMessages([]);
      setMsgNextCursor(null);
      setMsgHasMore(true);
      setSendError("");
      try {
        const api = activeChat.kind === "group" ? getGroupMessages : getRoomMessages;
        const data = await api(activeChat.chatId, { limit: 45 });
        if (cancelled) return;
        const items = data.items || [];
        const chronological = [...items].reverse().map((r) => rowToMessage(r, profile.user_id));
        setMessages(chronological);
        setMsgNextCursor(data.next_cursor ?? null);
        setMsgHasMore(items.length >= 45);
      } catch (e) {
        if (!cancelled) setSendError(e.message || "Could not load messages");
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChat.chatId, activeChat.kind, profile?.user_id, profile?.preferred_language_id]);

  /** Join socket room + read receipts */
  useEffect(() => {
    if (!token || !activeChat.chatId) return;
    const socket = getChatSocket(token);
    if (!socket) return;
    socket.emit("join_room", { chatId: activeChat.chatId });
    return () => {
      socket.emit("leave_room", { chatId: activeChat.chatId });
    };
  }, [token, activeChat.chatId]);

  useEffect(() => {
    if (!token || !activeChat.chatId || messages.length === 0) return;
    const socket = getChatSocket(token);
    if (!socket?.connected) return;
    const last = messages[messages.length - 1];
    const t = setTimeout(() => {
      socket.emit("read_receipt", { chatId: activeChat.chatId, messageId: last.id });
    }, 400);
    return () => clearTimeout(t);
  }, [token, activeChat.chatId, messages]);

  const loadOlderMessages = useCallback(async () => {
    if (
      !activeChat.chatId ||
      !msgHasMore ||
      loadingOlder ||
      messagesLoading ||
      msgNextCursor == null ||
      !profile?.user_id
    )
      return;
    setLoadingOlder(true);
    try {
      const api = activeChat.kind === "group" ? getGroupMessages : getRoomMessages;
      const data = await api(activeChat.chatId, { cursor: msgNextCursor, limit: 45 });
      const items = data.items || [];
      const olderFirst = [...items].reverse().map((r) => rowToMessage(r, profile.user_id));
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...olderFirst.filter((m) => !ids.has(m.id)), ...prev];
        return merged.sort((a, b) => a.id - b.id);
      });
      setMsgNextCursor(data.next_cursor ?? null);
      setMsgHasMore(items.length >= 45);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOlder(false);
    }
  }, [
    activeChat.chatId,
    activeChat.kind,
    msgHasMore,
    loadingOlder,
    messagesLoading,
    msgNextCursor,
    profile?.user_id,
  ]);

  const refreshActiveGroupMeta = useCallback(async () => {
    if (activeChat.kind !== "group" || !activeChat.chatId || !profile?.user_id) return;
    const d = await getGroup(activeChat.chatId);
    const members = d.members || [];
    const me = members.find((m) => Number(m.user_id) === Number(profile.user_id));
    setChatMeta({
      kind: "group",
      members,
      myRole: me?.member_role,
      title: d.chat_name,
      image: d.chat_image,
    });
    await refreshConversations();
  }, [activeChat.kind, activeChat.chatId, profile?.user_id, refreshConversations]);

  const handleLoginSuccess = async (googleResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleResponse.credential }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        console.error(data.error || "Login failed");
        return;
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        if (data.user) {
          setUser({
            id: data.user.id,
            username: data.user.username,
            picture: data.user.picture,
          });
        }
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleNicknameChange = useCallback((conversationId, nickname) => {
    setNicknamesByConversation((prev) => ({
      ...prev,
      [conversationId]: nickname,
    }));
  }, []);

  const activeConversation = useMemo(() => {
    if (!activeChat.chatId) return null;
    const c = conversations.find((x) => x.kind === activeChat.kind && x.chatId === activeChat.chatId);
    if (!c) return null;
    const nickname = nicknamesByConversation[c.chatId]?.trim();
    return {
      ...c,
      kind: c.kind,
      id: c.chatId,
      chatId: c.chatId,
      name: c.title,
      displayName: nickname || c.title,
      nickname: nickname || "",
      language: c.languageLabel || "—",
      preview: c.preview,
      time: c.timeLabel,
      avatar: c.avatar,
      avatarUrl: c.avatarUrl,
      sharedItems: [],
    };
  }, [conversations, activeChat, nicknamesByConversation]);

  const filteredMessages = useMemo(() => {
    const q = messageSearch.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        String(m.text || "")
          .toLowerCase()
          .includes(q) ||
        String(m.originalText || "")
          .toLowerCase()
          .includes(q) ||
        String(m.senderUsername || "")
          .toLowerCase()
          .includes(q),
    );
  }, [messages, messageSearch]);

  const typingLabel = useMemo(() => {
    if (!activeChat.chatId) return "";
    const inner = typingMap[activeChat.chatId] || {};
    const ids = Object.entries(inner)
      .filter(([, v]) => v)
      .map(([uid]) => Number(uid));
    if (!ids.length) return "";

    const resolveName = (id) => {
      if (chatMeta?.kind === "group") {
        return chatMeta.members.find((x) => Number(x.user_id) === id)?.username;
      }
      if (chatMeta?.kind === "dm") {
        return chatMeta.participants.find((x) => Number(x.user_id) === id)?.username;
      }
      return null;
    };

    const names = ids.map((id) => resolveName(id) || `User ${id}`);
    return `${names.join(", ")} typing…`;
  }, [typingMap, activeChat.chatId, chatMeta]);

  const subtitle = typingLabel || (socketConnected ? "Live · messages translated for you" : "Connecting…");
  const isLive = !typingLabel && socketConnected;

  const isMutedSelf = useMemo(() => {
    if (!chatMeta || !profile?.user_id) return false;
    if (chatMeta.kind === "dm") {
      const me = chatMeta.participants.find((p) => Number(p.user_id) === Number(profile.user_id));
      return Boolean(me?.is_muted);
    }
    const me = chatMeta.members.find((m) => Number(m.user_id) === Number(profile.user_id));
    return Boolean(me?.is_muted);
  }, [chatMeta, profile?.user_id]);

  async function handleStartDm(otherUser) {
    const uid = otherUser.user_id ?? otherUser.id;
    try {
      const { room_id: roomId } = await createOrGetDmRoom(uid);
      await refreshConversations();
      setActiveChat({ kind: "dm", chatId: roomId });
      didPickInitial.current = true;
    } catch (e) {
      console.error(e);
      setSendError(e.message || "Could not open DM");
    }
  }

  function toggleFavorite() {
    if (!activeConversation?.key) return;
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(activeConversation.key)) next.delete(activeConversation.key);
      else next.add(activeConversation.key);
      localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function handleSend(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const socket = getChatSocket(token);
    if (!socket?.connected) {
      setSendError("Not connected — wait for live connection.");
      return;
    }
    const langId = sendLangId || profile?.preferred_language_id;
    if (!langId) {
      setSendError("Choose a language for outgoing messages (profile or composer).");
      return;
    }
    setSendError("");
    socket.emit("typing", { chatId: activeChat.chatId, isTyping: false });
    socket.emit("send_message", {
      chatId: activeChat.chatId,
      text: trimmed,
      langId: Number(langId),
    });
  }

  function handleTyping(isTyping) {
    const socket = getChatSocket(token);
    if (!socket?.connected || !activeChat.chatId) return;
    socket.emit("typing", { chatId: activeChat.chatId, isTyping });
  }

  const displayConversations = useMemo(() => {
    return conversations.map((c) => {
      const nickname = nicknamesByConversation[c.chatId]?.trim();
      return {
        ...c,
        displayName: nickname || c.title,
        nickname: nickname || "",
      };
    });
  }, [conversations, nicknamesByConversation]);

  const sortedDisplayConversations = useMemo(() => {
    const starred = (c) => favorites.has(c.key);
    return [...displayConversations].sort((a, b) => {
      const fs = Number(starred(b)) - Number(starred(a));
      if (fs !== 0) return fs;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [displayConversations, favorites]);

  const showMobileChat = isMobile && Boolean(activeChat?.chatId);

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />}
      />
      <Route path="/reports" element={token ? <ReportsPage /> : <Navigate to="/login" />} />
      <Route
        path="/"
        element={
          token ? (
            <div className="flex flex-col h-screen overflow-hidden bg-[#0B1120] pb-2 text-white font-inter">
              <TopOptionBar
                user={user}
                onLogout={handleLogout}
                onOpenProfile={() => setProfileOpen(true)}
                onOpenCreateGroup={() => setCreateGroupOpen(true)}
              />

              <ProfileModal
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                profile={profile}
                onSaved={async () => {
                  const uid = getUserIdFromToken(token) ?? profile?.user_id ?? user?.id;
                  if (!uid) return;
                  const p = await getUserProfile(uid);
                  setProfile(p);
                  setUser({ id: p.user_id, username: p.username, picture: p.profile_picture });
                  setSendLangId(Number(p.preferred_language_id) || 1);
                }}
              />

              <CreateGroupModal
                open={createGroupOpen}
                onClose={() => setCreateGroupOpen(false)}
                onCreated={async (group) => {
                  await refreshConversations();
                  const id = group?.chat_id;
                  if (id) {
                    setActiveChat({ kind: "group", chatId: id });
                    didPickInitial.current = true;
                  }
                }}
              />

              {convError && (
                <div className="mx-2 mt-2 rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
                  {convError}
                </div>
              )}

              <motion.main
                className="flex-1 min-h-0 w-full px-2 mt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="h-full min-h-0 grid grid-cols-1 gap-2 md:grid-cols-[1fr_3fr]">
                  {(!isMobile || !showMobileChat) && (
                    <ConversationList
                      conversations={sortedDisplayConversations}
                      activeKind={activeChat.kind}
                      activeChatId={activeChat.chatId}
                      onSelect={(kind, chatId) => setActiveChat({ kind, chatId })}
                      onStartDm={handleStartDm}
                      loading={convLoading}
                    />
                  )}

                  {(!isMobile || showMobileChat) && (
                    <ChatPanel
                      activeConversation={activeConversation}
                      activeKind={activeChat.kind}
                      messages={filteredMessages}
                      allMessagesCount={messages.length}
                      messagesLoading={messagesLoading}
                      loadingOlder={loadingOlder}
                      hasMoreMessages={msgHasMore}
                      onLoadOlder={loadOlderMessages}
                      currentUserId={profile?.user_id}
                      chatMeta={chatMeta}
                      subtitle={subtitle}
                      isLive={isLive}
                      sendError={sendError}
                      onDismissError={() => setSendError("")}
                      onNicknameChange={handleNicknameChange}
                      onSend={handleSend}
                      onTyping={handleTyping}
                      composerDisabled={!socketConnected || isMutedSelf || !activeChat.chatId}
                      composerLangId={sendLangId ?? profile?.preferred_language_id}
                      onComposerLangChange={setSendLangId}
                      messageSearch={messageSearch}
                      onMessageSearchChange={setMessageSearch}
                      isFavorite={activeConversation?.key ? favorites.has(activeConversation.key) : false}
                      onToggleFavorite={toggleFavorite}
                      onRefreshGroupDetail={refreshActiveGroupMeta}
                      isMuted={isMutedSelf}
                      isMobile={isMobile}
                      onMobileBack={() => setActiveChat({ kind: null, chatId: null })}
                    />
                  )}
                </div>
              </motion.main>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
