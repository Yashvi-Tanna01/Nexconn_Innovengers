import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { OperationLoadingIndicator } from '../loading';
import { Send, ShieldCheck, User, Wrench, Radio, MessageSquare, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  role: 'coordinator' | 'crew' | 'citizen';
  text: string;
  timestamp: string;
}

interface NexconnChatPanelProps {
  incidentId: string;
  incidentTitle: string;
  className?: string;
  onClose?: () => void;
}

export const NexconnChatPanel: React.FC<NexconnChatPanelProps> = ({
  incidentId,
  incidentTitle,
  className = '',
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'Coordinator Maya V.',
      role: 'coordinator',
      text: 'Incident INC-2026-088 verified. Candidate cluster #409 confirmed as potable main fracture. Dispatching Crew Alpha.',
      timestamp: '14:28',
    },
    {
      id: 'm-2',
      sender: 'Crew Alpha Lead (Ramesh)',
      role: 'crew',
      text: 'On-site at 4th Main Road. Acoustic sensor confirms sub-base pressure drop. Isolating Sector 3 gate valve 4.',
      timestamp: '14:33',
    },
    {
      id: 'm-3',
      sender: 'Citizen Reporter (Ananya)',
      role: 'citizen',
      text: 'Water ponding near crossroad 7 has noticeably subsided since valve isolation.',
      timestamp: '14:36',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 850);
    return () => clearTimeout(timer);
  }, [incidentId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      const newMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: 'You (Municipal Responder)',
        role: 'crew',
        text: inputText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setIsSending(false);
    }, 400);
  };

  const handleQuickAction = (quickText: string) => {
    setInputText(quickText);
  };

  return (
    <div
      className={`flex flex-col h-[520px] max-h-[85vh] bg-white/95 backdrop-blur-xl border border-antah-border rounded-2xl shadow-soft-xl overflow-hidden select-none ${className}`}
    >
      {/* Top Nexconn Gateway Status Header */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-antah-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-antah-navy uppercase">
                NEXCONN CHAT SDK • CHANNEL
              </span>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                ENCRYPTED
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
      {isConnecting ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white min-h-[220px]">
          <OperationLoadingIndicator
            size="lg"
            label="CONNECTING TO NEXCONN INCIDENT CHANNEL..."
            className="text-cyan-400"
          />
          <p className="text-xs text-slate-400 font-mono mt-3 italic">
            Connecting to authorized incident responders & field crews...
          </p>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          <div className="text-center my-2">
            <span className="text-[10px] font-mono text-antah-muted bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Channel Initialized via Backend Token Exchange • Zero Client Secret Exposure
            </span>
          </div>

          {messages.map((m) => {
            const isCoordinator = m.role === 'coordinator';
            const isCrew = m.role === 'crew';

            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 transition-all ${
                  isCoordinator
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950 ml-2'
                    : isCrew
                    ? 'bg-teal-50/60 border-teal-200 text-teal-950 mr-2'
                    : 'bg-slate-50 border-antah-border text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5">
                    {isCoordinator && <ShieldCheck size={12} className="text-amber-600" />}
                    {isCrew && <Wrench size={12} className="text-teal-600" />}
                    {!isCoordinator && !isCrew && <User size={12} className="text-slate-500" />}
                    <span>{m.sender}</span>
                  </span>
                  <span className="text-[10px] font-mono text-antah-muted">{m.timestamp}</span>
                </div>
                <p className="pt-0.5">{m.text}</p>
              </div>
            );
          })}
        </div>
      )}

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
          placeholder="Transmit message to incident crew & coordinator..."
          className="flex-1 bg-slate-50 text-antah-navy placeholder:text-antah-subtle text-xs rounded-xl border border-antah-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-antah-teal/30 focus:border-antah-teal"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSending}
          icon={<Send size={14} />}
          disabled={!inputText.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

