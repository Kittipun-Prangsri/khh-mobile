import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { findPatientByHnOrCidInHosxp } from '@/lib/lineUserService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();

    const conversationsMap = new Map<string, any>();

    // 1. Fetch live incoming messages & bound users from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();

        // Query active bound LINE users
        const { data: usersData } = await supabase
          .from('patient_line_users')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        // Query recent patient messages
        const { data: messagesData } = await supabase
          .from('patient_line_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (usersData && usersData.length > 0) {
          for (const u of usersData) {
            const userMessages = (messagesData || [])
              .filter((m: any) => m.hn === u.hn || m.line_user_id === u.line_user_id)
              .reverse()
              .map((m: any) => ({
                id: m.id || `msg-${m.created_at}`,
                sender: 'patient',
                senderName: u.patient_name || m.patient_name || 'ผู้ป่วย',
                text: m.message_text || '',
                time: new Date(m.created_at || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              }));

            const lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;

            // Determine department category
            let department = 'nurse';
            const textToAnalyze = (lastMsg?.text || '').toLowerCase();
            if (textToAnalyze.includes('ยา') || textToAnalyze.includes('เภสัช')) department = 'pharmacist';
            else if (textToAnalyze.includes('จิต') || textToAnalyze.includes('เครียด') || textToAnalyze.includes('นอน')) department = 'psychiatrist';
            else if (textToAnalyze.includes('อาหาร') || textToAnalyze.includes('กิน')) department = 'dietitian';
            else if (textToAnalyze.includes('กายภาพ') || textToAnalyze.includes('ออกกำลัง')) department = 'public_health';

            // Determine priority
            let priority = 'normal';
            if (textToAnalyze.includes('ฉุกเฉิน') || textToAnalyze.includes('ด่วน') || textToAnalyze.includes('แน่นหน้าอก')) priority = 'urgent';
            else if (textToAnalyze.includes('เลื่อนนัด') || textToAnalyze.includes('ขอเปลี่ยน')) priority = 'high';

            const isTokenValid = u.reply_token_expires_at ? new Date(u.reply_token_expires_at).getTime() > Date.now() : false;
            const hasBeenReplied = Boolean(u.last_replied_at);

            conversationsMap.set(u.hn, {
              id: `conv-${u.hn}`,
              hn: u.hn,
              patientName: u.patient_name || 'ผู้ป่วย รพ.คลองหาด',
              lineUserId: u.line_user_id,
              userRole: u.user_role || 'patient',
              latestReplyToken: isTokenValid ? u.latest_reply_token : null,
              subject: lastMsg ? lastMsg.text : 'สนทนาสอบถามทั่วไป',
              category: department === 'pharmacist' ? 'ปรึกษาเรื่องยา' : department === 'psychiatrist' ? 'ปรึกษาสุขภาพจิต' : 'สอบถามทั่วไป',
              department,
              priority,
              status: hasBeenReplied ? 'replied' : 'pending',
              lastRepliedByName: u.last_replied_by_name || null,
              lastRepliedByRole: u.last_replied_by_role || null,
              lastRepliedAt: u.last_replied_at ? new Date(u.last_replied_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : null,
              unreadCount: hasBeenReplied ? 0 : (lastMsg ? 1 : 0),
              lastMessageTime: lastMsg ? lastMsg.time : new Date(u.created_at || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              messages: userMessages.length > 0 ? userMessages : [
                {
                  id: `welcome-${u.hn}`,
                  sender: 'patient',
                  senderName: u.patient_name || 'ผู้ป่วย',
                  text: 'สวัสดีค่ะ ผูกบัญชีไลน์เรียบร้อยแล้วค่ะ',
                  time: new Date(u.created_at || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            });
          }
        }
      } catch (err) {
        console.warn('⚠️ Supabase error fetching conversations:', err);
      }
    }

    // 2. Fallback mock / HOSxP default records if Supabase has no records yet
    if (conversationsMap.size === 0) {
      const demoHns = ['HN-000059754', 'HN-000088912', 'HN-000091244'];
      for (const hn of demoHns) {
        const patientMatch = await findPatientByHnOrCidInHosxp(hn);
        if (patientMatch.found) {
          conversationsMap.set(patientMatch.hn, {
            id: `conv-${patientMatch.hn}`,
            hn: patientMatch.hn,
            patientName: patientMatch.patientName,
            lineUserId: 'U_DEMO_LINE_USER',
            userRole: 'patient',
            subject: 'สอบถามคำแนะนำสุขภาพคลินิก NCDs',
            category: 'สอบถามทั่วไป',
            department: 'nurse',
            priority: 'normal',
            unreadCount: 0,
            lastMessageTime: '08:30',
            messages: [
              {
                id: `demo-msg-${patientMatch.hn}`,
                sender: 'patient',
                senderName: patientMatch.patientName,
                text: 'สอบถามข้อมูลเตรียมตัวก่อนมาตรวจเลือดพรุ่งนี้ค่ะ',
                time: '08:30',
              },
            ],
          });
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());

    // Filter by search query
    const filtered = searchQuery
      ? conversations.filter(
          (c) =>
            c.patientName.toLowerCase().includes(searchQuery) ||
            c.hn.toLowerCase().includes(searchQuery) ||
            c.subject.toLowerCase().includes(searchQuery)
        )
      : conversations;

    return NextResponse.json({
      success: true,
      conversations: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('❌ Error in /api/hosxp/conversations:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
