'use client';

import { ReactNode } from 'react';
import Search from '@/ui/Search';
import { OMDBMovie } from '@/services/omdbService';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
    pageTitle: string;
    onSearchResult: (result: OMDBMovie | null, query: string) => void;
    onSearchClear: () => void;
    children: ReactNode;
}

export default function PageLayout({
    pageTitle,
    onSearchResult,
    onSearchClear,
    children
}: PageLayoutProps) {
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            
            <Search 
                placeholder='Search for movies or TV series'
                id='main-search'
                aria-label='Search for movies or TV series'
                onSearchResult={onSearchResult}
                onSearchClear={onSearchClear}
            />

            {children}
        </div>
    );
}