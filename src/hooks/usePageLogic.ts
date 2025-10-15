'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMLRecommendations, fetchTopShows } from '@/services/mlServices';
import { fetchOMDBDataBatch, fetchOMDBData, OMDBMovie } from '@/services/omdbService';

export interface MLRecommendation {
    title: string;
    platform: string;
    type: string;
    similarity_score: number;
    genres: string;
    release_year?: number;
    rating?: string;
}

export interface EnrichedRecommendation {
    mlData: MLRecommendation;
    omdbData: OMDBMovie | null;
}

interface UsePageLogicOptions {
    defaultTitles: string[];
    contentFilter?: (item: EnrichedRecommendation) => boolean;
}

export function usePageLogic({ defaultTitles, contentFilter }: UsePageLogicOptions) {
    const router = useRouter();
    const { user, loading, toggleBookmark: authToggleBookmark, isBookmarked } = useAuth();
    const [mlRecommendations, setMlRecommendations] = useState<{ recommendations: MLRecommendation[] } | null>(null);
    const [enrichedRecommendations, setEnrichedRecommendations] = useState<EnrichedRecommendation[]>([]);
    const [topShows, setTopShows] = useState<{ recommendations: MLRecommendation[]; enriched?: boolean } | null>(null);
    const [enrichedTopShows, setEnrichedTopShows] = useState<EnrichedRecommendation[]>([]);
    const [searchedShow, setSearchedShow] = useState<EnrichedRecommendation | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('Netflix');
    const [mlError, setMlError] = useState<string | null>(null);
    const [omdbError, setOmdbError] = useState<string | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [bookmarkError, setBookmarkError] = useState<string | null>(null);
    const hasLoadedMLRef = useRef(false);
    const hasEnrichedMLRef = useRef(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadMLRecommendations() {
            if (hasLoadedMLRef.current) return;
            
            try {
                let inputTitles: string[] = defaultTitles;

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
                hasLoadedMLRef.current = true;
            } catch (error) {
                setMlError(error instanceof Error ? error.message : 'Error fetching ML recommendations');
            }
        }

        if (user && user.bookmarkedMovies !== undefined && !mlRecommendations && !hasLoadedMLRef.current) {
            loadMLRecommendations();
        }
    }, [user, defaultTitles]);

    useEffect(() => {
        async function refreshMLRecommendations() {
            try {
                let inputTitles: string[] = defaultTitles;

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
                
                hasLoadedMLRef.current = false;
                hasEnrichedMLRef.current = false;
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
            if (!mlRecommendations?.recommendations || hasEnrichedMLRef.current) return;

            try {
                const titles = mlRecommendations.recommendations.map((rec: MLRecommendation) => rec.title);
                const omdbResults = await fetchOMDBDataBatch(titles);
                
                let enriched: EnrichedRecommendation[] = mlRecommendations.recommendations.map((mlRec: MLRecommendation, index: number) => ({
                    mlData: mlRec,
                    omdbData: omdbResults[index]
                }));

                if (contentFilter) {
                    enriched = enriched.filter(contentFilter);
                }

                setEnrichedRecommendations(enriched);
                hasEnrichedMLRef.current = true;
            } catch (error) {
                setOmdbError(error instanceof Error ? error.message : 'Error fetching OMDB data');
            }
        }

        if (mlRecommendations && enrichedRecommendations.length === 0 && !hasEnrichedMLRef.current) {
            enrichRecommendationsWithOMDB();
        }
    }, [mlRecommendations, contentFilter]);

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

                let enriched: EnrichedRecommendation[] = topShows.recommendations.map((mlRec: MLRecommendation, index: number) => ({
                    mlData: mlRec,
                    omdbData: omdbResults[index]
                }));

                if (contentFilter) {
                    enriched = enriched.filter(contentFilter);
                }
                
                setEnrichedTopShows(enriched);
                setTopShows(prev => prev ? { ...prev, enriched: true } : null);
            } catch (error) {
                setOmdbError(error instanceof Error ? error.message : 'Error fetching top shows OMDB data');
            }
        }

        if (topShows && !topShows.enriched) {
            enrichTopShowsWithOMDB();
        }
    }, [topShows, contentFilter]);

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
    }

    function handleSearchClear() {
        setSearchedShow(null);
        setSearchError(null);
    }

    return {
        user,
        loading,
        enrichedRecommendations,
        enrichedTopShows,
        searchedShow,
        selectedPlatform,
        mlError,
        omdbError,
        searchError,
        bookmarkError,
        isMLLoading: mlRecommendations === null,
        isTrendingLoading: topShows && !topShows.enriched,
        handleBookmarkToggle,
        handlePlatformChange,
        handleSearchResult,
        handleSearchClear,
        isBookmarked
    };
}