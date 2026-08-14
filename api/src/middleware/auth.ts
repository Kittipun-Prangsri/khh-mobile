import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

// Extend Express Request types inline or via declaration merge
export interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: {
    id: string;
    organization_id: string | null;
    full_name: string;
    role: string;
    is_active: boolean;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Initialize user-scoped Supabase client to fetch user
    const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid access token'
        }
      });
    }

    // Initialize Admin Supabase client (service role) to fetch profiles safely bypass RLS if needed,
    // or use user-scoped client if profile select policy allows self-read.
    // Here we use admin client to ensure we can load the profile details even if policies are strict.
    const adminSupabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id, organization_id, full_name, role, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'User profile not found in KHH database'
        }
      });
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Your account is deactivated'
        }
      });
    }

    // Attach to request
    req.user = user;
    req.profile = profile;

    return next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An error occurred during authentication'
      }
    });
  }
}
