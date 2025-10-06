import Image from 'next/image';
import styles from './Card.module.css';

interface CardProps {
    type: 'short' | 'long';
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
    type,
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
    return (
        <div className={`${styles.card} ${styles[type]}`} id={id} aria-label={ariaLabel}>
            <div className={styles.imageContainer}>
                <Image
                    src={imageSrc} 
                    alt={title}
                    fill
                    priority
                />
            </div>
            <div className={styles.info}>
                <span className={styles.year}>{year}</span>
                <span className={styles.category}>{category}</span>
                <span className={styles.rating}>{rating}</span>
            </div>
        </div>
    );
}
