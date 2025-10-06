import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { generateTokens } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Create new user
        const user = await User.create(validatedData);

        // Generate tokens
        const tokens = generateTokens(user);

        // Save refresh token to user
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: user.toJSON(),
                tokens,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Registration error:', error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 11000
        ) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}