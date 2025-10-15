import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

export const withAuth = (
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) => {
    return async (req: AuthenticatedRequest) => {
        try {
            await dbConnect();

            const authHeader = req.headers.get('authorization');
            const token = extractTokenFromHeader(authHeader);

            if (!token) {
                return NextResponse.json(
                    { error: 'Access token is required' },
                    { status: 401 }
                );
            }

            const payload = verifyAccessToken(token);
            if (!payload) {
                return NextResponse.json(
                    { error: 'Invalid or expired token' },
                    { status: 401 }
                );
            }

            const user = await User.findById(payload.userId);
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 401 }
                );
            }

            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            };

            return handler(req);
        } catch (error) {
            console.error('Auth middleware error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
};

export const withAdminAuth = (
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) => {
    return withAuth(async (req: AuthenticatedRequest) => {
        if (req.user?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }
        return handler(req);
    });
};