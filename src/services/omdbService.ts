import Cache from '@/utils/cache';

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

const omdbCache = new Cache<OMDBMovie | null>(30 * 60 * 1000);
const batchCache = new Cache<(OMDBMovie | null)[]>(30 * 60 * 1000);

export async function fetchOMDBData(titleOrId: string): Promise<OMDBMovie | null> {
    const cacheKey = `omdb_${titleOrId.toLowerCase()}`;
    const cachedData = omdbCache.get(cacheKey);
    if (cachedData !== null) {
        return cachedData;
    }

    try {
        const isImdbId = titleOrId.match(/^tt\d+$/);
        const queryParam = isImdbId ? `i=${encodeURIComponent(titleOrId)}` : `t=${encodeURIComponent(titleOrId)}`;
        const response = await fetch(`/api/omdb?${queryParam}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`OMDB: Movie not found - ${titleOrId}`);
                omdbCache.set(cacheKey, null, 10 * 60 * 1000);
                return null;
            }
            throw new Error(`OMDB API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            console.warn(`OMDB: ${data.error} - ${titleOrId}`);
            omdbCache.set(cacheKey, null, 10 * 60 * 1000);
            return null;
        }

        omdbCache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching OMDB data for "${titleOrId}":`, error);
        omdbCache.set(cacheKey, null, 2 * 60 * 1000);
        return null;
    }
}

export async function fetchOMDBDataBatch(titles: string[]): Promise<(OMDBMovie | null)[]> {
    try {
        const sortedTitles = [...titles].sort();
        const batchCacheKey = `omdb_batch_${JSON.stringify(sortedTitles)}`;
        const cachedBatch = batchCache.get(batchCacheKey);
        if (cachedBatch) {
            return cachedBatch;
        }
        const results: (OMDBMovie | null)[] = new Array(titles.length);
        const toFetch: { index: number; title: string }[] = [];

        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            const cacheKey = `omdb_${title.toLowerCase()}`;
            const cached = omdbCache.get(cacheKey);
            
            if (cached !== null) {
                results[i] = cached;
            } else {
                toFetch.push({ index: i, title });
            }
        }

        if (toFetch.length > 0) {
            const fetchPromises = toFetch.map(({ title }) => fetchOMDBData(title));
            const fetchedResults = await Promise.all(fetchPromises);

            toFetch.forEach(({ index }, fetchIndex) => {
                results[index] = fetchedResults[fetchIndex];
            });
        }

        batchCache.set(batchCacheKey, results);
        
        return results;
    } catch (error) {
        console.error('Error in batch OMDB fetch:', error);
        return titles.map(() => null);
    }
}

export const omdbCacheUtils = {
    getStats: () => omdbCache.getStats(),
    clearCache: () => {
        omdbCache.clear();
        batchCache.clear();
    },
    getCacheSize: () => ({
        omdb: omdbCache.size(),
        batch: batchCache.size()
    })
};
