'use client';

import { ReactNode } from 'react';
import Dropdown from '@/ui/Dropdown';
import Spinner from '@/ui/Spinner';
import styles from './TrendingSection.module.css';

interface TrendingSectionProps {
    title: string;
    selectedPlatform: string;
    onPlatformChange: (platform: string) => void;
    isLoading: boolean;
    children?: ReactNode;
    showPlatformSelector?: boolean;
}

export default function TrendingSection({
    title,
    selectedPlatform,
    onPlatformChange,
    isLoading,
    children,
    showPlatformSelector = true
}: TrendingSectionProps) {
    const platformOptions = [
        { value: 'Netflix', label: 'Netflix' },
        { value: 'Hulu', label: 'Hulu' },
        { value: 'Amazon Prime Video', label: 'Amazon Prime Video' },
        { value: 'Disney+', label: 'Disney+' },
    ];

    return (
        <div className={styles.showsSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                
                {showPlatformSelector && (
                    <div className={styles.platformSelector}>
                        <Dropdown
                            options={platformOptions}
                            value={selectedPlatform}
                            onChange={onPlatformChange}
                            aria-label="Select streaming platform"
                        />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <Spinner size="medium" />
                </div>
            ) : (
                <div className={styles.cardsScrollX}>
                    {children}
                </div>
            )}
        </div>
    );
}