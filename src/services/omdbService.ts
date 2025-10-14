export interface OMDBMovie {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: Array<{
        Source: string;
        Value: string;
    }>;
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
}

export async function fetchOMDBData(titleOrId: string): Promise<OMDBMovie | null> {
    try {
        // Determine if this is an IMDB ID (starts with "tt" followed by digits) or a title
        const isImdbId = titleOrId.match(/^tt\d+$/);
        const queryParam = isImdbId ? `i=${encodeURIComponent(titleOrId)}` : `t=${encodeURIComponent(titleOrId)}`;
        
        const response = await fetch(`/api/omdb?${queryParam}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`OMDB: Movie not found - ${titleOrId}`);
                return null;
            }
            throw new Error(`OMDB API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            console.warn(`OMDB: ${data.error} - ${titleOrId}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Error fetching OMDB data for "${titleOrId}":`, error);
        return null;
    }
}

export async function fetchOMDBDataBatch(titles: string[]): Promise<(OMDBMovie | null)[]> {
    try {
        const promises = titles.map(title => fetchOMDBData(title));
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Error in batch OMDB fetch:', error);
        return titles.map(() => null);
    }
}