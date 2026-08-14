import { Request, Response, NextFunction } from 'express';
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
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
