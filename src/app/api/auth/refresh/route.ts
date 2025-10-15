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
        const validatedData = refreshTokenSchema.parse(body);

        const payload = verifyRefreshToken(validatedData.refreshToken);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        const user = await User.findById(payload.userId);
        if (!user || !user.refreshTokens.includes(validatedData.refreshToken)) {
            return NextResponse.json(
                { error: 'Invalid refresh token' },
                { status: 401 }
            );
        }

        user.refreshTokens = user.refreshTokens.filter(
            (token: string) => token !== validatedData.refreshToken
        );

        const tokens = generateTokens(user);
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