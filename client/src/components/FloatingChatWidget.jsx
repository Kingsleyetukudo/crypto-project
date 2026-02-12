import React from "react";
import { MessageCircle, Send, X } from "lucide-react";

export default function FloatingChatWidget() {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatInput, setChatInput] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState([
    { id: 1, sender: "bot", text: "Hi, how can I help you today?" },
  ]);

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;

    const userMessage = { id: Date.now(), sender: "user", text };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Thanks for your message. Our support team will respond shortly.",
      };
      setChatMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  return (
    <>
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#101214] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Support Chat</p>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  message.sender === "user"
                    ? "ml-auto bg-emerald-500 text-slate-950"
                    : "bg-white/10 text-slate-200"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 px-3 py-3">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder="Type a message..."
              className="w-full rounded-xl border border-white/10 bg-[#0b0c0d] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSendChat}
              className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-400 text-slate-950 shadow-lg hover:bg-emerald-300"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
