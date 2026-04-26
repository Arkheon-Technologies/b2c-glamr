"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import {
  listMessageThreads,
  getMessageThread,
  sendMessage,
  type MessageThread,
  type ChatMessage,
} from "@/lib/mvp-api";

/* ─── Demo data ──────────────────────────────────────────────────── */
const DEMO_THREADS: MessageThread[] = [
  { id: "m1", customer_id: "c1", customer_name: "Elena M.", customer_email: null, business_id: "demo", appointment_id: null, appointment_label: "Balayage — Today 14:00", last_message: { body: "Hi! Can I change my appointment to 15:00?", sender_kind: "customer", created_at: new Date(Date.now() - 2 * 60_000).toISOString() }, unread: true, last_message_at: new Date(Date.now() - 2 * 60_000).toISOString(), created_at: new Date().toISOString() },
  { id: "m2", customer_id: "c2", customer_name: "Diana V.", customer_email: null, business_id: "demo", appointment_id: null, appointment_label: "Keratin — Tomorrow 10:00", last_message: { body: "Perfect, thank you! I'll bring reference photos.", sender_kind: "customer", created_at: new Date(Date.now() - 60 * 60_000).toISOString() }, unread: true, last_message_at: new Date(Date.now() - 60 * 60_000).toISOString(), created_at: new Date().toISOString() },
  { id: "m3", customer_id: "c3", customer_name: "Sofia R.", customer_email: null, business_id: "demo", appointment_id: null, appointment_label: null, last_message: { body: "Thanks for the great cut yesterday! 💇‍♀️", sender_kind: "customer", created_at: new Date(Date.now() - 24 * 60 * 60_000).toISOString() }, unread: false, last_message_at: new Date(Date.now() - 24 * 60 * 60_000).toISOString(), created_at: new Date().toISOString() },
  { id: "m4", customer_id: "c4", customer_name: "Ioana P.", customer_email: null, business_id: "demo", appointment_id: null, appointment_label: null, last_message: { body: "Do you have any availability this Saturday morning?", sender_kind: "customer", created_at: new Date(Date.now() - 48 * 60 * 60_000).toISOString() }, unread: false, last_message_at: new Date(Date.now() - 48 * 60 * 60_000).toISOString(), created_at: new Date().toISOString() },
];

const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  m1: [
    { id: "msg1", body: "Hi! Can I change my balayage appointment to a bit later? Maybe 15:00 instead of 14:00?", sender_kind: "customer", sender_user_id: null, read_at: null, created_at: new Date(Date.now() - 5 * 60_000).toISOString() },
    { id: "msg2", body: "Hi Elena! Let me check availability for 15:00 today.", sender_kind: "staff", sender_user_id: "u1", read_at: null, created_at: new Date(Date.now() - 4 * 60_000).toISOString() },
    { id: "msg3", body: "Great news — 15:00 works! I've moved your appointment. You'll receive an updated confirmation shortly.", sender_kind: "staff", sender_user_id: "u1", read_at: null, created_at: new Date(Date.now() - 3 * 60_000).toISOString() },
    { id: "msg4", body: "Amazing, thank you so much! 🙏", sender_kind: "customer", sender_user_id: null, read_at: null, created_at: new Date(Date.now() - 2 * 60_000).toISOString() },
  ],
  m2: [
    { id: "msg5", body: "Hi! I wanted to confirm my keratin appointment for tomorrow.", sender_kind: "customer", sender_user_id: null, read_at: null, created_at: new Date(Date.now() - 70 * 60_000).toISOString() },
    { id: "msg6", body: "Of course Diana! All set for tomorrow at 10:00. Don't forget to arrive with clean, dry hair.", sender_kind: "staff", sender_user_id: "u1", read_at: null, created_at: new Date(Date.now() - 65 * 60_000).toISOString() },
    { id: "msg7", body: "Perfect, thank you! I'll bring reference photos.", sender_kind: "customer", sender_user_id: null, read_at: null, created_at: new Date(Date.now() - 60 * 60_000).toISOString() },
  ],
};

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const QUICK_REPLIES = ["Thanks!", "I'll check for you", "See you then!", "Can you send a photo?", "Appointment confirmed ✓"];

export default function MessagesPage() {
  const { businessId } = useStudio();
  const isDemo = !businessId || businessId.startsWith("demo");

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads
  useEffect(() => {
    if (isDemo) { setThreads(DEMO_THREADS); setLoadingThreads(false); setSelectedId("m1"); return; }
    if (!businessId) return;
    setLoadingThreads(true);
    listMessageThreads(businessId)
      .then((t) => { setThreads(t); if (t.length > 0) setSelectedId(t[0].id); })
      .catch(() => { setThreads(DEMO_THREADS); setSelectedId("m1"); })
      .finally(() => setLoadingThreads(false));
  }, [businessId, isDemo]);

  // Load messages for selected thread
  useEffect(() => {
    if (!selectedId) return;
    if (isDemo) {
      setMessages(DEMO_MESSAGES[selectedId] ?? []);
      return;
    }
    setLoadingMessages(true);
    getMessageThread(selectedId)
      .then((thread) => {
        setMessages(thread.messages);
        // Mark thread as read locally
        setThreads((prev) => prev.map((t) => t.id === selectedId ? { ...t, unread: false } : t));
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedId, isDemo]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeThread = threads.find((t) => t.id === selectedId);

  const handleSend = useCallback(async () => {
    const text = reply.trim();
    if (!text || !selectedId) return;
    setSending(true);
    setReply("");

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      body: text,
      sender_kind: "staff",
      sender_user_id: null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    if (!isDemo) {
      try {
        const sent = await sendMessage(selectedId, text);
        setMessages((prev) => prev.map((m) => m.id === optimistic.id ? sent : m));
        setThreads((prev) => prev.map((t) => t.id === selectedId
          ? { ...t, last_message: { body: text, sender_kind: "staff", created_at: sent.created_at }, last_message_at: sent.created_at }
          : t,
        ));
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setReply(text);
      }
    }
    setSending(false);
  }, [reply, selectedId, isDemo]);

  const filtered = threads.filter((t) =>
    !search || t.customer_name.toLowerCase().includes(search.toLowerCase()),
  );
  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <div className="flex h-[calc(100vh-56px-56px)] -m-7">
      {/* ── Thread list ────────────────────────────────────────── */}
      <div className="w-[300px] border-r border-[var(--line)] flex flex-col bg-[var(--paper)] shrink-0">
        <div className="p-4 border-b border-[var(--line-2)]">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[15px] font-medium text-[var(--ink)]">Messages</h2>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--plum)] text-white text-[10px] flex items-center justify-center tabular-num">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="relative">
            <GlamrIcon name="search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)]" />
            <input className="input pl-8 text-[12px] w-full" placeholder="Search conversations…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="p-6 text-center text-[12px] text-[var(--ink-4)] animate-pulse">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-[var(--ink-4)]">No conversations yet</div>
          ) : filtered.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedId(thread.id)}
              className={`w-full text-left px-4 py-3 border-b border-[var(--line-2)] transition-colors ${selectedId === thread.id ? "bg-[var(--plum-soft)]" : "hover:bg-[var(--paper-2)]"}`}
            >
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--paper-3)] flex items-center justify-center">
                    <span className="text-[12px] font-medium text-[var(--ink-3)]">{thread.customer_name.charAt(0)}</span>
                  </div>
                  {thread.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--plum)] border-2 border-[var(--paper)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[13px] truncate ${thread.unread ? "font-medium text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>
                      {thread.customer_name}
                    </span>
                    <span className="text-[10px] text-[var(--ink-4)] shrink-0 ml-1">{relativeTime(thread.last_message_at)}</span>
                  </div>
                  <p className={`text-[11px] truncate ${thread.unread ? "text-[var(--ink-2)]" : "text-[var(--ink-4)]"}`}>
                    {thread.last_message?.sender_kind === "staff" ? "You: " : ""}
                    {thread.last_message?.body ?? "—"}
                  </p>
                  {thread.appointment_label && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] text-[var(--plum)] bg-[var(--plum-soft)] px-1.5 py-0.5 rounded">
                      <GlamrIcon name="calendar" size={8} />
                      {thread.appointment_label}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[var(--paper-2)] min-w-0">
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] text-[var(--ink-4)]">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 px-5 border-b border-[var(--line)] bg-[var(--card)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--paper-3)] flex items-center justify-center">
                  <span className="text-[11px] font-medium text-[var(--ink-3)]">{activeThread.customer_name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[var(--ink)]">{activeThread.customer_name}</p>
                  {activeThread.appointment_label && (
                    <p className="text-[10px] text-[var(--ink-4)]">{activeThread.appointment_label}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] transition-colors">
                  <GlamrIcon name="calendar" size={15} className="text-[var(--ink-3)]" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] transition-colors">
                  <GlamrIcon name="user" size={15} className="text-[var(--ink-3)]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingMessages ? (
                <div className="text-center text-[12px] text-[var(--ink-4)] animate-pulse pt-8">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-[12px] text-[var(--ink-4)] pt-8">No messages yet — say hello!</div>
              ) : messages.map((msg) => {
                const isStaff = msg.sender_kind === "staff";
                const isSystem = msg.sender_kind === "system";
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="text-[10px] text-[var(--ink-4)] bg-[var(--paper-3)] px-3 py-1 rounded-full">{msg.body}</span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[72%] px-4 py-2.5 rounded-2xl ${
                        isStaff
                          ? "bg-[var(--plum)] text-white rounded-br-md"
                          : "bg-[var(--card)] text-[var(--ink)] rounded-bl-md border border-[var(--line-2)]"
                      }`}
                    >
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                      <p className={`text-[9px] mt-1 tabular-num ${isStaff ? "text-white/60" : "text-[var(--ink-4)]"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-5 pb-2 flex gap-1.5 flex-wrap">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => setReply((prev) => prev ? `${prev} ${qr}` : qr)}
                  className="chip text-[10px] hover:bg-[var(--plum-soft)] hover:text-[var(--plum)] transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="px-5 pb-5">
              <div className="flex items-end gap-2 bg-[var(--card)] border border-[var(--line-2)] rounded-xl p-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] shrink-0">
                  <GlamrIcon name="camera" size={15} className="text-[var(--ink-4)]" />
                </button>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Type a message… (⌘↵ to send)"
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-4)] py-1.5 outline-none min-h-[36px] max-h-[120px]"
                />
                <button
                  onClick={handleSend}
                  disabled={!reply.trim() || sending}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--plum)] text-white shrink-0 disabled:opacity-40 transition-opacity"
                >
                  <GlamrIcon name="arrow" size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
