'use client';

import { ReactNode } from 'react';
import Spinner from '@/ui/Spinner';
import styles from './RecommendationSection.module.css';

interface RecommendationSectionProps {
    title: string;
    isLoading: boolean;
    children?: ReactNode;
    emptyStateMessage?: string;
}

export default function RecommendationSection({
    title,
    isLoading,
    children,
    emptyStateMessage = "No recommendations available"
}: RecommendationSectionProps) {
    return (
        <div className={styles.showsSection}>
            <h2 className={styles.sectionTitle}>{title}</h2>

            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <Spinner size="medium" />
                </div>
            ) : children ? (
                <div className={styles.cardsScrollY}>
                    {children}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>{emptyStateMessage}</p>
                </div>
            )}
        </div>
    );
}