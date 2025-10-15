'use client';

import Spinner from '@/ui/Spinner';
import PageLayout from '@/components/PageLayout';
import TrendingSection from '@/components/TrendingSection';
import RecommendationSection from '@/components/RecommendationSection';
import { usePageLogic } from '@/hooks/usePageLogic';
import { renderCards } from '@/utils/cardRenderer';

interface EnrichedRecommendation {
    mlData: {
        title: string;
        platform: string;
        type: string;
        similarity_score: number;
        genres: string;
        release_year?: number;
        rating?: string;
    };
    omdbData: {
        Title: string;
        Year: string;
        Rated: string;
        Type: string;
        Poster: string;
        imdbID: string;
    } | null;
}

export default function MoviesPage() {
    const movieFilter = (item: EnrichedRecommendation) => item.mlData.type === 'Movie' || item.omdbData?.Type === 'movie';
    
    const pageLogic = usePageLogic({
        defaultTitles: ["The Dark Knight", "Inception", "Interstellar"],
        contentFilter: movieFilter
    });

    const {
        loading,
        enrichedRecommendations,
        enrichedTopShows,
        selectedPlatform,
        isMLLoading,
        isTrendingLoading,
        handleBookmarkToggle,
        handlePlatformChange,
        handleSearchResult,
        handleSearchClear,
        isBookmarked
    } = pageLogic;

    if (loading) {
        return <Spinner fullscreen />;
    }

    return (
        <PageLayout
            pageTitle="Movies"
            onSearchResult={handleSearchResult}
            onSearchClear={handleSearchClear}
        >
            <TrendingSection
                title="Trending Movies"
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                isLoading={!!isTrendingLoading}
                showPlatformSelector={true}
            >
                {renderCards({
                    items: enrichedTopShows,
                    keyPrefix: 'trending',
                    categoryOverride: 'Movie',
                    isBookmarked,
                    onToggleBookmark: handleBookmarkToggle
                })}
            </TrendingSection>

            <RecommendationSection
                title="Recommended Movies for You"
                isLoading={isMLLoading}
                emptyStateMessage="No movie recommendations available"
            >
                {enrichedRecommendations.length > 0 && 
                    renderCards({
                        items: enrichedRecommendations,
                        keyPrefix: 'recommended',
                        categoryOverride: 'Movie',
                        isBookmarked,
                        onToggleBookmark: handleBookmarkToggle
                    })
                }
            </RecommendationSection>
        </PageLayout>
    );
}