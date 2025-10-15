import { NextRequest, NextResponse } from 'next/server';

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

export async function GET(request: NextRequest) {
    try {
        if (!OMDB_API_KEY) {
            return NextResponse.json(
                { error: 'OMDB API key not configured' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const title = searchParams.get('t');
        const imdbId = searchParams.get('i');

        if (!title && !imdbId) {
            return NextResponse.json(
                { error: 'Either title (t) or IMDB ID (i) parameter is required' },
                { status: 400 }
            );
        }

        const queryParam = imdbId ? `i=${encodeURIComponent(imdbId)}` : `t=${encodeURIComponent(title!)}`;
        const omdbUrl = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&${queryParam}`;
        
        const response = await fetch(omdbUrl);
        const data = await response.json();

        if (data.Response === 'False') {
            return NextResponse.json(
                { error: data.Error || 'Movie not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('OMDB API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch movie data' },
            { status: 500 }
        );
    }
}