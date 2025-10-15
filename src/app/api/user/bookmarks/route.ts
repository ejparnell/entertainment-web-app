import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { bookmarkSchema } from '@/lib/validations';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function getBookmarksHandler(request: AuthenticatedRequest) {
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
                bookmarkedMovies: user.bookmarkedMovies,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Get bookmarks error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function updateBookmarksHandler(request: AuthenticatedRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const validatedData = bookmarkSchema.parse(body);

        const user = await User.findById(request.user?.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (validatedData.action === 'add') {
            if (!user.bookmarkedMovies.includes(validatedData.movieId)) {
                user.bookmarkedMovies.push(validatedData.movieId);
            }
        } else if (validatedData.action === 'remove') {
            user.bookmarkedMovies = user.bookmarkedMovies.filter(
                (id: string) => id !== validatedData.movieId
            );
        }

        await user.save();

        return NextResponse.json(
            {
                message: `Bookmark ${validatedData.action}ed successfully`,
                bookmarkedMovies: user.bookmarkedMovies,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Update bookmarks error:', error);

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

export const GET = withAuth(getBookmarksHandler);
export const POST = withAuth(updateBookmarksHandler);