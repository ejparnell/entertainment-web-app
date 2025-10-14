import { useState } from 'react';
import Image from 'next/image';
import styles from './Card.module.css';

interface CardProps {
    imageSrc: string;
    title: string;
    year: string;
    category: 'Movie' | 'TV Series';
    rating: string;
    isBookmarked: boolean;
    onToggleBookmark: () => void;
    id?: string;
    'aria-label'?: string;
}

export default function Card({
    imageSrc,
    title,
    year,
    category,
    rating,
    isBookmarked,
    onToggleBookmark,
    id,
    'aria-label': ariaLabel = `${title}, ${year}, ${category}, Rated ${rating}`,
}: CardProps) {
    const [imageError, setImageError] = useState(false);
    const displayYear = year.split(/[-–]/)[0].trim();
    
    const hasValidImage = imageSrc && 
        imageSrc !== 'N/A' && 
        imageSrc !== '' &&
        imageSrc.startsWith('http') &&
        !imageSrc.includes('placeholder') &&
        !imageError;

    function handleImageError() {
        setImageError(true);
    }

    return (
        <div className={styles.card} id={id} aria-label={ariaLabel}>
            <div className={styles.imageContainer}>
                {hasValidImage ? (
                    <Image
                        src={imageSrc} 
                        alt={title}
                        fill
                        priority
                        onError={handleImageError}
                    />
                ) : (
                    <div className={styles.fallbackContainer}>
                        <Image
                            src="/assets/icon-broken-image.png"
                            alt="No image available"
                            width={40}
                            height={40}
                            className={styles.brokenIcon}
                        />
                    </div>
                )}
                <button 
                    className={styles.bookmarkButton}
                    onClick={onToggleBookmark}
                    aria-label={isBookmarked ? `Remove ${title} from bookmarks` : `Add ${title} to bookmarks`}
                >
                    <Image
                        src={isBookmarked ? '/assets/icon-bookmark-full.svg' : '/assets/icon-bookmark-empty.svg'}
                        alt={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        width={12}
                        height={14}
                        className={styles.bookmarkIcon}
                    />
                </button>
            </div>
            <div className={styles.info}>
                <div className={styles.meta}>
                    <span className={styles.year}>{displayYear}</span>
                    <div className={styles.dot} />
                    <Image
                        src={category === 'Movie' ? '/assets/icon-category-movie.svg' : '/assets/icon-category-tv.svg'}
                        alt={category}
                        width={12}
                        height={12}
                    />
                    <span className={styles.category}>{category}</span>
                    <div className={styles.dot} />
                    <span className={styles.rating}>{rating}</span>
                </div>
                <span className={styles.title}>{title}</span>
            </div>
        </div>
    );
}
