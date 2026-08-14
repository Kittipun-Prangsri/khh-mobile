import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local natively
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envConfig = readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

import { POST as handleWebhook } from '../app/api/line/webhook/route';
import { NextRequest } from 'next/server';

function createMockWebhookRequest(text: string, userId = 'U_TEST_USER_999') {
  const body = {
    events: [
      {
        type: 'message',
        replyToken: '00000000000000000000000000000000', // Dummy token for simulation
        source: {
          type: 'user',
          userId,
        },
        timestamp: Date.now(),
        message: {
          id: `msg_${Date.now()}`,
          type: 'text',
          text,
        },
      },
    ],
  };

  return new NextRequest('http://localhost:3000/api/line/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function runFullWorkflowTest() {
  console.log('====================================================');
  console.log('🧪 KHH Safe-Connect: Automated Full Workflow Test');
  console.log('====================================================\n');

  const testCases = [
    { title: '1. Patient Registration Step 1 (13-digit CID)', input: '1234567890123' },
    { title: '1b. Patient Registration Step 2 (Birth Year 2495)', input: 'Y2495' },
    { title: '2. Diet Advice Flex Request', input: 'คำแนะนำการรับประทานอาหาร' },
    { title: '3. Medication Advice Flex Request', input: 'คำแนะนำการใช้ยา' },
    { title: '4. Pharmacist Patient Form Prompt Request', input: 'แบบฟอร์มข้อมูลคนไข้สำหรับประกอบการปรึกษากับเภสัช' },
    { title: '5. Stress & Sleep Advice Flex Request', input: 'คำแนะนำความเครียดและการนอน' },
    { title: '6. Direct Pharmacist Contact Message', input: 'สอบถามเกี่ยวกับการทานยาซ้ำซ้อนค่ะ เภสัชกรช่วยดูให้หน่อยค่ะ' },
    { title: '7. Direct Nutritionist Contact Message', input: 'สอบถามเรื่องเมนูอาหารสำหรับผู้ป่วยเบาหวานและความดันสูงค่ะ' },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`🔹 Testing Case: ${tc.title}`);
    console.log(`   Input Text: "${tc.input}"`);

    try {
      const req = createMockWebhookRequest(tc.input);
      const res = await handleWebhook(req);
      const data = await res.json();

      if (res.status === 200 && (data.status === 'ok' || data.status === 'success')) {
        console.log(`   Result: ✅ SUCCESS (Handled ${data.processed} event(s))`);
        passed++;
      } else {
        console.error(`   Result: ❌ FAILED [Status ${res.status}]`);
        failed++;
      }
    } catch (err: any) {
      console.error(`   Result: ❌ ERROR: ${err.message}`);
      failed++;
    }
    console.log('----------------------------------------------------');
  }

  console.log('\n====================================================');
  console.log(`📊 Final Test Results: Passed ${passed}/${testCases.length} (${failed} failed)`);
  console.log('====================================================\n');
}

runFullWorkflowTest().catch((err) => console.error('❌ Test execution error:', err));
