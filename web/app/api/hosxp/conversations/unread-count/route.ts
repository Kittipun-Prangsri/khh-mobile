import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hosxp/conversations/unread-count
 * Returns the real number of unreplied patient LINE conversations (last_replied_at is NULL).
 */
export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      const { count, error } = await supabase
        .from('patient_line_users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .is('last_replied_at', null);

      if (!error && typeof count === 'number') {
        return NextResponse.json({ success: true, count, source: 'supabase' });
      }
    }

    return NextResponse.json({ success: true, count: 0, source: 'none' });
  } catch (error: any) {
    console.error('❌ Unread count API error:', error);
    return NextResponse.json({ success: false, count: 0, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/hosxp/conversations/unread-count
 * Mark all unreplied patient LINE conversations as acknowledged/read.
 */
export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      const nowIso = new Date().toISOString();

      await supabase
        .from('patient_line_users')
        .update({
          last_replied_at: nowIso,
          last_replied_by_name: 'เจ้าหน้าที่ (รับทราบแล้ว)',
          last_replied_by_role: 'ทีมสุขภาพ',
        })
        .eq('is_active', true)
        .is('last_replied_at', null);

      return NextResponse.json({
        success: true,
        count: 0,
        message: '✓ เคลียร์รายการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว',
      });
    }

    return NextResponse.json({ success: true, count: 0, message: '✓ เคลียร์เรียบร้อย' });
  } catch (error: any) {
    console.error('❌ Error clearing unread count:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
