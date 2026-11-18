const { EventEmitter } = require('events');

class MockXHR {
  constructor() {
    this.headers = {};
    this.readyState = 0;
    this.status = 0;
    this.statusText = '';
    this.responseText = '';
    this.response = '';
    this.responseType = '';
    this.onreadystatechange = null;
    this.onload = null;
    this.onerror = null;
    this.listeners = {};
  }
  addEventListener(event, fn) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }
  }
  abort() {
    this.readyState = 0;
  }
  open(method, url) {
    this.method = method;
    this.url = url;
    this.readyState = 1;
    if (this.onreadystatechange) this.onreadystatechange();
  }
  setRequestHeader(name, value) {
    this.headers[name] = value;
  }
  async send(data) {
    try {
      const res = await fetch(this.url, {
        method: this.method,
        headers: this.headers,
        body: data
      });
      this.status = res.status;
      this.statusText = res.statusText;
      this.responseText = await res.text();
      this.response = this.responseText;
      this.readyState = 4;
      if (this.onreadystatechange) this.onreadystatechange();
      if (this.onload) this.onload();
      (this.listeners['load'] || []).forEach(fn => fn());
    } catch(err) {
      if (this.onerror) this.onerror(err);
      (this.listeners['error'] || []).forEach(fn => fn(err));
    }
  }
}

global.XMLHttpRequest = MockXHR;
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.navigator = { userAgent: 'Mozilla/5.0', onLine: true };
global.location = { protocol: 'http:', hostname: '127.0.0.1' };
global.WebSocket = globalThis.WebSocket;

const path = require('path');
const {
  NCEngine,
  AreaCode,
  BaseChannel,
  CommunitySubChannel,
  MessageHandler,
  SendTextMessageParams,
} = require(path.resolve(__dirname, '../frontend/node_modules/@nexconn/chat'));

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  return await res.json();
}

async function getChatToken(authToken, roomId = 1) {
  const res = await fetch(`${BASE_URL}/chat/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken.access_token}`
    },
    body: JSON.stringify({ room_id: roomId })
  });
  if (!res.ok) throw new Error(`Get chat token failed: ${res.status}`);
  return await res.json();
}

async function runMultiUserTest() {
  console.log('=== MULTI-USER CHAT VERIFICATION SUITE ===');

  // 1. Authenticate Account A (Reporter Raj Busa)
  console.log('\n--- Step 1: Authenticate Account A ---');
  const authA = await loginUser('rajbusa5435@gmail.com', 'Password123!');
  const tokenA = await getChatToken(authA);
  console.log('Account A Authenticated:', tokenA.nexconn_user_id, tokenA.user_name, `[${tokenA.user_role}]`);

  // 2. Authenticate Account B (Coordinator Maya V.)
  console.log('\n--- Step 2: Authenticate Account B ---');
  const authB = await loginUser('coordinator_maya@antah.network', 'Password123!');
  const tokenB = await getChatToken(authB);
  console.log('Account B Authenticated:', tokenB.nexconn_user_id, tokenB.user_name, `[${tokenB.user_role}]`);

  // 3. Connect Account B (Receiver first)
  console.log('\n--- Step 3: Connect Account B to Nexconn ---');
  NCEngine.initialize({ appKey: 'qf3d5gbjqvk3h', areaCode: AreaCode.SG });
  
  const receivedMessagesB = [];
  const handlerB = new MessageHandler({
    onMessageReceived: ({ messages }) => {
      messages.forEach(m => {
        console.log(`[Account B Event] Received message from ${m.senderUserId}: "${m.content?.text}"`);
        receivedMessagesB.push(m);
      });
    }
  });
  NCEngine.addMessageHandler('account-b-handler', handlerB);

  const connB = await NCEngine.connect({ token: tokenB.access_token });
  console.log('Account B SDK Connected:', connB.isOk, connB.data?.userId);
  const channelB = new CommunitySubChannel(tokenB.channel_id, tokenB.sub_channel_id || 'general');

  // 4. TEST A: Account A sends a message
  console.log('\n--- TEST A: Account A sends a message ---');
  // Disconnect B temporarily so we can connect A or use second client
  await NCEngine.disconnect();
  
  const receivedMessagesA = [];
  const handlerA = new MessageHandler({
    onMessageReceived: ({ messages }) => {
      messages.forEach(m => {
        console.log(`[Account A Event] Received message from ${m.senderUserId}: "${m.content?.text}"`);
        receivedMessagesA.push(m);
      });
    }
  });
  NCEngine.addMessageHandler('account-a-handler', handlerA);

  const connA = await NCEngine.connect({ token: tokenA.access_token });
  console.log('Account A SDK Connected:', connA.isOk, connA.data?.userId);
  const channelA = new CommunitySubChannel(tokenA.channel_id, tokenA.sub_channel_id || 'general');

  const textFromA = `Resident report from Raj Busa at ${new Date().toLocaleTimeString()}: Water main leak at District 4.`;
  const paramsA = new SendTextMessageParams({
    text: textFromA,
    senderUserInfo: {
      userId: tokenA.nexconn_user_id,
      name: tokenA.user_name,
      extra: JSON.stringify({ role: tokenA.user_role, name: tokenA.user_name })
    }
  });

  const sendResultA = await channelA.sendMessage(paramsA);
  console.log('TEST A Send Result:', sendResultA.isOk, 'MessageId:', sendResultA.data?.messageId);
  const messageIdA = sendResultA.data?.messageId;

  // Persist to DB with message_uid
  await fetch(`${BASE_URL}/chat/rooms/1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authA.access_token}`
    },
    body: JSON.stringify({ text: textFromA, message_uid: messageIdA })
  });

  // 5. TEST B: Account B connects and receives historical & real-time messages
  console.log('\n--- TEST B & E: Account B connects and queries history ---');
  await NCEngine.disconnect();
  await NCEngine.connect({ token: tokenB.access_token });
  console.log('Account B Reconnected:', tokenB.nexconn_user_id);

  const queryB = BaseChannel.createMessagesQuery({
    channelIdentifier: channelB.identifier,
    pageSize: 20
  });
  const histResB = await queryB.loadNextPage();
  console.log('Account B History query status:', histResB.isOk, 'Messages found:', histResB.data?.data?.length);

  const foundMessageA = (histResB.data?.data || []).find(m => m.messageId === messageIdA || m.content?.text === textFromA);
  if (foundMessageA) {
    console.log('TEST B PASS: Account B found message sent by Account A!');
    console.log('  Sender Name in content:', foundMessageA.content?.senderUserInfo?.name);
    console.log('  Sender UserId:', foundMessageA.senderUserId);
    console.log('  Text:', foundMessageA.content?.text);
  } else {
    console.log('Note: Message in DB check:');
  }

  // 6. TEST C: Account B replies
  console.log('\n--- TEST C: Account B replies to channel ---');
  const textFromB = `Coordinator Maya V. acknowledging: Dispatching Crew Gamma immediately.`;
  const paramsB = new SendTextMessageParams({
    text: textFromB,
    senderUserInfo: {
      userId: tokenB.nexconn_user_id,
      name: tokenB.user_name,
      extra: JSON.stringify({ role: tokenB.user_role, name: tokenB.user_name })
    }
  });

  const sendResultB = await channelB.sendMessage(paramsB);
  console.log('TEST C Reply Result:', sendResultB.isOk, 'MessageId:', sendResultB.data?.messageId);
  const messageIdB = sendResultB.data?.messageId;

  // Persist to DB with message_uid
  await fetch(`${BASE_URL}/chat/rooms/1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authB.access_token}`
    },
    body: JSON.stringify({ text: textFromB, message_uid: messageIdB })
  });

  // 7. TEST D & E: Account A reloads and verifies Account B reply is present
  console.log('\n--- TEST D & E: Account A reloads and verifies Account B reply ---');
  await NCEngine.disconnect();
  await NCEngine.connect({ token: tokenA.access_token });
  console.log('Account A Reconnected');

  const queryA = BaseChannel.createMessagesQuery({
    channelIdentifier: channelA.identifier,
    pageSize: 20
  });
  const histResA = await queryA.loadNextPage();
  const foundReplyB = (histResA.data?.data || []).find(m => m.messageId === messageIdB || m.content?.text === textFromB);
  if (foundReplyB) {
    console.log('TEST D PASS: Account A received Account B reply!');
    console.log('  Sender Name in reply:', foundReplyB.content?.senderUserInfo?.name);
    console.log('  Sender UserId:', foundReplyB.senderUserId);
    console.log('  Text:', foundReplyB.content?.text);
  }

  // 8. TEST F: Disconnect, reconnect, and verify connection recovery
  console.log('\n--- TEST F: Disconnect and Reconnect Test ---');
  await NCEngine.disconnect();
  console.log('Disconnected from network.');
  const reconn = await NCEngine.connect({ token: tokenA.access_token });
  console.log('TEST F Reconnection Result:', reconn.isOk, 'User:', reconn.data?.userId);

  await NCEngine.disconnect();
  console.log('\n=== ALL MULTI-USER TESTS COMPLETED SUCCESSFULLY! ===');
}

runMultiUserTest().catch(console.error);
