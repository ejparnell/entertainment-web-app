import Cache from '@/utils/cache';

const ML_MODEL_ENDPOINT = process.env.ML_MODEL_ENDPOINT || 'http://localhost:8000';

interface MLRecommendation {
    title: string;
    platform: string;
    type: string;
    similarity_score: number;
    genres: string;
    release_year?: number;
    rating?: string;
}

interface MLRecommendationsResponse {
    recommendations: MLRecommendation[];
}

interface MLTopShowsResponse {
    recommendations: MLRecommendation[];
}

const mlRecommendationsCache = new Cache<MLRecommendationsResponse>(15 * 60 * 1000);
const topShowsCache = new Cache<MLTopShowsResponse>(10 * 60 * 1000);

function mapPlatformToAPIValue(platform: string): string {
    const platformMap: { [key: string]: string } = {
        'Netflix': 'Netflix',
        'Hulu': 'Hulu',
        'Amazon Prime Video': 'Amazon Prime',
        'Disney+': 'Disney+'
    };
    
    return platformMap[platform] || platform;
}

function createRecommendationsCacheKey(titles: string[]): string {
    const sortedTitles = [...titles].sort().map(t => t.toLowerCase());
    return `ml_recommendations_${JSON.stringify(sortedTitles)}`;
}

function createTopShowsCacheKey(platform: string, n: number): string {
    return `ml_top_shows_${platform.toLowerCase()}_${n}`;
}

export async function fetchMLRecommendations(titles: string[] = ["The Office", "Friends", "Breaking Bad"]): Promise<MLRecommendationsResponse> {
    const cacheKey = createRecommendationsCacheKey(titles);
    const cachedData = mlRecommendationsCache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetch(`${ML_MODEL_ENDPOINT}/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titles,
                    n_recommendations: 10,
                    min_similarity: 0.1,
                    diversity_weight: 0.3,
                    coverage_boost: 0.2
                })
            });

            if (!response.ok) {
                throw new Error(`ML API Error: ${response.status}`);
            }

            const data = await response.json();
            mlRecommendationsCache.set(cacheKey, data);
            
            return data;
    } catch (error) {
        console.error('Error fetching ML recommendations:', error);
        throw error;
    }
}

export async function fetchTopShows(platform: "Netflix" | "Hulu" | "Amazon Prime Video" | "Disney+" = "Netflix", n: number = 10): Promise<MLTopShowsResponse> {
    const cacheKey = createTopShowsCacheKey(platform, n);
    const cachedData = topShowsCache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const apiPlatform = mapPlatformToAPIValue(platform);
        const url = `${ML_MODEL_ENDPOINT}/recommendations?n_shows=${n}&platform_filter=${encodeURIComponent(apiPlatform)}`;
        
        const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`ML API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            topShowsCache.set(cacheKey, data);
            
            return data;
    } catch (error) {
        console.error('Error fetching top shows:', error);
        throw error;
    }
}

export const mlCacheUtils = {
    getStats: () => ({
        recommendations: mlRecommendationsCache.getStats(),
        topShows: topShowsCache.getStats()
    }),
    clearCache: () => {
        mlRecommendationsCache.clear();
        topShowsCache.clear();
    },
    getCacheSize: () => ({
        recommendations: mlRecommendationsCache.size(),
        topShows: topShowsCache.size()
    })
};
