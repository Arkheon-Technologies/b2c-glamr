"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

type Thread = {
  id: string; clientName: string; lastMessage: string; time: string;
  unread: boolean; booking?: string;
};

const DEMO_THREADS: Thread[] = [
  { id: "m1", clientName: "Elena M.", lastMessage: "Hi! Can I change my balayage appointment to a bit later? Maybe 15:00 instead of 14:00?", time: "2 min ago", unread: true, booking: "Balayage — Today 14:00" },
  { id: "m2", clientName: "Diana V.", lastMessage: "Perfect, thank you! I'll bring reference photos.", time: "1h ago", unread: true, booking: "Keratin — Tomorrow 10:00" },
  { id: "m3", clientName: "Sofia R.", lastMessage: "Thanks for the great cut yesterday! 💇‍♀️", time: "Yesterday", unread: false },
  { id: "m4", clientName: "Ioana P.", lastMessage: "Do you have any availability this Saturday morning?", time: "Yesterday", unread: false },
  { id: "m5", clientName: "Ana D.", lastMessage: "I'd like to book a root touch-up. What times work?", time: "2 days ago", unread: false },
  { id: "m6", clientName: "Maria L.", lastMessage: "Great, see you then!", time: "3 days ago", unread: false },
];

type Message = { id: string; from: "client" | "studio"; text: string; time: string };

const DEMO_MESSAGES: Message[] = [
  { id: "msg1", from: "client", text: "Hi! Can I change my balayage appointment to a bit later? Maybe 15:00 instead of 14:00?", time: "10:42" },
  { id: "msg2", from: "studio", text: "Hi Elena! Let me check availability for 15:00 today.", time: "10:44" },
  { id: "msg3", from: "studio", text: "Great news — 15:00 works! I've moved your appointment. You'll get an updated confirmation email shortly.", time: "10:45" },
  { id: "msg4", from: "client", text: "Amazing, thank you so much! 🙏", time: "10:46" },
  { id: "msg5", from: "client", text: "Also, I was thinking about going a bit warmer this time — more honey than the usual cool tone. Is that possible with balayage?", time: "10:47" },
];

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState("m1");
  const [reply, setReply] = useState("");

  const activeThread = DEMO_THREADS.find((t) => t.id === selectedThread);

  return (
    <div className="flex h-[calc(100vh-56px-56px)] -m-7">
      {/* Thread list */}
      <div className="w-[320px] border-r border-[var(--line)] flex flex-col bg-[var(--paper)]">
        <div className="p-4 border-b border-[var(--line-2)]">
          <div className="relative">
            <GlamrIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)]" />
            <input className="input pl-9 text-[13px]" placeholder="Search messages…" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {DEMO_THREADS.map((thread) => (
            <button key={thread.id}
              onClick={() => setSelectedThread(thread.id)}
              className={`w-full text-left px-4 py-3 border-b border-[var(--line-2)] transition-colors ${selectedThread === thread.id ? "bg-[var(--plum-soft)]" : "hover:bg-[var(--paper-2)]"}`}>
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--paper-3)] flex items-center justify-center">
                    <span className="text-[12px] font-medium text-[var(--ink-3)]">{thread.clientName.charAt(0)}</span>
                  </div>
                  {thread.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--plum)] border-2 border-[var(--paper)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[13px] ${thread.unread ? "font-medium text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>
                      {thread.clientName}
                    </span>
                    <span className="text-[10px] text-[var(--ink-4)]">{thread.time}</span>
                  </div>
                  <p className={`text-[12px] truncate ${thread.unread ? "text-[var(--ink-2)]" : "text-[var(--ink-4)]"}`}>
                    {thread.lastMessage}
                  </p>
                  {thread.booking && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[var(--plum)] bg-[var(--plum-soft)] px-1.5 py-0.5 rounded">
                      <GlamrIcon name="calendar" size={9} />
                      {thread.booking}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-[var(--paper-2)]">
        {/* Chat header */}
        {activeThread && (
          <div className="h-14 px-5 border-b border-[var(--line)] bg-[var(--card)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--paper-3)] flex items-center justify-center">
                <span className="text-[11px] font-medium text-[var(--ink-3)]">{activeThread.clientName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[var(--ink)]">{activeThread.clientName}</p>
                {activeThread.booking && (
                  <p className="text-[10px] text-[var(--ink-4)]">{activeThread.booking}</p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)]">
                <GlamrIcon name="calendar" size={15} className="text-[var(--ink-3)]" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)]">
                <GlamrIcon name="user" size={15} className="text-[var(--ink-3)]" />
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {DEMO_MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "studio" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${msg.from === "studio" ? "bg-[var(--plum)] text-white rounded-br-md" : "bg-[var(--card)] text-[var(--ink)] rounded-bl-md border border-[var(--line-2)]"}`}>
                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] mt-1 tabular-num ${msg.from === "studio" ? "text-white/60" : "text-[var(--ink-4)]"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick replies */}
        <div className="px-5 pb-2 flex gap-1.5">
          {["Thanks!", "I'll check for you", "See you then!", "Can you send a photo?"].map((qr) => (
            <button key={qr} onClick={() => setReply(qr)}
              className="chip text-[11px] hover:bg-[var(--plum-soft)] transition-colors">{qr}</button>
          ))}
        </div>

        {/* Composer */}
        <div className="px-5 pb-5">
          <div className="flex items-end gap-2 bg-[var(--card)] border border-[var(--line-2)] rounded-xl p-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] shrink-0">
              <GlamrIcon name="camera" size={16} className="text-[var(--ink-4)]" />
            </button>
            <textarea
              value={reply} onChange={(e) => setReply(e.target.value)}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-4)] py-1.5 outline-none"
            />
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--plum)] text-white shrink-0">
              <GlamrIcon name="arrow" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
