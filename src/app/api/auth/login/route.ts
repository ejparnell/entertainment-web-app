import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import { generateTokens } from '@/lib/jwt';
import { authRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const rateLimitResult = authRateLimit(request);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too many login attempts. Please try again later.',
                    resetTime: rateLimitResult.resetTime,
                },
                { status: 429 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Validate input
        const validatedData = loginSchema.parse(body);

        // Find user by email
        const user = await User.findOne({ email: validatedData.email }).select(
            '+password'
        );
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check password
        const isPasswordValid = await user.comparePassword(
            validatedData.password
        );
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate tokens
        const tokens = generateTokens(user);

        // Save refresh token to user
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        const response = NextResponse.json(
            {
                message: 'Login successful',
                user: user.toJSON(),
                tokens,
            },
            { status: 200 }
        );

        // Add rate limit headers
        response.headers.set(
            'X-RateLimit-Remaining',
            rateLimitResult.remaining?.toString() || '0'
        );
        response.headers.set(
            'X-RateLimit-Reset',
            rateLimitResult.resetTime?.toString() || '0'
        );

        return response;
    } catch (error: unknown) {
        console.error('Login error:', error);

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