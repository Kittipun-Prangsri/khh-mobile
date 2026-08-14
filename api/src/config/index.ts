import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const config = {
  port: process.env.PORT || '5003',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtAudience: process.env.JWT_AUDIENCE || 'authenticated'
  }
};
