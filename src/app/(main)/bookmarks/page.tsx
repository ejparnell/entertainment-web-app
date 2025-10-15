'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOMDBDataBatch, fetchOMDBData, OMDBMovie } from '@/services/omdbService';

import Spinner from '@/ui/Spinner';
import PageLayout from '@/components/PageLayout';
import { renderCards } from '@/utils/cardRenderer';
import styles from './Bookmarks.module.css';

interface EnrichedBookmark {
    identifier: string;
    omdbData: OMDBMovie | null;
}

export default function BookmarksPage() {
    const router = useRouter();
    const { user, loading, toggleBookmark: authToggleBookmark, isBookmarked } = useAuth();
    const [enrichedBookmarks, setEnrichedBookmarks] = useState<EnrichedBookmark[]>([]);
    const [omdbError, setOmdbError] = useState<string | null>(null);
    const [bookmarkError, setBookmarkError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<EnrichedBookmark | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadBookmarkedItems() {
            if (!user?.bookmarkedMovies || user.bookmarkedMovies.length === 0) {
                setEnrichedBookmarks([]);
                return;
            }

            setIsLoading(true);
            try {
                const titlePromises = user.bookmarkedMovies.map(async (identifier) => {
                    if (identifier.match(/^tt\d+$/)) {
                        try {
                            const omdbData = await fetchOMDBData(identifier);
                            return { identifier, title: omdbData?.Title || identifier };
                        } catch {
                            return { identifier, title: identifier };
                        }
                    } else {
                        return { identifier, title: identifier };
                    }
                });

                const identifierTitlePairs = await Promise.all(titlePromises);
                const titles = identifierTitlePairs.map(pair => pair.title);
                const omdbResults = await fetchOMDBDataBatch(titles);
                const enriched: EnrichedBookmark[] = identifierTitlePairs.map((pair, index) => ({
                    identifier: pair.identifier,
                    omdbData: omdbResults[index]
                }));

                setEnrichedBookmarks(enriched);
                setOmdbError(null);
            } catch (error) {
                console.error('Error loading bookmarked items:', error);
                setOmdbError(error instanceof Error ? error.message : 'Error fetching bookmark data');
            } finally {
                setIsLoading(false);
            }
        }

        if (user && user.bookmarkedMovies !== undefined) {
            loadBookmarkedItems();
        }
    }, [user?.bookmarkedMovies]);

    async function handleBookmarkToggle(identifier: string) {
        try {
            await authToggleBookmark(identifier);
            setBookmarkError(null);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            setBookmarkError(error instanceof Error ? error.message : 'Error toggling bookmark');
        }
    }

    function handleSearchResult(result: OMDBMovie | null, query: string) {
        if (result) {
            setSearchResult({
                identifier: result.imdbID || query,
                omdbData: result
            });
        }
    }

    function handleSearchClear() {
        setSearchResult(null);
    }

    if (loading) {
        return <Spinner fullscreen />;
    }

    if (!user) {
        return <Spinner fullscreen />;
    }

    const bookmarkItems = enrichedBookmarks.map(bookmark => ({
        mlData: {
            title: bookmark.omdbData?.Title || bookmark.identifier,
            platform: '',
            type: bookmark.omdbData?.Type === 'movie' ? 'Movie' : 'TV Series',
            similarity_score: 0,
            genres: '',
            release_year: bookmark.omdbData?.Year ? parseInt(bookmark.omdbData.Year) : undefined,
            rating: bookmark.omdbData?.Rated
        },
        omdbData: bookmark.omdbData
    }));

    const displayItems = searchResult ? [{
        mlData: {
            title: searchResult.omdbData?.Title || searchResult.identifier,
            platform: '',
            type: searchResult.omdbData?.Type === 'movie' ? 'Movie' : 'TV Series',
            similarity_score: 0,
            genres: '',
            release_year: searchResult.omdbData?.Year ? parseInt(searchResult.omdbData.Year) : undefined,
            rating: searchResult.omdbData?.Rated
        },
        omdbData: searchResult.omdbData
    }] : bookmarkItems;

    return (
        <PageLayout
            pageTitle="Bookmarked Movies & TV Series"
            onSearchResult={handleSearchResult}
            onSearchClear={handleSearchClear}
        >
            <div className={styles.showsSection}>
                <h2 className={styles.sectionTitle}>
                    {searchResult ? 'Search Result' : `Your Bookmarks (${user?.bookmarkedMovies?.length || 0})`}
                </h2>

                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" />
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No bookmarks yet. Start bookmarking your favorite movies and TV shows!</p>
                    </div>
                ) : (
                    <div className={styles.cardsScrollY}>
                        {renderCards({
                            items: displayItems,
                            keyPrefix: 'bookmark',
                            isBookmarked,
                            onToggleBookmark: handleBookmarkToggle
                        })}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}