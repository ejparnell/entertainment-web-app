import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function logoutHandler(request: AuthenticatedRequest) {
    try {
        await dbConnect();

        const body = await request.json().catch(() => ({}));

        // Validate input (refresh token is optional for logout)
        const refreshToken = body.refreshToken;

        // Find user
        const user = await User.findById(request.user?.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (refreshToken) {
            // Remove specific refresh token
            user.refreshTokens = user.refreshTokens.filter(
                (token: string) => token !== refreshToken
            );
        } else {
            // Remove all refresh tokens (logout from all devices)
            user.refreshTokens = [];
        }

        await user.save();

        return NextResponse.json(
            { message: 'Logout successful' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Logout error:', error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const POST = withAuth(logoutHandler);