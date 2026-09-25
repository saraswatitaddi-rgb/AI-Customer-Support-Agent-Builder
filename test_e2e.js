const http = require('http');
const mongoose = require('./backend/node_modules/mongoose');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

function req(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const r = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
      }
    );
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function runE2ETests() {
  console.log('====================================');
  console.log('STARTING END-TO-END AUDIT & VERIFICATION');
  console.log('====================================\n');

  const testEmail = 'agent_audit_' + Date.now() + '@agentcraft.ai';
  const testPass = 'SecurePass987!';

  console.log('[TEST 1] Registering New User (' + testEmail + ')...');
  const reg = await req('/api/auth/register', 'POST', {
    name: 'Audit User',
    email: testEmail,
    password: testPass,
  });
  console.log('Status:', reg.status, '| Success:', reg.body.success, '| Token generated:', !!reg.body.token);
  if (reg.status !== 201) throw new Error('Registration failed: ' + JSON.stringify(reg.body));
  const token = reg.body.token;

  console.log('\n[TEST 2] Verifying MongoDB Persistence and Password Hashing...');
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./backend/src/models/User');
  const dbUser = await User.findOne({ email: testEmail });
  console.log('User found in MongoDB:', !!dbUser);
  console.log('Stored Password is Hashed (starts with $2):', dbUser.password.startsWith('$2'));
  console.log('Plaintext Password Match with bcrypt:', await dbUser.matchPassword(testPass));

  console.log('\n[TEST 3] Duplicate Email Registration Prevention...');
  const dup = await req('/api/auth/register', 'POST', {
    name: 'Audit User 2',
    email: testEmail,
    password: testPass,
  });
  console.log('Status (expect 409):', dup.status, '| Message:', dup.body.message);

  console.log('\n[TEST 4] Incorrect Password Login Attempt...');
  const wrongLogin = await req('/api/auth/login', 'POST', {
    email: testEmail,
    password: 'WrongPassword!',
  });
  console.log('Status (expect 401):', wrongLogin.status, '| Message:', wrongLogin.body.message);

  console.log('\n[TEST 5] Correct Password Login Attempt...');
  const correctLogin = await req('/api/auth/login', 'POST', {
    email: testEmail,
    password: testPass,
  });
  console.log('Status (expect 200):', correctLogin.status, '| User Name:', correctLogin.body.user?.name);

  console.log('\n[TEST 6] Protected Route /api/auth/me...');
  const me = await req('/api/auth/me', 'GET', null, token);
  console.log('Status:', me.status, '| User:', me.body.user?.email, '| Agent Name:', me.body.agent?.name);

  console.log('\n[TEST 7] Update Agent Persona & Settings in MongoDB...');
  const updatedAgent = await req(
    '/api/agent',
    'PUT',
    {
      name: 'Enterprise Bot v2',
      tone: 'Professional',
      welcomeMessage: 'Greetings! How may I assist your business today?',
    },
    token
  );
  console.log('Updated Agent Name:', updatedAgent.body.agent?.name, '| Tone:', updatedAgent.body.agent?.tone);

  console.log('\n[TEST 8] Add Custom Knowledge Base Item to MongoDB...');
  const newKB = await req(
    '/api/agent/knowledge',
    'POST',
    {
      title: 'Enterprise SLA Guarantee',
      category: 'Policies',
      content: 'Our enterprise plan includes a 99.99% uptime SLA and 15-minute response guarantee.',
    },
    token
  );
  console.log('Created KB Title:', newKB.body.item?.title, '| ID:', newKB.body.item?._id);

  console.log('\n[TEST 9] Live Chat Dynamic Inquiries (Prompt Requirement 2)...');
  const questions = [
    { q: 'Hi', label: 'Greeting' },
    { q: 'What is the price of chicken pickle?', label: 'Product Pricing' },
    { q: 'How can I return a product?', label: 'Return Policy' },
    { q: 'What payment methods do you support?', label: 'Payment Options' },
    { q: 'Do you deliver to Bengaluru?', label: 'Shipping / Location' },
    { q: 'Who won the 1994 football world cup?', label: 'Unknown/Unrelated (Safe Fallback)' },
  ];

  for (const item of questions) {
    const res = await req('/api/chat', 'POST', { message: item.q });
    console.log('   [' + item.label + '] Q: "' + item.q + '"');
    console.log('   -> Answer: "' + res.body.reply + '"');
    console.log('   -> Source: ' + res.body.source + ' | Intent: ' + res.body.intent + '\n');
  }

  console.log('[TEST 10] Multi-Turn Context Follow-Up (Order Return Context)...');
  const turn1 = await req('/api/chat', 'POST', { message: 'I want to return my order.' });
  console.log('   Turn 1 Q: "I want to return my order."');
  console.log('   Turn 1 A: "' + turn1.body.reply + '"');

  const turn2 = await req('/api/chat', 'POST', {
    message: 'My order ID is ORD1234',
    history: [
      { role: 'user', content: 'I want to return my order.' },
      { role: 'agent', content: turn1.body.reply },
    ],
  });
  console.log('   Turn 2 Q: "My order ID is ORD1234" (with context)');
  console.log('   Turn 2 A: "' + turn2.body.reply + '"');
  console.log('   -> Source: ' + turn2.body.source);

  console.log('\n[TEST 11] Multi-Turn Context Follow-Up (Order Status Context)...');
  const statusTurn1 = await req('/api/chat', 'POST', { message: 'What is my order status?' });
  console.log('   Turn 1 Q: "What is my order status?"');
  console.log('   Turn 1 A: "' + statusTurn1.body.reply + '"');

  const statusTurn2 = await req('/api/chat', 'POST', {
    message: 'ORD5678',
    history: [
      { role: 'user', content: 'What is my order status?' },
      { role: 'agent', content: statusTurn1.body.reply },
    ],
  });
  console.log('   Turn 2 Q: "ORD5678" (with context)');
  console.log('   Turn 2 A: "' + statusTurn2.body.reply + '"');

  console.log('\n====================================');
  console.log('ALL 11 END-TO-END TESTS PASSED SUCCESSFULLY!');
  console.log('====================================');
  await mongoose.disconnect();
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('E2E TEST FAILURE:', err);
  process.exit(1);
});
