import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { refreshTokenSchema } from '@/lib/validations';
import { verifyRefreshToken, generateTokens } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Validate input
        const validatedData = refreshTokenSchema.parse(body);

        // Verify refresh token
        const payload = verifyRefreshToken(validatedData.refreshToken);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        // Find user and check if refresh token exists
        const user = await User.findById(payload.userId);
        if (!user || !user.refreshTokens.includes(validatedData.refreshToken)) {
            return NextResponse.json(
                { error: 'Invalid refresh token' },
                { status: 401 }
            );
        }

        // Remove the used refresh token
        user.refreshTokens = user.refreshTokens.filter(
            (token: string) => token !== validatedData.refreshToken
        );

        // Generate new tokens
        const tokens = generateTokens(user);

        // Save new refresh token
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        return NextResponse.json(
            {
                message: 'Tokens refreshed successfully',
                tokens,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Refresh token error:', error);

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