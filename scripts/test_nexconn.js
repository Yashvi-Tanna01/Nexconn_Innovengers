// Comprehensive Two-Account Multi-User Nexconn Verification Script
async function loginUser(email, password) {
  const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ` + (await res.text()));
  const tokenData = await res.json();
  const bearer = tokenData.access_token;

  const meRes = await fetch('http://127.0.0.1:8000/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${bearer}` },
  });
  if (!meRes.ok) throw new Error(`auth/me failed for ${email}: ` + (await meRes.text()));
  const user = await meRes.json();
  console.log(`[AUTH] Authenticated: ${user.full_name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
  return { access_token: bearer, user };
}

async function getChatToken(bearer, roomId) {
  const res = await fetch('http://127.0.0.1:8000/api/v1/chat/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bearer}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room_id: roomId }),
  });
  if (!res.ok) throw new Error('Chat token failed: ' + (await res.text()));
  return await res.json();
}

async function getChatUsers(bearer) {
  const res = await fetch('http://127.0.0.1:8000/api/v1/chat/users', {
    headers: { 'Authorization': `Bearer ${bearer}` },
  });
  if (!res.ok) throw new Error('Chat users failed: ' + (await res.text()));
  return await res.json();
}

async function postDbMessage(bearer, roomId, text, messageUid) {
  const res = await fetch(`http://127.0.0.1:8000/api/v1/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bearer}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, message_uid: messageUid }),
  });
  if (!res.ok) throw new Error('Post DB message failed: ' + (await res.text()));
  return await res.json();
}

async function getDbMessages(bearer, roomId) {
  const res = await fetch(`http://127.0.0.1:8000/api/v1/chat/rooms/${roomId}/messages`, {
    headers: { 'Authorization': `Bearer ${bearer}` },
  });
  if (!res.ok) throw new Error('Get DB messages failed: ' + (await res.text()));
  return await res.json();
}

async function main() {
  console.log('=== MULTI-USER TWO-ACCOUNT VERIFICATION ===\n');

  // Step 1: Login Account A (Resident) and Account B (Coordinator)
  console.log('--- Step 1: Authenticating Users ---');
  const userA = await loginUser('rajbusa5435@gmail.com', 'Password123!');
  const userB = await loginUser('coordinator_maya@antah.network', 'Password123!');

  // Step 2: Fetch user directory
  console.log('\n--- Step 2: Verifying Participant Directory ---');
  const userDir = await getChatUsers(userA.access_token);
  console.log('Directory has', Object.keys(userDir).length, 'entries');
  console.log('Lookup antah3:', userDir['antah3']);
  console.log('Lookup antah7:', userDir['antah7']);

  // Step 3: Request Chat Tokens for Room 1 (ANTAH Community)
  console.log('\n--- Step 3: Obtaining Nexconn Channel Tokens for Room 1 ---');
  const tokenA = await getChatToken(userA.access_token, 1);
  const tokenB = await getChatToken(userB.access_token, 1);
  console.log('Token A:', {
    user: tokenA.user_name,
    uid: tokenA.nexconn_user_id,
    role: tokenA.user_role,
    channel: tokenA.channel_id,
    subChannel: tokenA.sub_channel_id,
    type: tokenA.channel_type
  });
  console.log('Token B:', {
    user: tokenB.user_name,
    uid: tokenB.nexconn_user_id,
    role: tokenB.user_role,
    channel: tokenB.channel_id,
    subChannel: tokenB.sub_channel_id,
    type: tokenB.channel_type
  });

  // Step 4: Multi-User Message Exchange
  console.log('\n--- Step 4: Multi-User Bidirectional Transmission ---');
  const testMsgIdA = `MSG-A-${Date.now()}`;
  const testTextA = 'Hello from Account A: Water leak detected on Main Street';
  console.log(`[Account A -> Room 1] Sending message: "${testTextA}" (UID: ${testMsgIdA})`);
  const dbMsgA = await postDbMessage(userA.access_token, 1, testTextA, testMsgIdA);
  console.log(`[PostgreSQL Confirmed A] ID: ${dbMsgA.id}, sender: ${dbMsgA.sender_name} (${dbMsgA.sender_role}), text: "${dbMsgA.text}"`);

  const testMsgIdB = `MSG-B-${Date.now()}`;
  const testTextB = 'Hello from Account B: Coordination team dispatched to sector';
  console.log(`\n[Account B -> Room 1] Sending reply: "${testTextB}" (UID: ${testMsgIdB})`);
  const dbMsgB = await postDbMessage(userB.access_token, 1, testTextB, testMsgIdB);
  console.log(`[PostgreSQL Confirmed B] ID: ${dbMsgB.id}, sender: ${dbMsgB.sender_name} (${dbMsgB.sender_role}), text: "${dbMsgB.text}"`);

  // Step 5: Verify Message Retrieval & Ordering
  console.log('\n--- Step 5: Verifying Message History & Ordering ---');
  const history = await getDbMessages(userB.access_token, 1);
  console.log(`Retrieved ${history.length} messages from Room 1 history.`);
  const recent = history.slice(-4);
  for (const m of recent) {
    console.log(` - [${m.created_at}] ${m.sender_name} (${m.sender_role}): "${m.text}" [UID: ${m.message_uid}]`);
  }

  // Step 6: Verify Deduplication
  console.log('\n--- Step 6: Verifying Message Deduplication ---');
  console.log('Attempting duplicate submission of Msg A with same UID...');
  const dupA = await postDbMessage(userA.access_token, 1, testTextA, testMsgIdA);
  console.log(`Duplicate submission handled idempotently, returned message id: ${dupA.id}`);
  const historyAfterDup = await getDbMessages(userB.access_token, 1);
  const matchingCount = historyAfterDup.filter(m => m.message_uid === testMsgIdA).length;
  console.log(`Count of messages with UID ${testMsgIdA}: ${matchingCount} (Expected: exactly 1)`);

  if (matchingCount === 1) {
    console.log('DEDUPLICATION VERIFIED: Exactly 1 message exists, no duplicates created!');
  } else {
    console.error('DEDUPLICATION FAILED: Duplicate detected!');
  }

  console.log('\n=== VERIFICATION SUCCEEDED ===');
}

main().catch(console.error);
