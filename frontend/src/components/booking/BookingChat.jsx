import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getBookingMessages, sendBookingMessage, markMessagesRead } from '../../api';
import { HiPaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

/* ── Tick indicator (WhatsApp-style) ────────────────────────────
   Only rendered on messages the current user sent.
   ✓   grey  = sent, not yet seen by the other party (isRead: false)
   ✓✓  blue  = seen by the other party (isRead: true)
──────────────────────────────────────────────────────────────── */
const TickIndicator = ({ isRead }) => (
  <span
    className={`text-[10px] font-bold tracking-tighter select-none ${
      isRead ? 'text-blue-400' : 'text-white/50'
    }`}
    title={isRead ? 'Seen' : 'Sent'}
  >
    {isRead ? '✓✓' : '✓'}
  </span>
);

/* ══════════════════════════════════════════════════════════════ */
const BookingChat = ({ bookingId, currentUserId, readOnly = false }) => {
  const [messages, setMessages]   = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);

  // Ref to the scrollable messages container — only this scrolls, not the page
  const messagesContainerRef = useRef(null);

  /** Scroll only the chat container to the bottom — page stays stationary */
  const scrollChatToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, []);

  /** Fetch messages and optionally mark received ones as read */
  const fetchMessages = useCallback(async (markRead = false) => {
    try {
      const res = await getBookingMessages(bookingId);
      const fetched = res.data.messages || [];
      setMessages(fetched);

      // Mark incoming messages as read (fire-and-forget, no throw needed)
      if (markRead && !readOnly) {
        const hasUnread = fetched.some(
          (m) => !m.isRead && (m.sender?._id || m.sender) !== currentUserId
        );
        if (hasUnread) {
          markMessagesRead(bookingId).then(() => {
            // Optimistically flip isRead in local state
            setMessages((prev) =>
              prev.map((m) =>
                (m.sender?._id || m.sender) !== currentUserId
                  ? { ...m, isRead: true }
                  : m
              )
            );
          }).catch(() => {}); // silent — non-critical
        }
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, [bookingId, currentUserId, readOnly]);

  // Initial load: fetch + mark as read immediately
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchMessages(true);
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchMessages]);

  // Poll every 5 s — also marks any newly arrived messages as read
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll chat container (NOT the page) whenever messages change
  useEffect(() => {
    scrollChatToBottom();
  }, [messages, scrollChatToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || readOnly) return;

    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await sendBookingMessage(bookingId, msgText);
      setMessages(res.data.messages || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
      setNewMessage(msgText); // Restore on failure
    } finally {
      setSending(false);
    }
  };

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-stone-50 dark:bg-stone-900/20 rounded-2xl border border-light-border dark:border-dark-border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500" />
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-medium">Loading conversation…</p>
      </div>
    );
  }

  /* ── Chat UI ─────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-[450px] bg-stone-50 dark:bg-[#1a0e1a] rounded-2xl border border-light-border dark:border-dark-border overflow-hidden">

      {/* ── Messages list (only this scrolls) ─────────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ overscrollBehavior: 'contain' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-500 text-center p-4">
            <span className="text-4xl">💬</span>
            <p className="text-sm font-semibold mt-2">No messages yet</p>
            <p className="text-xs mt-0.5 text-stone-400">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === currentUserId;

            return (
              <div
                key={msg._id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender label (only for received messages) */}
                {!isMe && (
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1 ml-1">
                    {msg.sender?.name || 'Sender'}
                    <span className="normal-case font-normal text-stone-350 dark:text-stone-600">
                      {' '}({msg.senderRole})
                    </span>
                  </span>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? // Sent: saffron gradient, white text
                        'bg-gradient-to-r from-saffron-500 to-gold-600 text-white rounded-br-none'
                      : // Received: clear bg, high-contrast text on both modes
                        'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-600 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{msg.message}</p>
                </div>

                {/* Timestamp + tick row */}
                <div className={`flex items-center gap-1.5 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500">
                    {msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : ''}
                  </span>
                  {/* Tick only on my messages */}
                  {isMe && <TickIndicator isRead={!!msg.isRead} />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Input area ────────────────────────────────────── */}
      {!readOnly ? (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 p-3 border-t border-light-border dark:border-stone-800 bg-white dark:bg-[#120c12]"
        >
          <input
            type="text"
            placeholder="Type your message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-600 hover:from-saffron-600 hover:to-gold-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <HiPaperAirplane className="rotate-90 text-base" />
          </button>
        </form>
      ) : (
        <div className="p-3 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-900/60 border-t border-light-border dark:border-stone-800">
          🔒 This conversation is read-only
        </div>
      )}
    </div>
  );
};

export default BookingChat;
