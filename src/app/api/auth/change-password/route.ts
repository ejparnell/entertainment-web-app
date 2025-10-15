import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

async function changePasswordHandler(request: AuthenticatedRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const validatedData = changePasswordSchema.parse(body);
        const user = await User.findById(request.user?.userId).select('+password');
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const isCurrentPasswordValid = await user.comparePassword(
            validatedData.currentPassword
        );
        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        const isSamePassword = await user.comparePassword(validatedData.newPassword);
        if (isSamePassword) {
            return NextResponse.json(
                { error: 'New password must be different from current password' },
                { status: 400 }
            );
        }

        user.password = validatedData.newPassword;
        await user.save();

        return NextResponse.json(
            { message: 'Password changed successfully' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Change password error:', error);

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

export const POST = withAuth(changePasswordHandler);