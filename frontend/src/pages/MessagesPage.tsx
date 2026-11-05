import React, { useEffect, useState } from 'react';
import { NexconnChatPanel } from '../components/chat/NexconnChatPanel';
import { MessageSquare, Radio, ShieldAlert, Users, Layers, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS, apiRequest, Notification } from '../config/api';

export const MessagesPage: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState({
    id: 'INC-2026-088',
    title: 'Fisura Hidráulica y Rebalse de Colector',
    clusterId: 'CLUSTER-409',
    district: 'Sector 3 Hydrologic Quad',
    activeUsers: 4,
    status: 'ACTIVE_REMEDIATION',
    badge: 'Riesgo Crítico',
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<Notification[]>(API_ENDPOINTS.notifications).then((result) => {
      if (!active) return;
      if (result.data) setNotifications(result.data);
      else setNotificationError(result.error || 'Unable to load notifications.');
      setNotificationsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const incidentChannels = [
    {
      id: 'INC-2026-088',
      title: 'Fisura Hidráulica y Rebalse de Colector',
      clusterId: 'CLUSTER-409',
      district: 'Sector 3 Hydrologic Quad',
      activeUsers: 4,
      status: 'ACTIVE_REMEDIATION',
      badge: 'Riesgo Crítico',
    },
    {
      id: 'INC-2026-089',
      title: 'Depresión de Asfalto en Bus Rapid Transit',
      clusterId: 'SIG-811',
      district: 'Indiranagar Commercial Corridor',
      activeUsers: 2,
      status: 'DISPATCHED',
      badge: 'Riesgo Alto',
    },
    {
      id: 'INC-2026-090',
      title: 'Corte de Pasarela Feeder Metro',
      clusterId: 'SIG-819',
      district: 'Central Metro Transit Core',
      activeUsers: 3,
      status: 'INVESTIGATING',
      badge: 'Riesgo Medio',
    },
  ];

  return (
    <div className="w-full px-4 pt-3 pb-8 space-y-4 select-none">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E4]">
        <div>
          <h1 className="text-xl font-bold text-[#202827] font-sans tracking-tight">
            Incident Channels
          </h1>
          <p className="text-[11px] text-[#737C78]">
            Nexconn Chat SDK • Multi-actor incident rooms
          </p>
        </div>
        {notificationsLoading && (
          <div className="text-[11px] text-[#737C78]">Loading coordination notifications…</div>
        )}
        {notificationError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-[11px] text-red-900">
            {notificationError}
          </div>
        )}
        {!!notifications.length && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
            {notifications[0].message}
          </div>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E1F0E8] border border-[#286B56]/20 text-[#286B56] text-[10px] font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#286B56] animate-pulse" />
          <span>SDK ONLINE</span>
        </div>
      </div>

      {/* 2. HORIZONTALLY SCROLLABLE CHANNELS CAROUSEL */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {incidentChannels.map((channel) => {
          const isSelected = channel.id === selectedIncident.id;
          return (
            <button
              key={channel.id}
              onClick={() => setSelectedIncident(channel)}
              className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center gap-2 active:scale-95 ${
                isSelected
                  ? 'bg-[#286B56] text-white border-[#286B56] shadow-xs'
                  : 'bg-white border-[#E3E8E4] text-[#202827] hover:bg-stone-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#E7A65B]'}`} />
              <div>
                <div className="text-[11px] font-bold leading-tight line-clamp-1 max-w-[160px]">
                  {channel.title}
                </div>
                <div className={`text-[9px] font-mono ${isSelected ? 'text-white/80' : 'text-[#737C78]'}`}>
                  {channel.id} • {channel.activeUsers} users
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE CHAT ROOM CONTAINER */}
      <div className="bg-white rounded-3xl border border-[#E3E8E4] p-3.5 shadow-xs space-y-3">
        {/* Active Room Meta Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
          <div>
            <div className="text-[9px] font-mono font-bold text-[#286B56] uppercase tracking-wider">
              {selectedIncident.id} • {selectedIncident.status}
            </div>
            <h2 className="text-xs font-bold text-[#202827] line-clamp-1">
              {selectedIncident.title}
            </h2>
          </div>
          <span className="text-[10px] text-[#737C78] font-mono shrink-0">
            {selectedIncident.district.split(' ')[0]}
          </span>
        </div>

        {/* Embedded Chat View */}
        <div className="h-[460px] rounded-2xl overflow-hidden border border-stone-100">
          <NexconnChatPanel
            incidentId={selectedIncident.id}
            incidentTitle={selectedIncident.title}
            className="h-full border-none shadow-none rounded-none"
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
