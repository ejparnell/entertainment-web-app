'use client';

import Spinner from '@/ui/Spinner';
import PageLayout from '@/components/PageLayout';
import TrendingSection from '@/components/TrendingSection';
import RecommendationSection from '@/components/RecommendationSection';
import { usePageLogic } from '@/hooks/usePageLogic';
import { renderCards } from '@/utils/cardRenderer';

export default function Home() {
    const pageLogic = usePageLogic({
        defaultTitles: ["The Office", "Friends", "Breaking Bad"]
    });

    const {
        loading,
        enrichedRecommendations,
        enrichedTopShows,
        searchedShow,
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

    const trendingTitle = searchedShow ? 'Search Results' : 'Trending';
    const showPlatformSelector = !searchedShow;

    return (
        <PageLayout
            pageTitle=""
            onSearchResult={handleSearchResult}
            onSearchClear={handleSearchClear}
        >
            <TrendingSection
                title={trendingTitle}
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                isLoading={!!isTrendingLoading}
                showPlatformSelector={showPlatformSelector}
            >
                {searchedShow ? 
                    renderCards({
                        items: [searchedShow],
                        keyPrefix: 'search',
                        isBookmarked,
                        onToggleBookmark: handleBookmarkToggle
                    }) :
                    renderCards({
                        items: enrichedTopShows,
                        keyPrefix: 'trending',
                        isBookmarked,
                        onToggleBookmark: handleBookmarkToggle
                    })
                }
            </TrendingSection>

            <RecommendationSection
                title="Recommended for you"
                isLoading={isMLLoading}
            >
                {enrichedRecommendations.length > 0 && 
                    renderCards({
                        items: enrichedRecommendations,
                        keyPrefix: 'rec',
                        isBookmarked,
                        onToggleBookmark: handleBookmarkToggle
                    })
                }
            </RecommendationSection>
        </PageLayout>
    );
}
