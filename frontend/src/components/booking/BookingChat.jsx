import React, { useState, useEffect, useRef } from 'react';
import { getBookingMessages, sendBookingMessage } from '../../api';
import { HiPaperAirplane, HiClock } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BookingChat = ({ bookingId, currentUserId, readOnly = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getBookingMessages(bookingId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for new messages every 5 seconds
  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || readOnly) return;

    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await sendBookingMessage(bookingId, msgText);
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
      setNewMessage(msgText); // Restore input in case of failure
    } finally {
      setSending(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-stone-50 dark:bg-stone-900/10 rounded-2xl border border-light-border dark:border-dark-border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500"></div>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-medium">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[450px] bg-stone-50 dark:bg-stone-950/40 rounded-2xl border border-light-border dark:border-dark-border overflow-hidden">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-500 text-center p-4">
            <span className="text-3xl">💬</span>
            <p className="text-sm font-semibold mt-2">No messages yet</p>
            <p className="text-xs mt-0.5">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender?._id === currentUserId || msg.sender === currentUserId;
            return (
              <div
                key={msg._id || idx}
                className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                {/* Sender name (if not me) */}
                {!isMe && (
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1">
                    {msg.sender?.name || 'Sender'} ({msg.senderRole})
                  </span>
                )}
                {/* Message Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-saffron-500 to-gold-600 text-white rounded-br-none shadow-glow-saffron'
                      : 'bg-white dark:bg-dark-card text-stone-850 dark:text-stone-150 border border-light-border dark:border-dark-border rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{msg.message}</p>
                </div>
                {/* Timestamp */}
                <span className="text-[9px] text-stone-400 mt-1 flex items-center gap-1">
                  <HiClock className="text-stone-300" />
                  {msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : 'N/A'}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {!readOnly ? (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 p-3 border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-card"
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-600 hover:from-saffron-600 hover:to-gold-700 text-white shadow-glow-saffron hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <HiPaperAirplane className="rotate-90 text-base" />
          </button>
        </form>
      ) : (
        <div className="p-3 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-900/60 border-t border-light-border dark:border-dark-border">
          🔒 This conversation is read-only.
        </div>
      )}
    </div>
  );
};

export default BookingChat;
