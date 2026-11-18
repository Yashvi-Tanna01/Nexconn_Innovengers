import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '../common/Button';
import { Send, ShieldCheck, User, Wrench, Radio, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { messageSlideVariants } from '../../theme/motion';
import {
  connectToRoom,
  loadHistory,
  sendText,
  subscribe,
  subscribeConnectionStatus,
  NexconnConnectionStatus,
} from '../../services/nexconn';
import { apiRequest, ChatMessage, NexconnToken } from '../../config/api';

interface UiMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  text: string;
  created_at: string;
  isSelf?: boolean;
}

interface NexconnChatPanelProps {
  roomId?: number;
  incidentId?: string;
  incidentTitle: string;
  className?: string;
  onClose?: () => void;
}

function parseMessage(
  raw: any,
  currentUserId?: string,
  defaultName?: string,
  defaultRole?: string
): UiMessage {
  if (raw.messageId) {
    const userInfo = raw.content?.senderUserInfo;
    let name = userInfo?.name || '';
    let role = 'reporter';
    if (userInfo?.extra) {
      try {
        const extra = JSON.parse(userInfo.extra);
        if (extra.name && !name) name = extra.name;
        if (extra.role) role = extra.role;
      } catch {}
    }
    const senderId = raw.senderUserId || '';
    if (!name && currentUserId && (senderId === currentUserId || senderId === `antah${currentUserId}`)) {
      name = defaultName || '';
      role = defaultRole || role;
    }
    if (!name) {
      name = senderId || 'Participant';
    }

    const isSelf = currentUserId
      ? senderId === currentUserId || senderId === `antah${currentUserId}`
      : false;

    return {
      id: raw.messageId,
      sender_id: senderId,
      sender_name: name,
      sender_role: role,
      text: raw.content?.text || '',
      created_at: new Date(raw.sentTime || Date.now()).toISOString(),
      isSelf,
    };
  }

  // From database ChatMessage
  const senderId = `antah${raw.sender_id}`;
  const isSelf = currentUserId
    ? senderId === currentUserId || String(raw.sender_id) === currentUserId.replace('antah', '')
    : false;

  return {
    id: raw.message_uid || `db-${raw.id}`,
    sender_id: senderId,
    sender_name: raw.sender_name || senderId,
    sender_role: raw.sender_role || 'reporter',
    text: raw.text || '',
    created_at: raw.created_at ? new Date(raw.created_at).toISOString() : new Date().toISOString(),
    isSelf,
  };
}

function mergeMessages(existing: UiMessage[], incoming: UiMessage[]): UiMessage[] {
  const map = new Map<string, UiMessage>();
  for (const m of existing) {
    map.set(m.id, m);
  }

  for (const inc of incoming) {
    if (map.has(inc.id)) {
      const prev = map.get(inc.id)!;
      if (prev.sender_name.startsWith('antah') && !inc.sender_name.startsWith('antah')) {
        map.set(inc.id, { ...prev, sender_name: inc.sender_name, sender_role: inc.sender_role });
      }
      continue;
    }

    // Match optimistic / database message by exact text, sender, and close timestamp (+/- 5s)
    const incTime = new Date(inc.created_at).getTime();
    let matchedKey: string | null = null;
    for (const [key, prev] of map.entries()) {
      if (
        prev.text === inc.text &&
        (prev.sender_id === inc.sender_id || prev.sender_name === inc.sender_name)
      ) {
        const prevTime = new Date(prev.created_at).getTime();
        if (Math.abs(incTime - prevTime) < 5000) {
          matchedKey = key;
          break;
        }
      }
    }

    if (matchedKey) {
      const prev = map.get(matchedKey)!;
      map.delete(matchedKey);
      const chosenId = inc.id.startsWith('db-') ? prev.id : inc.id;
      map.set(chosenId, {
        ...prev,
        id: chosenId,
        sender_name: (!inc.sender_name.startsWith('antah') && inc.sender_name) ? inc.sender_name : prev.sender_name,
        sender_role: inc.sender_role || prev.sender_role,
        created_at: prev.created_at || inc.created_at,
        isSelf: prev.isSelf ?? inc.isSelf,
      });
    } else {
      map.set(inc.id, inc);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
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
  const [nexconnToken, setNexconnToken] = useState<NexconnToken | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<NexconnConnectionStatus>('disconnected');

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 1. Connection status listener
  useEffect(() => {
    return subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
    });
  }, []);

  // 2. Connect to room, load history and database messages
  useEffect(() => {
    let active = true;
    setLoadError(null);
    setSendFailed(false);
    setMessages([]);

    if (!roomId) {
      setLoadError('No authorized chatroom was selected.');
      return () => { active = false; };
    }

    void connectToRoom(roomId)
      .then(async (token) => {
        if (!active) return;
        setNexconnToken(token);

        let history: any[] = [];
        try {
          history = await loadHistory(token);
        } catch (err) {
          console.warn('[Nexconn] History loading note:', err);
        }

        let dbList: ChatMessage[] = [];
        try {
          const dbRes = await apiRequest<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
          if (dbRes.data) dbList = dbRes.data;
        } catch (err) {
          console.warn('[Nexconn] DB message query note:', err);
        }

        if (!active) return;

        const parsedDb = dbList.map((m) =>
          parseMessage(m, token.nexconn_user_id, token.user_name, token.user_role)
        );
        const parsedHistory = history.map((m) =>
          parseMessage(m, token.nexconn_user_id, token.user_name, token.user_role)
        );

        setMessages(mergeMessages(parsedDb, parsedHistory));
      })
      .catch((error: Error) => {
        if (active) {
          setLoadError(error.message);
        }
      });

    return () => { active = false; };
  }, [roomId]);

  // 3. Real-time message subscription
  useEffect(() => {
    if (!nexconnToken) return;

    return subscribe((message) => {
      const targetChannel = nexconnToken.channel_id;
      const targetSub = nexconnToken.sub_channel_id || 'general';
      const msgChannel = message.channelIdentifier;

      const isMatch =
        nexconnToken.channel_type === 'community'
          ? msgChannel.channelId === targetChannel &&
            ((msgChannel as any).subChannelId ? (msgChannel as any).subChannelId === targetSub : true)
          : msgChannel.channelId === targetChannel;

      if (!isMatch || !message.content?.text) return;

      const incomingUi = parseMessage(
        message,
        nexconnToken.nexconn_user_id,
        nexconnToken.user_name,
        nexconnToken.user_role
      );

      setMessages((prev) => mergeMessages(prev, [incomingUi]));
    });
  }, [nexconnToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping, scrollToBottom]);

  // 4. Message transmission with preservation on failure
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userText = inputText.trim();
    if (!userText || isSending) return;

    if (!nexconnToken) {
      setLoadError('Channel connection in progress. Please wait...');
      return;
    }

    setIsSending(true);
    setLoadError(null);
    setSendFailed(false);

    try {
      const deliveredMsg = await sendText(
        nexconnToken,
        userText,
        nexconnToken.user_name,
        nexconnToken.user_role
      );

      const confirmedUiMsg = parseMessage(
        deliveredMsg,
        nexconnToken.nexconn_user_id,
        nexconnToken.user_name,
        nexconnToken.user_role
      );

      setMessages((prev) => mergeMessages(prev, [confirmedUiMsg]));
      setInputText('');

      if (roomId) {
        void apiRequest(`/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            text: userText,
            message_uid: deliveredMsg.messageId,
          }),
        });
      }
    } catch (error: any) {
      setLoadError(error.message || 'Unable to deliver message.');
      setSendFailed(true);
      // Keep inputText preserved so user can retry
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleQuickAction = (quickText: string) => {
    setInputText(quickText);
    textareaRef.current?.focus();
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-emerald-500';
      case 'connecting': return 'bg-amber-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'SDK ONLINE';
      case 'connecting': return 'CONNECTING';
      case 'error': return 'OFFLINE';
      default: return 'DISCONNECTED';
    }
  };

  const getFooterStatusText = () => {
    if (isPeerTyping) return 'Coordinator Maya V. is typing...';
    if (connectionStatus === 'connected') return 'Municipal mesh gateway connected (Real-time active)';
    if (connectionStatus === 'connecting') return 'Establishing incident mesh handshake...';
    return 'Mesh network offline — Attempting reconnection...';
  };

  return (
    <div
      className={`flex flex-col h-[520px] max-h-[85vh] spatial-level-3 rounded-2xl overflow-hidden select-none ${className}`}
    >
      {/* Top Nexconn Gateway Status Header */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-antah-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-antah-navy uppercase">
                AUTHENTICATED CHATROOM
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {getStatusText()}
              </span>
            </div>
            <div className="text-[11px] text-antah-slate font-medium truncate max-w-[280px]">
              {incidentTitle} {incidentId ? `(${incidentId})` : ''}
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
          {loadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{loadError}</span>
              </div>
              {sendFailed && (
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-900 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw size={11} /> Retry
                </button>
              )}
            </div>
          )}

          {messages.map((m) => {
            const isCoordinator = m.sender_role === 'coordinator' || m.sender_role === 'admin';
            const isCrew = m.sender_role === 'responder';
            const isSelf = m.isSelf;

            return (
              <motion.div
                key={m.id}
                variants={shouldReduceMotion ? undefined : messageSlideVariants}
                initial={shouldReduceMotion ? undefined : 'initial'}
                animate={shouldReduceMotion ? undefined : 'animate'}
                exit={shouldReduceMotion ? undefined : 'exit'}
                layout
                className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 transition-all ${
                  isSelf
                    ? 'bg-emerald-50/70 border-emerald-300/80 text-emerald-950 ml-6 shadow-xs'
                    : isCoordinator
                    ? 'bg-amber-50/70 border-amber-200/90 text-amber-950 ml-2 shadow-xs'
                    : isCrew
                    ? 'bg-teal-50/70 border-teal-200/90 text-teal-950 mr-2 shadow-xs'
                    : 'bg-slate-50 border-antah-border text-slate-800 mr-6'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5">
                    {isCoordinator && <ShieldCheck size={12} className="text-amber-600" />}
                    {isCrew && <Wrench size={12} className="text-teal-600" />}
                    {!isCoordinator && !isCrew && <User size={12} className="text-slate-500" />}
                    <span className="font-bold">
                      {m.sender_name} {isSelf && <span className="font-normal text-[10px] text-emerald-700">(You)</span>}
                    </span>
                    {isCoordinator && (
                      <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                        Coordinator
                      </span>
                    )}
                    {isCrew && (
                      <span className="text-[9px] font-mono uppercase bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                        Responder
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-antah-muted">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="pt-0.5 whitespace-pre-wrap">{m.text}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Dynamic mesh connection / typing status indicator */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/90 border border-[#087B56]/20 shadow-2xs max-w-fit transition-all">
          <div className="relative flex items-center gap-1.5 py-1 px-1">
            <div className="absolute inset-x-0 h-0.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#087B56]/20 via-[#3DD6A5]/40 to-[#087B56]/20" />
            <span
              className={`relative w-2 h-2 rounded-full ${
                isPeerTyping
                  ? 'bg-[#D99A45] animate-typing-wave-1'
                  : connectionStatus === 'connected'
                  ? 'bg-[#087B56] animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span
              className={`relative w-2 h-2 rounded-full ${
                isPeerTyping ? 'bg-[#3DD6A5] animate-typing-wave-2' : 'bg-[#3DD6A5]'
              }`}
            />
            <span
              className={`relative w-2 h-2 rounded-full ${
                isPeerTyping
                  ? 'bg-[#D99A45] animate-typing-wave-3'
                  : connectionStatus === 'connected'
                  ? 'bg-[#087B56]'
                  : 'bg-slate-300'
              }`}
            />
          </div>
          <span
            className={`text-[10px] font-mono font-medium tracking-tight ${
              isPeerTyping
                ? 'text-amber-800 font-bold'
                : connectionStatus === 'connected'
                ? 'text-[#087B56]'
                : 'text-amber-700'
            }`}
          >
            {getFooterStatusText()}
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

      {/* Message Composer: Multi-line support with Enter to send, Shift+Enter for newline */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-antah-border flex items-center gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Transmit message to incident crew & coordinator"
          placeholder="Transmit message to incident crew & coordinator (Enter to send, Shift+Enter for newline)..."
          className="flex-1 bg-slate-50 text-antah-navy placeholder:text-antah-subtle text-xs rounded-xl border border-antah-border px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-antah-teal/30 focus:border-antah-teal spatial-focus-ring max-h-24 overflow-y-auto"
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
export default NexconnChatPanel;
