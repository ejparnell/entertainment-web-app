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

export default function ShowsPage() {
    const showFilter = (item: EnrichedRecommendation) => 
        item.mlData.type === 'TV Series' || 
        item.mlData.type === 'TV Show' ||
        item.omdbData?.Type === 'series';
    
    const pageLogic = usePageLogic({
        defaultTitles: ["The Office", "Friends", "Breaking Bad"],
        contentFilter: showFilter
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
            pageTitle="TV Series"
            onSearchResult={handleSearchResult}
            onSearchClear={handleSearchClear}
        >
            <TrendingSection
                title="Trending TV Series"
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                isLoading={!!isTrendingLoading}
                showPlatformSelector={true}
            >
                {renderCards({
                    items: enrichedTopShows,
                    keyPrefix: 'trending',
                    categoryOverride: 'TV Series',
                    isBookmarked,
                    onToggleBookmark: handleBookmarkToggle
                })}
            </TrendingSection>

            <RecommendationSection
                title="Recommended TV Series for You"
                isLoading={isMLLoading}
                emptyStateMessage="No TV series recommendations available"
            >
                {enrichedRecommendations.length > 0 && 
                    renderCards({
                        items: enrichedRecommendations,
                        keyPrefix: 'recommended',
                        categoryOverride: 'TV Series',
                        isBookmarked,
                        onToggleBookmark: handleBookmarkToggle
                    })
                }
            </RecommendationSection>
        </PageLayout>
    );
}