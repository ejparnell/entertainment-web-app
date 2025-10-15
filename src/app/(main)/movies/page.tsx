'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMLRecommendations, fetchTopShows } from '@/services/mlServices';
import { fetchOMDBDataBatch, fetchOMDBData, OMDBMovie } from '@/services/omdbService';

import Spinner from '@/ui/Spinner';
import Card from '@/ui/Card';
import Dropdown from '@/ui/Dropdown';
import styles from './MoviesPage.module.css';

interface MLRecommendation {
    title: string;
    platform: string;
    type: string;
    similarity_score: number;
    genres: string;
    release_year?: number;
    rating?: string;
}

interface EnrichedRecommendation {
    mlData: MLRecommendation;
    omdbData: OMDBMovie | null;
}

export default function MoviesPage() {
    const router = useRouter();
    const { user, loading, toggleBookmark: authToggleBookmark, isBookmarked } = useAuth();
    const [mlRecommendations, setMlRecommendations] = useState<{ recommendations: MLRecommendation[] } | null>(null);
    const [enrichedRecommendations, setEnrichedRecommendations] = useState<EnrichedRecommendation[]>([]);
    const [topMovies, setTopMovies] = useState<{ recommendations: MLRecommendation[]; enriched?: boolean } | null>(null);
    const [enrichedTopMovies, setEnrichedTopMovies] = useState<EnrichedRecommendation[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('Netflix');
    const [mlError, setMlError] = useState<string | null>(null);
    const [omdbError, setOmdbError] = useState<string | null>(null);
    const [bookmarkError, setBookmarkError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadMLRecommendations() {
            try {
                let inputTitles: string[] = ["The Dark Knight", "Inception", "Interstellar"];

                if (user?.bookmarkedMovies && user.bookmarkedMovies.length > 0) {
                    const titlePromises = user.bookmarkedMovies.map(async (identifier) => {
                        if (identifier.match(/^tt\d+$/)) {
                            try {
                                const omdbData = await fetchOMDBData(identifier);
                                return omdbData?.Title || identifier;
                            } catch {
                                return identifier;
                            }
                        } else {
                            return identifier;
                        }
                    });

                    inputTitles = await Promise.all(titlePromises);
                }
                
                const results = await fetchMLRecommendations(inputTitles);
                setMlRecommendations(results);
            } catch (error) {
                setMlError(error instanceof Error ? error.message : 'Error fetching ML recommendations');
            }
        }

        if (user && user.bookmarkedMovies !== undefined && !mlRecommendations) {
            loadMLRecommendations();
        }
    }, [user, mlRecommendations]);

    useEffect(() => {
        async function refreshMLRecommendations() {
            try {
                let inputTitles: string[] = ["The Dark Knight", "Inception", "Interstellar"];

                if (user?.bookmarkedMovies && user.bookmarkedMovies.length > 0) {
                    const titlePromises = user.bookmarkedMovies.map(async (identifier) => {
                        if (identifier.match(/^tt\d+$/)) {
                            try {
                                const omdbData = await fetchOMDBData(identifier);
                                return omdbData?.Title || identifier;
                            } catch {
                                return identifier;
                            }
                        } else {
                            return identifier;
                        }
                    });

                    inputTitles = await Promise.all(titlePromises);
                }

                const results = await fetchMLRecommendations(inputTitles);
                setMlRecommendations(results);
                setEnrichedRecommendations([]);
            } catch (error) {
                setMlError(error instanceof Error ? error.message : 'Error refreshing ML recommendations');
            }
        }

        if (user && mlRecommendations && user.bookmarkedMovies !== undefined) {
            refreshMLRecommendations();
        }
    }, [user?.bookmarkedMovies]);

    useEffect(() => {
        async function enrichRecommendationsWithOMDB() {
            if (!mlRecommendations?.recommendations) return;

            try {
                const titles = mlRecommendations.recommendations.map((rec: MLRecommendation) => rec.title);
                const omdbResults = await fetchOMDBDataBatch(titles);
                
                const enriched: EnrichedRecommendation[] = mlRecommendations.recommendations
                    .map((mlRec: MLRecommendation, index: number) => ({
                        mlData: mlRec,
                        omdbData: omdbResults[index]
                    }))
                    .filter(item => item.mlData.type === 'Movie' || item.omdbData?.Type === 'movie');

                setEnrichedRecommendations(enriched);
            } catch (error) {
                setOmdbError(error instanceof Error ? error.message : 'Error fetching OMDB data');
            }
        }

        if (mlRecommendations && enrichedRecommendations.length === 0) {
            enrichRecommendationsWithOMDB();
        }
    }, [mlRecommendations, enrichedRecommendations]);

    useEffect(() => {
        async function loadTopMovies() {
            try {
                const topMovies = await fetchTopShows(selectedPlatform as "Netflix" | "Hulu" | "Amazon Prime Video" | "Disney+", 10);
                setTopMovies(topMovies);
            } catch (error) {
                setMlError(error instanceof Error ? error.message : 'Error fetching top movies');
            }
        }

        if (user) {
            loadTopMovies();
        }
    }, [user, selectedPlatform]);

    useEffect(() => {
        async function enrichTopMoviesWithOMDB() {
            if (!topMovies?.recommendations) return;
            
            try {
                const titles = topMovies.recommendations.map((movie: MLRecommendation) => movie.title);
                const omdbResults = await fetchOMDBDataBatch(titles);

                const enriched: EnrichedRecommendation[] = topMovies.recommendations
                    .map((mlRec: MLRecommendation, index: number) => ({
                        mlData: mlRec,
                        omdbData: omdbResults[index]
                    }))
                    .filter(item => item.mlData.type === 'Movie' || item.omdbData?.Type === 'movie');
                
                setEnrichedTopMovies(enriched);
                setTopMovies(prev => prev ? { ...prev, enriched: true } : null);
            } catch (error) {
                setOmdbError(error instanceof Error ? error.message : 'Error fetching top movies OMDB data');
            }
        }

        if (topMovies && !topMovies.enriched) {
            enrichTopMoviesWithOMDB();
        }
    }, [topMovies]);

    if (loading) {
        return <Spinner fullscreen />;
    }

    if (!user) {
        return <Spinner fullscreen />;
    }

    async function handleBookmarkToggle(identifier: string) {
        try {
            await authToggleBookmark(identifier);
            setBookmarkError(null);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            setBookmarkError(error instanceof Error ? error.message : 'Error toggling bookmark');
        }
    }

    function handlePlatformChange(platform: string) {
        setSelectedPlatform(platform);
        setTopMovies(null);
        setEnrichedTopMovies([]);
    }

    const platformOptions = [
        { value: 'Netflix', label: 'Netflix' },
        { value: 'Hulu', label: 'Hulu' },
        { value: 'Amazon Prime Video', label: 'Amazon Prime Video' },
        { value: 'Disney+', label: 'Disney+' },
    ];

    function renderMovieCards(movies: EnrichedRecommendation[], keyPrefix: string) {
        return movies.map((item, index) => {
            const { mlData, omdbData } = item;
            
            const title = omdbData?.Title || mlData.title;
            const year = omdbData?.Year || mlData.release_year?.toString() || 'Unknown';
            const rating = omdbData?.Rated || mlData.rating || 'Not Rated';
            const category = 'Movie';
            const imageSrc = omdbData?.Poster && omdbData.Poster !== 'N/A' 
                ? omdbData.Poster 
                : '';
            
            const identifier = omdbData?.imdbID || title;
            
            return (
                <Card
                    key={`${keyPrefix}-${title}-${index}`}
                    imageSrc={imageSrc}
                    title={title}
                    year={year}
                    category={category as 'Movie' | 'TV Series'}
                    rating={rating}
                    isBookmarked={isBookmarked(identifier)}
                    onToggleBookmark={() => handleBookmarkToggle(identifier)}
                />
            );
        });
    }

    return (
        <div className={styles.moviesContainer}>
            <h1 className={styles.pageTitle}>Movies</h1>

            <div className={styles.moviesSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Trending Movies</h2>
                    
                    <div className={styles.platformSelector}>
                        <Dropdown
                            options={platformOptions}
                            value={selectedPlatform}
                            onChange={handlePlatformChange}
                            aria-label="Select streaming platform for movies"
                        />
                    </div>
                </div>

                {enrichedTopMovies.length > 0 ? (
                    <div className={styles.cardsScrollY}>
                        {renderMovieCards(enrichedTopMovies, 'trending')}
                    </div>
                ) : topMovies ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" />
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No movies available for this platform</p>
                    </div>
                )}
            </div>
            <div className={styles.moviesSection}>
                <h2 className={styles.sectionTitle}>Recommended Movies for You</h2>

                {enrichedRecommendations.length > 0 ? (
                    <div className={styles.cardsScrollY}>
                        {renderMovieCards(enrichedRecommendations, 'recommended')}
                    </div>
                ) : mlRecommendations ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" />
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No personalized recommendations available</p>
                    </div>
                )}
            </div>
        </div>
    );
}