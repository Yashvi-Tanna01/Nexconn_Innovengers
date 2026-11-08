import {
  AreaCode,
  BaseChannel,
  CommunityChannel,
  CommunityChannelIdentifier,
  GroupChannel,
  GroupChannelIdentifier,
  Message,
  MessageHandler,
  NCEngine,
  SendTextMessageParams,
} from '@nexconn/chat';
import { API_ENDPOINTS, apiRequest, NexconnToken } from '../config/api';

type MessageListener = (message: Message<any>) => void;

let initialized = false;
let connectedUserId: string | null = null;
const listeners = new Set<MessageListener>();

const messageHandler = new MessageHandler({
  onMessageReceived: ({ messages }) => {
    messages.forEach((message) => listeners.forEach((listener) => listener(message)));
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
  initialized = true;
}

export async function connectToRoom(roomId: number): Promise<NexconnToken> {
  const tokenResult = await apiRequest<NexconnToken>(API_ENDPOINTS.chatAuth, {
    method: 'POST',
    body: JSON.stringify({ room_id: roomId }),
  });
  if (!tokenResult.data) throw new Error(tokenResult.error || 'Unable to obtain the Nexconn access token.');

  const token = tokenResult.data;
  initialize(token);
  if (connectedUserId && connectedUserId !== token.nexconn_user_id) {
    await NCEngine.disconnect();
    connectedUserId = null;
  }
  if (!connectedUserId) {
    const result = await NCEngine.connect({ token: token.access_token });
    if (!result.isOk || !result.data) throw new Error('Nexconn connection failed.');
    connectedUserId = result.data.userId;
  }
  return token;
}

export function createChannel(token: NexconnToken): BaseChannel {
  return token.channel_type === 'community'
    ? new CommunityChannel(token.channel_id)
    : new GroupChannel(token.channel_id);
}

export function createChannelIdentifier(token: NexconnToken) {
  return token.channel_type === 'community'
    ? new CommunityChannelIdentifier(token.channel_id)
    : new GroupChannelIdentifier(token.channel_id);
}

export async function loadHistory(token: NexconnToken) {
  const query = BaseChannel.createMessagesQuery({
    channelIdentifier: createChannelIdentifier(token),
    pageSize: 50,
    isAscending: true,
  });
  const result = await query.loadNextPage();
  if (!result.isOk || !result.data) throw new Error('Unable to load Nexconn message history.');
  return result.data.data;
}

export async function sendText(token: NexconnToken, text: string) {
  const result = await createChannel(token).sendMessage(new SendTextMessageParams({ text }));
  if (!result.isOk || !result.data) throw new Error('Unable to send the Nexconn message.');
  return result.data;
}

export function subscribe(listener: MessageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function disconnectNexconn(): Promise<void> {
  if (!connectedUserId) return;
  await NCEngine.disconnect();
  connectedUserId = null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('antah-logout', () => {
    void disconnectNexconn();
  });
}
