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

import { getSupabaseAdminClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { sendLineAppointmentReminder, logLineNotificationToSupabase } from '../lib/lineMessagingService';

async function runLinePushAudit() {
  console.log('====================================================');
  console.log('🏥 KHH Safe-Connect: LINE Push System Audit & Test');
  console.log('====================================================\n');

  const token = (process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();
  const secret = (process.env.LINE_CHANNEL_SECRET || '').trim();

  // --------------------------------------------------------
  // Step 1: Audit API Key & Credentials
  // --------------------------------------------------------
  console.log('🔍 Step 1: Checking API Keys & LINE Messaging API Connection...');
  if (!token) {
    console.error('❌ ERROR: LINE_CHANNEL_ACCESS_TOKEN is missing in .env.local!');
  } else {
    console.log(`✅ LINE_CHANNEL_ACCESS_TOKEN: Present (${token.substring(0, 15)}...)`);
  }

  if (!secret) {
    console.warn('⚠️ WARNING: LINE_CHANNEL_SECRET is missing in .env.local (Required for webhook signature verification).');
  } else {
    console.log(`✅ LINE_CHANNEL_SECRET: Present (${secret.substring(0, 8)}...)`);
  }

  if (token) {
    try {
      const res = await fetch('https://api.line.me/v2/bot/info', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const botInfo = await res.json();
        console.log(`✅ Connection Successful! Bot Name: "${botInfo.displayName}", Bot ID: "${botInfo.userId}"`);
      } else {
        const errText = await res.text();
        console.error(`❌ LINE Bot Info Check Failed [HTTP ${res.status}]: ${errText}`);
      }
    } catch (err: any) {
      console.error(`❌ Connection Error to api.line.me: ${err.message}`);
    }
  }

  console.log('\n----------------------------------------------------');

  // --------------------------------------------------------
  // Step 2: Check Supabase Database Logging & Bindings
  // --------------------------------------------------------
  console.log('🔍 Step 2: Auditing Supabase Connection & Target Users...');
  if (!isSupabaseConfigured()) {
    console.error('❌ ERROR: Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) missing.');
    return;
  }

  const supabase = getSupabaseAdminClient();
  let testLineUserId = '';
  let testHn = 'HN-TEST';

  try {
    const { data: users, error } = await supabase
      .from('patient_line_users')
      .select('line_user_id, hn, patient_name')
      .eq('is_active', true)
      .limit(5);

    if (error) {
      console.error('⚠️ Could not query patient_line_users table:', error.message);
    } else if (users && users.length > 0) {
      console.log(`✅ Found ${users.length} active bound patient(s) in Supabase:`);
      users.forEach((u, i) => {
        console.log(`   [${i + 1}] Name: ${u.patient_name} | HN: ${u.hn} | LINE UID: ${u.line_user_id}`);
      });
      testLineUserId = users[0].line_user_id;
      testHn = users[0].hn;
    } else {
      console.warn('⚠️ No active registered patients found in patient_line_users table.');
    }
  } catch (err: any) {
    console.error('⚠️ Error checking patient bindings:', err.message);
  }

  console.log('\n----------------------------------------------------');

  // --------------------------------------------------------
  // Step 3: Test Sending LINE Push Notification & Logging
  // --------------------------------------------------------
  console.log('🚀 Step 3: Executing Test LINE Push Notification...');

  const sampleTargetUid = testLineUserId || process.env.TEST_LINE_USER_ID || 'Uf636cf9137cbd32ff2c18773591be46a';
  console.log(`📱 Sending test notification to: ${sampleTargetUid}`);

  const testAppointmentData = {
    hn: testHn,
    patientName: 'ทดสอบ ระบบแจ้งเตือน',
    appointmentDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
    appointmentTime: '09:00 น.',
    clinicName: 'คลินิก NCDs (ทดสอบระบบ)',
    doctorName: 'พญ. คลองหาด ดูแลคุณ',
    preparationNotes: 'นี่คือข้อความทดสอบระบบ LINE Push Message และการลง Log ใน Supabase',
  };

  const result = await sendLineAppointmentReminder(sampleTargetUid, testAppointmentData);

  console.log('\n📊 Test Result Summary:');
  console.log(`   Success: ${result.success ? '✅ YES' : '❌ NO'}`);
  console.log(`   Simulated Mode: ${result.simulated ? '⚠️ YES (No Access Token or Test ID)' : '✅ NO (Live Push Sent)'}`);
  if (result.error) {
    console.log(`   Error Details: ${result.error}`);
  } else {
    console.log(`   Message: ${result.message}`);
  }

  console.log('\n====================================================');
  console.log('✨ Audit & Test Execution Completed Successfully!');
  console.log('====================================================\n');
}

runLinePushAudit().catch((err) => console.error('❌ Audit execution failed:', err));
