import React, { useEffect, useState } from 'react';
import { NexconnChatPanel } from '../components/chat/NexconnChatPanel';
import { MessageSquare, Radio, ShieldAlert, Users, Layers, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS, apiRequest, Notification, ChatRoom } from '../config/api';
import { subscribeConnectionStatus, NexconnConnectionStatus } from '../services/nexconn';

export const MessagesPage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<NexconnConnectionStatus>('disconnected');

  useEffect(() => {
    return subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
    });
  }, []);

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

  useEffect(() => {
    let active = true;
    setRoomsLoading(true);
    void apiRequest<ChatRoom[]>(API_ENDPOINTS.chatRooms).then((result) => {
      if (!active) return;
      if (result.data) {
        setRooms(result.data);
        setSelectedRoomId((current) => current ?? result.data?.[0]?.id ?? null);
      } else {
        setRoomsError(result.error || 'Unable to load authorized chatrooms.');
      }
      setRoomsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || rooms[0];

  return (
    <div className="w-full px-4 pt-3 pb-8 space-y-4 select-none">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E4]">
        <div>
          <h1 className="text-xl font-bold text-[#202827] font-sans tracking-tight">
            Incident Channels
          </h1>
          <p className="text-[11px] text-[#737C78]">
            Authenticated multi-actor chatrooms
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

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-semibold ${
          connectionStatus === 'connected'
            ? 'bg-[#E1F0E8] border-[#286B56]/20 text-[#286B56]'
            : connectionStatus === 'connecting'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            connectionStatus === 'connected'
              ? 'bg-[#286B56] animate-pulse'
              : connectionStatus === 'connecting'
              ? 'bg-amber-500 animate-ping'
              : 'bg-slate-400'
          }`} />
          <span>{connectionStatus === 'connected' ? 'SDK ONLINE' : connectionStatus === 'connecting' ? 'CONNECTING...' : 'SDK OFFLINE'}</span>
        </div>
      </div>

      {/* 2. HORIZONTALLY SCROLLABLE CHANNELS CAROUSEL */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {roomsLoading && <div className="text-xs text-[#737C78]">Loading authorized chatrooms…</div>}
        {roomsError && <div className="text-xs text-red-800">{roomsError}</div>}
        {rooms.map((channel) => {
          const isSelected = channel.id === selectedRoom?.id;
          return (
            <button
              key={channel.id}
              onClick={() => setSelectedRoomId(channel.id)}
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
                  {channel.room_type}
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
              {selectedRoom?.room_type || 'ROOM'}
            </div>
            <h2 className="text-xs font-bold text-[#202827] line-clamp-1">
              {selectedRoom?.title || 'No authorized chatroom'}
            </h2>
          </div>
          <span className="text-[10px] text-[#737C78] font-mono shrink-0">
            {selectedRoom?.room_key || ''}
          </span>
        </div>

        {/* Embedded Chat View */}
        <div className="h-[460px] rounded-2xl overflow-hidden border border-stone-100">
          {selectedRoom ? <NexconnChatPanel
            roomId={selectedRoom.id}
            incidentId={selectedRoom.incident_id ? `INC-${selectedRoom.incident_id}` : undefined}
            incidentTitle={selectedRoom.title}
            className="h-full border-none shadow-none rounded-none"
          /> : <div className="p-6 text-sm text-[#737C78]">No authorized chatrooms are available.</div>}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
