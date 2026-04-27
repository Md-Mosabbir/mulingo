import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ChatPanel from "./components/ChatPanel";
import ConversationList from "./components/ConversationList";
import SidebarRail from "./components/SidebarRail";
import TopOptionBar from "./components/TopOptionBar";
import Login from "./pages/Login";
import { fetchConversations, fetchMessages } from "./lib/chatApi";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [nicknamesByConversation, setNicknamesByConversation] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadConversations() {
      try {
        const results = await fetchConversations();
        setConversations(results);
        if (results[0]) {
          setActiveConversationId(results[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    }

    loadConversations();
  }, [token, navigate]);

  useEffect(() => {
    if (!activeConversationId || !token) return;

    async function loadMessages() {
      try {
        const results = await fetchMessages(activeConversationId);
        setMessages(results);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }

    loadMessages();
  }, [activeConversationId, token]);

  const handleLoginSuccess = async (googleResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleResponse.credential }),
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const activeConversation = useMemo(
    () =>
      conversations
        .map((conversation) => {
          const nickname = nicknamesByConversation[conversation.id]?.trim();
          return {
            ...conversation,
            displayName: nickname || conversation.name,
            nickname: nickname || "",
          };
        })
        .find((conversation) => conversation.id === activeConversationId),
    [conversations, activeConversationId, nicknamesByConversation],
  );

  const displayConversations = useMemo(
    () =>
      conversations.map((conversation) => {
        const nickname = nicknamesByConversation[conversation.id]?.trim();
        return {
          ...conversation,
          displayName: nickname || conversation.name,
          nickname: nickname || "",
        };
      }),
    [conversations, nicknamesByConversation],
  );

  function handleNicknameChange(conversationId, nickname) {
    setNicknamesByConversation((prev) => ({
      ...prev,
      [conversationId]: nickname,
    }));
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />
        }
      />
      <Route
        path="/"
        element={
          token ? (
            <div className="flex flex-col h-screen overflow-hidden bg-[#0B1120] pb-2 text-white font-inter">
              <TopOptionBar user={user} onLogout={handleLogout} />

              <main className="flex-1 min-h-0 grid grid-cols-1 gap-2 w-full px-2 md:grid-cols-[1fr_3fr] mt-2">
                <ConversationList
                  conversations={displayConversations}
                  activeId={activeConversationId}
                  onSelect={setActiveConversationId}
                />
                <ChatPanel
                  activeConversation={activeConversation}
                  messages={messages}
                  onNicknameChange={handleNicknameChange}
                />
              </main>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;


