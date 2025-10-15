'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOMDBDataBatch, fetchOMDBData, OMDBMovie } from '@/services/omdbService';

import Spinner from '@/ui/Spinner';
import Card from '@/ui/Card';
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

    function renderBookmarkCards() {
        if (enrichedBookmarks.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <p>No bookmarks yet. Start bookmarking your favorite movies and TV shows!</p>
                </div>
            );
        }

        return enrichedBookmarks.map((item, index) => {
            const { identifier, omdbData } = item;
            
            const title = omdbData?.Title || identifier;
            const year = omdbData?.Year || 'Unknown';
            const rating = omdbData?.Rated || 'Not Rated';
            const category = omdbData?.Type === 'movie' ? 'Movie' : 'TV Series';
            const imageSrc = omdbData?.Poster && omdbData.Poster !== 'N/A' 
                ? omdbData.Poster 
                : '';
            
            return (
                <Card
                    key={`bookmark-${identifier}-${index}`}
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
        <div className={styles.bookmarksContainer}>
            <h1 className={styles.pageTitle}>Bookmarked Movies & TV Series</h1>

            <div className={styles.showsSection}>
                <h2 className={styles.sectionTitle}>
                    Your Bookmarks ({user?.bookmarkedMovies?.length || 0})
                </h2>

                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" />
                    </div>
                ) : (
                    <div className={styles.cardsScrollY}>
                        {renderBookmarkCards()}
                    </div>
                )}
            </div>
        </div>
    );
}