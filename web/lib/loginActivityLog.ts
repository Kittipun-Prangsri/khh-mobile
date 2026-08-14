import { getSupabaseAdminClient, isSupabaseConfigured } from './supabaseClient';

export interface LoginActivityEntry {
  loginname: string;
  name: string;
  role: string;
  source: string; // e.g. 'HOSxP DB', 'Supabase / Duplicated Store', 'Supabase Standby Store'
  ipAddress: string;
  userAgent: string;
}

// This app is single-tenant (one hospital), so the organization row is
// resolved once and cached rather than looked up on every login.
let cachedOrganizationId: string | null | undefined;

async function getOrganizationId(): Promise<string | null> {
  if (cachedOrganizationId !== undefined) return cachedOrganizationId;

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from('organizations').select('id').limit(1).single();
  cachedOrganizationId = (data?.id as string | undefined) ?? null;
  return cachedOrganizationId;
}

/**
 * Who's logging in — written to the existing `audit_logs` table (action:
 * 'login') instead of a bespoke table. Best-effort: a logging failure must
 * never block or fail the actual login, so callers fire this without
 * awaiting it on the response path.
 */
export async function recordLoginActivity(entry: LoginActivityEntry): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const organizationId = await getOrganizationId();
    if (!organizationId) return; // audit_logs.organization_id is NOT NULL with no default

    const supabase = getSupabaseAdminClient();
    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      actor_role: entry.role,
      action: 'login',
      entity_type: 'auth_session',
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      new_values: { loginname: entry.loginname, name: entry.name, source: entry.source },
    });
  } catch (err) {
    console.warn('⚠️ Failed to record login activity:', err);
  }
}

export interface LoginActivityRow {
  id: string;
  loginname: string;
  name: string;
  role: string;
  source: string;
  ip_address: string;
  user_agent: string;
  logged_in_at: string;
}

export async function getRecentLoginActivity(limit = 100): Promise<LoginActivityRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, actor_role, ip_address, user_agent, new_values, created_at')
    .eq('action', 'login')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('⚠️ Failed to fetch login activity:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    loginname: row.new_values?.loginname || '-',
    name: row.new_values?.name || '-',
    role: row.actor_role || '-',
    source: row.new_values?.source || '-',
    ip_address: row.ip_address || '-',
    user_agent: row.user_agent || '-',
    logged_in_at: row.created_at,
  }));
}

/** Best-effort client IP extraction behind a reverse proxy / PM2. */
export function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
