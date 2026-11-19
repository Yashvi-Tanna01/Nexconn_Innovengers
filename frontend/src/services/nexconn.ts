import {
  AreaCode,
  BaseChannel,
  CommunityChannel,
  CommunityChannelIdentifier,
  CommunitySubChannel,
  CommunitySubChannelIdentifier,
  ConnectionStatus,
  ConnectionStatusHandler,
  GroupChannel,
  GroupChannelIdentifier,
  Message,
  MessageHandler,
  NCEngine,
  SendTextMessageParams,
} from '@nexconn/chat';
import { API_ENDPOINTS, apiRequest, NexconnToken } from '../config/api';

export type MessageListener = (message: Message<any>) => void;
export type NexconnConnectionStatus =
  | 'disconnected'
  | 'initializing'
  | 'connecting'
  | 'authenticated'
  | 'joining'
  | 'connected'
  | 'reconnecting'
  | 'failed'
  | 'error';

let initialized = false;
let connectedUserId: string | null = null;
let currentStatus: NexconnConnectionStatus = 'disconnected';
const listeners = new Set<MessageListener>();
const statusListeners = new Set<(status: NexconnConnectionStatus) => void>();

export function getConnectionStatus(): NexconnConnectionStatus {
  return currentStatus;
}

export function subscribeConnectionStatus(listener: (status: NexconnConnectionStatus) => void): () => void {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => statusListeners.delete(listener);
}

function updateConnectionStatus(status: NexconnConnectionStatus): void {
  currentStatus = status;
  statusListeners.forEach((l) => {
    try {
      l(status);
    } catch (err) {
      console.warn('[Nexconn] Status listener error:', err);
    }
  });
}

const messageHandler = new MessageHandler({
  onMessageReceived: ({ messages }) => {
    messages.forEach((message) => {
      listeners.forEach((listener) => {
        try {
          listener(message);
        } catch (err) {
          console.error('[Nexconn] Message listener error:', err);
        }
      });
    });
  },
});

const connectionStatusHandler = new ConnectionStatusHandler({
  onConnectionStatusChanged: (event) => {
    if (event.status === ConnectionStatus.CONNECTED) {
      updateConnectionStatus('connected');
    } else if (event.status === ConnectionStatus.CONNECTING) {
      updateConnectionStatus('connecting');
    } else if (event.status === ConnectionStatus.DISCONNECTED) {
      updateConnectionStatus('disconnected');
    } else if ((event.status as number) === 2 || (event.status as number) === 12) {
      // Reconnecting or Suspended states
      updateConnectionStatus('reconnecting');
    } else {
      updateConnectionStatus('failed');
    }
  },
});

function getAreaCode(value: number): AreaCode {
  if (value === AreaCode.BJ || value === AreaCode.NA || value === AreaCode.SA || value === AreaCode.OM) {
    return value;
  }
  return AreaCode.SG;
}

function initialize(token: NexconnToken): void {
  if (initialized) return;
  const appKey = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_NEXCONN_APP_KEY;
  if (!appKey) throw new Error('VITE_NEXCONN_APP_KEY is not configured for the frontend.');
  NCEngine.initialize({ appKey, areaCode: getAreaCode(token.area_code) });
  NCEngine.addMessageHandler('antah-chat', messageHandler);
  NCEngine.addConnectionStatusHandler('antah-status', connectionStatusHandler);
  initialized = true;
}

export async function connectToRoom(roomId: number): Promise<NexconnToken> {
  updateConnectionStatus('connecting');
  const tokenResult = await apiRequest<NexconnToken>(API_ENDPOINTS.chatAuth, {
    method: 'POST',
    body: JSON.stringify({ room_id: roomId }),
  });
  if (!tokenResult.data) {
    updateConnectionStatus('error');
    throw new Error(tokenResult.error || 'Unable to obtain the Nexconn access token.');
  }

  const token = tokenResult.data;
  updateConnectionStatus('authenticated');

  updateConnectionStatus('initializing');
  initialize(token);

  if (connectedUserId && connectedUserId !== token.nexconn_user_id) {
    await NCEngine.disconnect();
    connectedUserId = null;
  }

  if (!connectedUserId) {
    updateConnectionStatus('joining');
    const result = await NCEngine.connect({ token: token.access_token });
    if (!result.isOk || !result.data) {
      updateConnectionStatus('failed');
      const code = typeof result?.code === 'number' ? ` (code ${result.code})` : '';
      const rawMsg = (result as any)?.msg || (typeof (result as any)?.errmsg === 'function' ? (result as any).errmsg() : '');
      const msg = typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg);
      throw new Error(`Nexconn connection failed${code}${msg ? `: ${msg}` : ''}.`);
    }
    connectedUserId = result.data.userId;
    updateConnectionStatus('connected');
  } else {
    updateConnectionStatus('connected');
  }

  return token;
}

export function createChannel(token: NexconnToken): BaseChannel {
  if (token.channel_type === 'community') {
    const communityId = token.channel_id;
    const subChannelId = token.sub_channel_id || 'general';
    return new CommunitySubChannel(communityId, subChannelId);
  }
  return new GroupChannel(token.channel_id);
}

export function createChannelIdentifier(token: NexconnToken) {
  if (token.channel_type === 'community') {
    const communityId = token.channel_id;
    const subChannelId = token.sub_channel_id || 'general';
    return new CommunitySubChannelIdentifier(communityId, subChannelId);
  }
  return new GroupChannelIdentifier(token.channel_id);
}

export async function loadHistory(token: NexconnToken): Promise<Message<any>[]> {
  try {
    const channel = createChannel(token);
    const query = BaseChannel.createMessagesQuery({
      channelIdentifier: channel.identifier,
      pageSize: 50,
    });
    const result = await query.loadNextPage();
    if (!result.isOk || !result.data) {
      return [];
    }
    const msgs = result.data.data || [];
    return [...msgs].sort((a: any, b: any) => (a.sentTime || 0) - (b.sentTime || 0));
  } catch (err) {
    console.warn('[Nexconn] loadHistory error:', err);
    return [];
  }
}

export async function sendText(
  token: NexconnToken,
  text: string,
  senderName?: string,
  senderRole?: string
): Promise<Message<any>> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Cannot send an empty message.');

  const displayName = senderName || token.user_name || token.nexconn_user_id;
  const role = senderRole || token.user_role || 'reporter';

  const channel = createChannel(token);
  const params = new SendTextMessageParams({
    text: trimmed,
    senderUserInfo: {
      userId: token.nexconn_user_id,
      name: displayName,
      extra: JSON.stringify({ role, name: displayName }),
    },
  });

  const result = await channel.sendMessage(params);
  if (!result.isOk || !result.data) {
    const code = typeof result?.code === 'number' ? ` (code ${result.code})` : '';
    const rawMsg = (result as any)?.msg || (typeof (result as any)?.errmsg === 'function' ? (result as any).errmsg() : '');
    const msg = typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg);
    throw new Error(`Unable to send the Nexconn message${code}${msg ? `: ${msg}` : ''}.`);
  }
  return result.data;
}

export function subscribe(listener: MessageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function disconnectNexconn(): Promise<void> {
  if (!connectedUserId) return;
  try {
    await NCEngine.disconnect();
  } catch (err) {
    console.warn('[Nexconn] Disconnect error:', err);
  }
  connectedUserId = null;
  updateConnectionStatus('disconnected');
}

if (typeof window !== 'undefined') {
  window.addEventListener('antah-logout', () => {
    void disconnectNexconn();
  });
}
