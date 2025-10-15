'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMLRecommendations, fetchTopShows } from '@/services/mlServices';
import { fetchOMDBDataBatch, fetchOMDBData, OMDBMovie } from '@/services/omdbService';

import Spinner from '@/ui/Spinner';
import Card from '@/ui/Card';
import Dropdown from '@/ui/Dropdown';
import styles from './Shows.module.css';

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

export default function ShowsPage() {
    const router = useRouter();
    const { user, loading, toggleBookmark: authToggleBookmark, isBookmarked } = useAuth();
    const [mlRecommendations, setMlRecommendations] = useState<{ recommendations: MLRecommendation[] } | null>(null);
    const [enrichedRecommendations, setEnrichedRecommendations] = useState<EnrichedRecommendation[]>([]);
    const [topShows, setTopShows] = useState<{ recommendations: MLRecommendation[]; enriched?: boolean } | null>(null);
    const [enrichedTopShows, setEnrichedTopShows] = useState<EnrichedRecommendation[]>([]);
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
                let inputTitles: string[] = ["The Office", "Friends", "Breaking Bad"];

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
                let inputTitles: string[] = ["The Office", "Friends", "Breaking Bad"];

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
                    .filter(item => 
                        item.mlData.type === 'TV Series' || 
                        item.mlData.type === 'TV Show' ||
                        item.omdbData?.Type === 'series'
                    );

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
        async function loadTopShows() {
            try {
                const topShows = await fetchTopShows(selectedPlatform as "Netflix" | "Hulu" | "Amazon Prime Video" | "Disney+", 10);
                setTopShows(topShows);
            } catch (error) {
                setMlError(error instanceof Error ? error.message : 'Error fetching top shows');
            }
        }

        if (user) {
            loadTopShows();
        }
    }, [user, selectedPlatform]);

    useEffect(() => {
        async function enrichTopShowsWithOMDB() {
            if (!topShows?.recommendations) return;
            
            try {
                const titles = topShows.recommendations.map((show: MLRecommendation) => show.title);
                const omdbResults = await fetchOMDBDataBatch(titles);

                const enriched: EnrichedRecommendation[] = topShows.recommendations
                    .map((mlRec: MLRecommendation, index: number) => ({
                        mlData: mlRec,
                        omdbData: omdbResults[index]
                    }))
                    .filter(item => 
                        item.mlData.type === 'TV Series' || 
                        item.mlData.type === 'TV Show' ||
                        item.omdbData?.Type === 'series'
                    );
                
                setEnrichedTopShows(enriched);
                setTopShows(prev => prev ? { ...prev, enriched: true } : null);
            } catch (error) {
                setOmdbError(error instanceof Error ? error.message : 'Error fetching top shows OMDB data');
            }
        }

        if (topShows && !topShows.enriched) {
            enrichTopShowsWithOMDB();
        }
    }, [topShows]);

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
        setTopShows(null);
        setEnrichedTopShows([]);
    }

    const platformOptions = [
        { value: 'Netflix', label: 'Netflix' },
        { value: 'Hulu', label: 'Hulu' },
        { value: 'Amazon Prime Video', label: 'Amazon Prime Video' },
        { value: 'Disney+', label: 'Disney+' },
    ];

    function renderShowCards(shows: EnrichedRecommendation[], keyPrefix: string) {
        return shows.map((item, index) => {
            const { mlData, omdbData } = item;
            
            const title = omdbData?.Title || mlData.title;
            const year = omdbData?.Year || mlData.release_year?.toString() || 'Unknown';
            const rating = omdbData?.Rated || mlData.rating || 'Not Rated';
            const category = 'TV Series';
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
        <div className={styles.showsContainer}>
            <h1 className={styles.pageTitle}>TV Series</h1>

            <div className={styles.showsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Trending TV Series</h2>
                    
                    <div className={styles.platformSelector}>
                        <Dropdown
                            options={platformOptions}
                            value={selectedPlatform}
                            onChange={handlePlatformChange}
                            aria-label="Select streaming platform for TV shows"
                        />
                    </div>
                </div>

                {enrichedTopShows.length > 0 ? (
                    <div className={styles.cardsScrollY}>
                        {renderShowCards(enrichedTopShows, 'trending')}
                    </div>
                ) : topShows ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" />
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No TV shows available for this platform</p>
                    </div>
                )}
            </div>

            <div className={styles.showsSection}>
                <h2 className={styles.sectionTitle}>Recommended TV Series for You</h2>

                {enrichedRecommendations.length > 0 ? (
                    <div className={styles.cardsScrollY}>
                        {renderShowCards(enrichedRecommendations, 'recommended')}
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