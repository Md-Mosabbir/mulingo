import { SendHorizontal, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LANGUAGE_OPTIONS } from "../constants/languages";

const EMOJIS = ["😀", "😂", "😍", "😎", "🤝", "🙏", "🔥", "✨", "🎉", "💬", "👍", "❤️", "🌍"];

export default function MessageComposer({
  onSend,
  onTyping,
  disabled,
  sendLangId,
  onSendLangChange,
}) {
  const [message, setMessage] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  function scheduleTypingEnd() {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping?.(false);
    }, 1400);
  }

  function handleEmojiSelect(emoji) {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart ?? message.length;
    const end = input.selectionEnd ?? message.length;
    const nextMessage = `${message.slice(0, start)}${emoji}${message.slice(end)}`;

    setMessage(nextMessage);
    setIsPickerOpen(false);

    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + emoji.length;
      input.setSelectionRange(cursor, cursor);
    });
  }

  function submit() {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setMessage("");
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTyping?.(false);
    inputRef.current?.focus();
  }

  return (
    <footer className="border-t border-[#1F2937] p-3 md:p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-[#9CA3AF]">
        <span className="uppercase tracking-wide font-semibold">Send as</span>
        <select
          value={sendLangId ?? ""}
          onChange={(e) => onSendLangChange?.(Number(e.target.value))}
          disabled={disabled}
          className="rounded-lg border border-[#374151] bg-[#1F2937] px-2 py-1 text-xs text-white outline-none focus:border-[#7b61ff]"
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label} ({l.code})
            </option>
          ))}
        </select>
      </div>

      <div className="relative flex items-center gap-2 rounded-xl bg-[#1F2937] px-3 py-2 shadow-sm ring-1 ring-[#374151]">
        <input
          ref={inputRef}
          type="text"
          placeholder={disabled ? "Unavailable…" : "Write a message"}
          value={message}
          disabled={disabled}
          onChange={(event) => {
            setMessage(event.target.value);
            onTyping?.(true);
            scheduleTypingEnd();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[#9ca3af] disabled:opacity-50"
        />
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsPickerOpen((prev) => !prev)}
            className={`rounded-full p-2 transition ${
              isPickerOpen ? "bg-[#423080] text-white" : "text-[#9ca3af] hover:bg-[#2c3648] hover:text-white"
            } disabled:opacity-40`}
            aria-label="Open emoji picker"
            aria-expanded={isPickerOpen}
          >
            <Smile className="h-5 w-5" />
          </button>
          {isPickerOpen && (
            <div className="absolute bottom-12 right-0 z-20 w-56 rounded-2xl border border-[#374151] bg-[#111926] p-3 shadow-xl">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Pick an emoji</p>
              <div className="grid grid-cols-6 gap-1.5">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="rounded-lg p-1.5 text-lg transition hover:bg-[#243041]"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={disabled || !message.trim()}
          onClick={submit}
          className="rounded-full bg-[#7b61ff] p-2.5 text-white transition hover:bg-[#6b52e0] disabled:opacity-40 disabled:hover:bg-[#7b61ff]"
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
}
