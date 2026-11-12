import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '../common/Button';
import { Send, ShieldCheck, User, Wrench, Radio, MessageSquare, AlertCircle } from 'lucide-react';
import { messageSlideVariants } from '../../theme/motion';
import { connectToRoom, loadHistory, sendText, subscribe } from '../../services/nexconn';

interface UiMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

interface NexconnChatPanelProps {
  roomId?: number;
  incidentId?: string;
  incidentTitle: string;
  className?: string;
  onClose?: () => void;
}

export const NexconnChatPanel: React.FC<NexconnChatPanelProps> = ({
  roomId,
  incidentId,
  incidentTitle,
  className = '',
  onClose,
}) => {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nexconnToken, setNexconnToken] = useState<Awaited<ReturnType<typeof connectToRoom>> | null>(null);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let active = true;
    setLoadError(null);
    if (!roomId) {
      setLoadError('No authorized chatroom was selected.');
      return () => { active = false; };
    }
    void connectToRoom(roomId).then(async (token) => {
      if (!active) return;
      setNexconnToken(token);
      const history = await loadHistory(token);
      if (!active) return;
      setMessages(history.map((message) => ({
        id: message.messageId,
        sender_id: message.senderUserId,
        sender_name: message.content.senderUserInfo?.name || message.senderUserId,
        text: message.content.text || '',
        created_at: new Date(message.sentTime).toISOString(),
      })));
    }).catch((error: Error) => {
      if (active) setLoadError(error.message);
    });
    return () => { active = false; };
  }, [roomId]);

  useEffect(() => {
    if (!nexconnToken) return;
    return subscribe((message) => {
      if (message.channelIdentifier.channelId !== nexconnToken.channel_id || !message.content.text) return;
      setMessages((previous) => previous.some((item) => item.id === message.messageId) ? previous : [
        ...previous,
        {
          id: message.messageId,
          sender_id: message.senderUserId,
          sender_name: message.content.senderUserInfo?.name || message.senderUserId,
          text: message.content.text,
          created_at: new Date(message.sentTime).toISOString(),
        },
      ]);
    });
  }, [nexconnToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setIsSending(true);
    if (!nexconnToken) return;
    void sendText(nexconnToken, userText).then((message) => {
      setMessages((previous) => previous.some((item) => item.id === message.messageId) ? previous : [
        ...previous,
        {
          id: message.messageId,
          sender_id: message.senderUserId,
          sender_name: message.content.senderUserInfo?.name || message.senderUserId,
          text: message.content.text,
          created_at: new Date(message.sentTime).toISOString(),
        },
      ]);
      setInputText('');
    }).catch((error: Error) => setLoadError(error.message))
      .finally(() => setIsSending(false));
  };

  const handleQuickAction = (quickText: string) => {
    setInputText(quickText);
  };

  return (
    <div
      className={`flex flex-col h-[520px] max-h-[85vh] spatial-level-3 rounded-2xl overflow-hidden select-none ${className}`}
    >
      {/* Top Nexconn Gateway Status Header */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-antah-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-antah-navy uppercase">
                AUTHENTICATED CHATROOM
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
              NEXCONN SDK
              </span>
            </div>
            <div className="text-[11px] text-antah-slate font-medium truncate max-w-[280px]">
              {incidentTitle} ({incidentId})
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-semibold text-antah-muted hover:text-antah-navy px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          <div className="text-center my-2">
            <span className="text-[10px] font-mono text-antah-muted bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Messages are delivered by the authenticated Nexconn channel.
            </span>
          </div>

          <AnimatePresence initial={false}>
            {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">{loadError}</div>}
            {messages.map((m) => {
              const isCoordinator = false;
              const isCrew = false;

              return (
                <motion.div
                  key={m.id}
                  variants={shouldReduceMotion ? undefined : messageSlideVariants}
                  initial={shouldReduceMotion ? undefined : "initial"}
                  animate={shouldReduceMotion ? undefined : "animate"}
                  exit={shouldReduceMotion ? undefined : "exit"}
                  layout
                  className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 transition-all ${
                    isCoordinator
                      ? 'bg-amber-50/70 border-amber-200/90 text-amber-950 ml-2 shadow-xs'
                      : isCrew
                      ? 'bg-teal-50/70 border-teal-200/90 text-teal-950 mr-2 shadow-xs'
                      : 'bg-slate-50 border-antah-border text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5">
                      {isCoordinator && <ShieldCheck size={12} className="text-amber-600" />}
                      {isCrew && <Wrench size={12} className="text-teal-600" />}
                      {!isCoordinator && !isCrew && <User size={12} className="text-slate-500" />}
                      <span>{m.sender_name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-antah-muted">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="pt-0.5">{m.text}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* COMMUNICATE: Harmonic 3-Particle Wave Typing Indicator */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/90 border border-[#087B56]/20 shadow-2xs max-w-fit transition-all">
            <div className="relative flex items-center gap-1.5 py-1 px-1">
              <div className="absolute inset-x-0 h-0.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#087B56]/20 via-[#3DD6A5]/40 to-[#087B56]/20" />
              <span className={`relative w-2 h-2 rounded-full ${isPeerTyping ? 'bg-[#D99A45] animate-typing-wave-1' : 'bg-[#087B56] animate-pulse'}`} />
              <span className={`relative w-2 h-2 rounded-full ${isPeerTyping ? 'bg-[#3DD6A5] animate-typing-wave-2' : 'bg-[#3DD6A5]'}`} />
              <span className={`relative w-2 h-2 rounded-full ${isPeerTyping ? 'bg-[#D99A45] animate-typing-wave-3' : 'bg-[#087B56]'}`} />
            </div>
            <span className={`text-[10px] font-mono font-medium tracking-tight ${isPeerTyping ? 'text-amber-800 font-bold' : 'text-[#087B56]'}`}>
              {isPeerTyping ? 'Coordinator Maya V. is typing...' : 'Municipal mesh gateway online'}
            </span>
          </div>

          <div ref={messagesEndRef} />
      </div>

      {/* Quick Situation Action Pills */}
      <div className="px-4 py-2 bg-slate-50 border-t border-antah-border-light flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          type="button"
          onClick={() => handleQuickAction('Valve 4 isolated. Flow rate zeroed.')}
          className="px-2.5 py-1 rounded-full bg-white border border-antah-border hover:border-teal-500 text-antah-slate hover:text-antah-teal whitespace-nowrap transition-colors"
        >
          Gate Valve Isolated
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('Safety barriers deployed around sinkhole.')}
          className="px-2.5 py-1 rounded-full bg-white border border-antah-border hover:border-teal-500 text-antah-slate hover:text-antah-teal whitespace-nowrap transition-colors"
        >
          Barriers Deployed
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction('Awaiting municipal excavator arrival.')}
          className="px-2.5 py-1 rounded-full bg-white border border-antah-border hover:border-teal-500 text-antah-slate hover:text-antah-teal whitespace-nowrap transition-colors"
        >
          Excavator En Route
        </button>
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-antah-border flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          aria-label="Transmit message to incident crew & coordinator"
          placeholder="Transmit message to incident crew & coordinator..."
          className="flex-1 bg-slate-50 text-antah-navy placeholder:text-antah-subtle text-xs rounded-xl border border-antah-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-antah-teal/30 focus:border-antah-teal spatial-focus-ring"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSending}
          icon={<Send size={14} />}
          disabled={!inputText.trim()}
          className="font-bold shadow-soft-xs active:scale-95 transition-transform"
        >
          Send
        </Button>
      </form>
    </div>
  );
};
