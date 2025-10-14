const ML_MODEL_ENDPOINT = process.env.ML_MODEL_ENDPOINT || 'http://localhost:8000';

export async function fetchMLRecommendations(titles: string[] = ["The Office", "Friends", "Breaking Bad"]) {
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

            return await response.json();
    } catch (error) {
        console.error('Error fetching ML recommendations:', error);
        throw error;
    }
}

export async function fetchTopShows(platform: "Netflix" | "Hulu" | "Prime Video" | "Disney+" = "Netflix", n: number = 10) {
    try {
        const response = await fetch(`${ML_MODEL_ENDPOINT}/recommendations?n_shows=${n}&platform_filter=${platform}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`ML API Error: ${response.status}`);
            }

            return await response.json();
    } catch (error) {
        console.error('Error fetching top shows:', error);
        throw error;
    }
}