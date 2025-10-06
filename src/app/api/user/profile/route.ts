import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { updateProfileSchema } from '@/lib/validations';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function getProfileHandler(request: AuthenticatedRequest) {
    try {
        await dbConnect();

        const user = await User.findById(request.user?.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                user: user.toJSON(),
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function updateProfileHandler(request: AuthenticatedRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Validate input
        const validatedData = updateProfileSchema.parse(body);

        // Check if email is being changed and if it already exists
        if (validatedData.email) {
            const existingUser = await User.findOne({
                email: validatedData.email,
                _id: { $ne: request.user?.userId },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                );
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            request.user?.userId,
            validatedData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: 'Profile updated successfully',
                user: user.toJSON(),
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Update profile error:', error);

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
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const GET = withAuth(getProfileHandler);
export const PUT = withAuth(updateProfileHandler);