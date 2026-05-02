import { useState } from "react";
import notchIcon from "../assets/Chatnotch.svg";
import userNotchIcon from "../assets/ChatNotch_User.svg";

export default function MessageBubble({ message, conversation, isGroup, senderDisplayName }) {
  const isUser = message.sender === "user";
  const [showOriginal, setShowOriginal] = useState(false);
  const hasOriginalText = Boolean(message.originalText?.trim());
  const senderInitials =
    (isGroup && !isUser ? senderDisplayName : conversation?.avatar) ||
    conversation?.avatar ||
    "A";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${isUser ? "max-w-[min(100%,20rem)] md:max-w-md" : "max-w-[min(100%,28rem)] md:max-w-xl"}`}>
        {!isUser && isGroup && senderDisplayName && (
          <p className="mb-1 ml-1 text-[11px] font-semibold uppercase tracking-wide text-[#A78BFA]">
            {senderDisplayName}
          </p>
        )}
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
              <div className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/60 bg-[#d7d7d7] text-sm font-semibold text-[#2f2f2f]">
                {message.avatarUrl ? (
                  <img src={message.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  String(senderInitials).slice(0, 2).toUpperCase()
                )}
              </div>
            )}

            <div className={!isUser ? "pl-16 pr-2" : ""}>
              <p className="font-poppins text-[16px] leading-[1.35] tracking-[-0.01em] text-white md:text-[18px]">
                {message.text}
              </p>

              {hasOriginalText && showOriginal && (
                <p className="font-inter mt-2 text-[16px] italic leading-tight text-[#C9BCC7]">{message.originalText}</p>
              )}
            </div>
          </div>
          <img
            src={isUser ? userNotchIcon : notchIcon}
            alt=""
            className={[
              "pointer-events-none absolute bottom-[-4px] z-10 w-5 select-none md:w-6",
              isUser ? "right-[-2px]" : "left-[-2px]",
            ].join(" ")}
          />
        </div>

        <div className={`mt-1 flex items-center gap-5 text-white/90 ${isUser ? "justify-end" : "justify-between"}`}>
          {hasOriginalText && (
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
      </div>
    </div>
  );
}
