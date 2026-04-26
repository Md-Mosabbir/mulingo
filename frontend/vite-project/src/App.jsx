import { useEffect, useMemo, useState } from "react";
import ChatPanel from "./components/ChatPanel";
import ConversationList from "./components/ConversationList";
import SidebarRail from "./components/SidebarRail";
import TopOptionBar from "./components/TopOptionBar";
import { fetchConversations, fetchMessages } from "./lib/chatApi";

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function loadConversations() {
      const results = await fetchConversations();
      setConversations(results);
      if (results[0]) {
        setActiveConversationId(results[0].id);
      }
    }

    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;

    async function loadMessages() {
      const results = await fetchMessages(activeConversationId);
      setMessages(results);
    }

    loadMessages();
  }, [activeConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [conversations, activeConversationId],
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0B1120] pb-2 text-white">
      <TopOptionBar />



      <main className="flex-1 min-h-0 grid grid-cols-1 gap-2 w-full px-2 md:grid-cols-[1fr_3fr] mt-2">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
        />
        <ChatPanel activeConversation={activeConversation} messages={messages} />
      </main>

    </div>
  );
}

export default App;
