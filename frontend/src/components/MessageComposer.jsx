import { Paperclip, SendHorizontal, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const EMOJIS = ["😀", "😂", "😍", "😎", "🤝", "🙏", "🔥", "✨", "🎉", "💬", "👍", "❤️"];

function MessageComposer() {
  const [message, setMessage] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <footer className="border-t border-[#1F2937] p-3 md:p-4">
      <div className="relative flex items-center gap-2 rounded-xl bg-[#1F2937] px-3 py-2 shadow-sm ring-1 ring-[#374151]">
        <button type="button" className="rounded-full p-2 text-[#9ca3af] transition hover:bg-[#2c3648] hover:text-white" aria-label="Attach file">
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Write a Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[#9ca3af]"
        />
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setIsPickerOpen((prev) => !prev)}
            className={`rounded-full p-2 transition ${
              isPickerOpen ? "bg-[#423080] text-white" : "text-[#9ca3af] hover:bg-[#2c3648] hover:text-white"
            }`}
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
          className="rounded-full bg-[#7b61ff] p-2.5 text-white transition hover:bg-[#6b52e0]"
          aria-label="Send message"
        >
          <SendHorizontal className="h-4.5 w-4.5" />
        </button>
      </div>
    </footer>
  );
}

export default MessageComposer;
