'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMLRecommendations, fetchTopShows } from '@/services/mlServices';
import { fetchOMDBDataBatch, fetchOMDBData, OMDBMovie } from '@/services/omdbService';

import Spinner from '@/ui/Spinner';
import Card from '@/ui/Card';
import Search from '@/ui/Search';
import styles from './Home.module.css';

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

export default function Home() {
    const router = useRouter();
    const { user, logout, loading, toggleBookmark: authToggleBookmark, isBookmarked } = useAuth();
    const [mlRecommendations, setMlRecommendations] = useState<{ recommendations: MLRecommendation[] } | null>(null);
    const [enrichedRecommendations, setEnrichedRecommendations] = useState<EnrichedRecommendation[]>([]);
    const [enrichedTopShows, setEnrichedTopShows] = useState<EnrichedRecommendation[]>([]);
    const [topShows, setTopShows] = useState<{ recommendations: MLRecommendation[]; enriched?: boolean } | null>(null);
    const [searchedShow, setSearchedShow] = useState<EnrichedRecommendation | null>(null);
    const [mlError, setMlError] = useState<string | null>(null);
    const [omdbError, setOmdbError] = useState<string | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
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
                
                const enriched: EnrichedRecommendation[] = mlRecommendations.recommendations.map((mlRec: MLRecommendation, index: number) => ({
                    mlData: mlRec,
                    omdbData: omdbResults[index]
                }));

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
                const topShows = await fetchTopShows("Netflix", 10);
                setTopShows(topShows);
            } catch (error) {
                setMlError(error instanceof Error ? error.message : 'Error fetching top shows');
            }
        }

        if (user && !topShows) {
            loadTopShows();
        }
    }, [user, topShows]);

    useEffect(() => {
        async function enrichTopShowsWithOMDB() {
            if (!topShows?.recommendations) return;
            
            try {
                const titles = topShows.recommendations.map((show: MLRecommendation) => show.title);
                const omdbResults = await fetchOMDBDataBatch(titles);

                const enriched: EnrichedRecommendation[] = topShows.recommendations.map((mlRec: MLRecommendation, index: number) => ({
                    mlData: mlRec,
                    omdbData: omdbResults[index]
                }));
                
                setEnrichedTopShows(enriched);
                
                setTopShows(prev => prev ? { ...prev, enriched: true } : null);
            } catch (error) {
                setOmdbError(error instanceof Error ? error.message : 'Error fetching top shows OMDB data');
            }
        }

        if (topShows && !topShows.enriched && enrichedTopShows.length === 0) {
            enrichTopShowsWithOMDB();
        }
    }, [topShows, enrichedTopShows]);

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
            setBookmarkError(error instanceof Error ? error.message : 'Error toggling bookmark');
        }
    }

    function renderRecommendationCards(recommendations: EnrichedRecommendation[], keyPrefix: string) {
        return recommendations.map((item, index) => {
            const { mlData, omdbData } = item;
            
            const title = omdbData?.Title || mlData.title;
            const year = omdbData?.Year || mlData.release_year?.toString() || 'Unknown';
            const rating = omdbData?.Rated || mlData.rating || 'Not Rated';
            const category = mlData.type === 'Movie' ? 'Movie' : 'TV Series';
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
    };

    function handleSearchResult(result: OMDBMovie | null, query: string) {
        if (result) {
            setSearchedShow({
                mlData: {
                    title: result.Title,
                    platform: 'Search',
                    type: result.Type === 'movie' ? 'Movie' : 'TV Series',
                    similarity_score: 1,
                    genres: result.Genre || '',
                    release_year: result.Year ? parseInt(result.Year) : undefined,
                    rating: result.Rated || undefined,
                },
                omdbData: result
            });
            setSearchError(null);
        } else {
            setSearchedShow(null);
            setSearchError(`No results found for "${query}"`);
        }
    };

    function handleSearchClear() {
        setSearchedShow(null);
        setSearchError(null);
    };

    return (
        <div className={styles.homeContainer}>
            <Search 
                placeholder='Search for movies or TV series'
                id='main-search'
                aria-label='Search for movies or TV series'
                onSearchResult={handleSearchResult}
                onSearchClear={handleSearchClear}
            />

            <div>
                <h2 className={styles.sectionTitle}>
                    {searchedShow ? 'Search Results' : 'Trending'}
                </h2>

                {searchedShow ? (
                    <div className={styles.cardsScroll}>
                        {renderRecommendationCards([searchedShow], 'search')}
                    </div>
                ) : enrichedRecommendations.length > 0 ? (
                    <div className={styles.cardsScrollX}>
                        {renderRecommendationCards(enrichedRecommendations, 'rec')}
                    </div>
                ) : mlRecommendations ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" inline />
                    </div>
                ) : null}
            </div>

            <div>
                <h2 className={styles.sectionTitle}>Recommended for you</h2>

                {enrichedRecommendations.length > 0 ? (
                    <div className={styles.cardsScrollY}>
                        {renderRecommendationCards(enrichedRecommendations, 'rec')}
                    </div>
                ) : mlRecommendations ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" inline />
                    </div>
                ) : null}
            </div>
            
            <button onClick={logout}>Logout</button>
        </div>
    );
}
