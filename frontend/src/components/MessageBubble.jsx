import PropertyPreviewCard from "./PropertyPreviewCard";
import { useState } from "react";
import notchIcon from "../../public/Chatnotch.svg";
import userNotchIcon from "../../public/ChatNotch_User.svg";

function MessageBubble({ message, conversation }) {
  const isUser = message.sender === "user";
  const [showOriginal, setShowOriginal] = useState(false);
  const hasOriginalText = Boolean(message.originalText?.trim());
  const senderInitials = conversation?.avatar ?? "A";
  const senderName = conversation?.displayName ?? conversation?.name ?? "Sender";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${isUser ? "max-w-80" : "max-w-116"}`}>
        {message.type === "property" ? (
          <>
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${isUser ? "bg-[#7b61ff] text-white" : "bg-[#1F2937] text-white"
                }`}
            >
              <PropertyPreviewCard text={message.text} stats={message.stats} photos={message.photos} />
            </div>
            <p className={`mt-1 text-xs text-[#9ca3af] ${isUser ? "text-right" : "text-left"}`}>
              {message.time}
            </p>
          </>
        ) : (
          <>
            <div className="relative">
              <div
                className={[
                  "relative overflow-hidden rounded-[28px] px-5 py-5 shadow-lg",
                  isUser
                    ? "bg-linear-to-br from-[#7A5CF7] to-[#6648E5] text-white"
                    : "bg-linear-to-br from-[#B856B2] to-[#984B93] text-white",
                  !isUser ? "pt-6" : "",
                ].join(" ")}
              >
                {!isUser && (
                  <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/60 bg-[#d7d7d7] text-sm font-semibold text-[#2f2f2f]">
                    {message.avatarUrl ? (
                      <img src={message.avatarUrl} alt={`${senderName} profile`} className="h-full w-full object-cover" />
                    ) : (
                      senderInitials
                    )}
                  </div>
                )}

                <div className={!isUser ? "pl-16 pr-2" : ""}>
                  <p className="font-poppins text-[16px] leading-[1.35] tracking-[-0.01em] text-white md:text-[18px]">
                    {message.text}
                  </p>

                  {hasOriginalText && showOriginal && (
                    <p className="font-inter mt-2 text-[16px] italic leading-tight text-[#C9BCC7]">
                      {message.originalText}
                    </p>
                  )}
                </div>
              </div>
              <img
                src={isUser ? userNotchIcon : notchIcon}
                alt="notch"
                className={[
                  "pointer-events-none absolute bottom-[-4px] z-10 w-5 select-none md:w-6",
                  isUser ? "right-[-2px]" : "left-[-2px]",
                ].join(" ")}
              />
            </div>

            <div className={`mt-1 flex items-center gap-5 text-white/90 ${isUser ? "justify-end" : "justify-between"}`}>
              {hasOriginalText && !isUser && (
                <button
                  type="button"
                  onClick={() => setShowOriginal((prev) => !prev)}
                  className="flex items-center gap-2 rounded-md px-1 py-0.5 text-[14px] font-medium text-[#E7E6EA] transition hover:text-white"
                >
                  <span className="text-[20px] leading-none">{showOriginal ? "◉" : "◎"}</span>
                  <span>{showOriginal ? "Hide original" : "See original"}</span>
                </button>
              )}
              <p className={`text-[14px] text-[#E7E6EA] ${isUser ? "text-right" : "ml-auto"}`}>{message.time}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
