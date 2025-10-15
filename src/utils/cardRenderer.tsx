import Card from '@/ui/Card';
import { EnrichedRecommendation } from '@/hooks/usePageLogic';

interface CardRendererProps {
    items: EnrichedRecommendation[];
    keyPrefix: string;
    categoryOverride?: 'Movie' | 'TV Series';
    isBookmarked: (identifier: string) => boolean;
    onToggleBookmark: (identifier: string) => void;
}

export function renderCards({
    items,
    keyPrefix,
    categoryOverride,
    isBookmarked,
    onToggleBookmark
}: CardRendererProps) {
    return items.map((item, index) => {
        const { mlData, omdbData } = item;
        
        const title = omdbData?.Title || mlData.title;
        const year = omdbData?.Year || mlData.release_year?.toString() || 'Unknown';
        const rating = omdbData?.Rated || mlData.rating || 'Not Rated';
        const category = categoryOverride || (mlData.type === 'Movie' ? 'Movie' : 'TV Series');
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
                onToggleBookmark={() => onToggleBookmark(identifier)}
            />
        );
    });
}