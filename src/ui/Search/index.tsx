import React, { useState } from 'react';
import Image from 'next/image';
import { fetchOMDBData, OMDBMovie } from '@/services/omdbService';
import styles from './Search.module.css';

interface SearchProps {
    placeholder?: string;
    id?: string;
    'aria-label'?: string;
    onSearchResult?: (result: OMDBMovie | null, query: string) => void;
    onSearchClear?: () => void;
}

export default function Search({
    placeholder = 'Search for movies or TV series',
    id = 'search-input',
    'aria-label': ariaLabel = 'Search for movies or TV series',
    onSearchResult,
    onSearchClear,
}: SearchProps) {
    const [value, setValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const SEARCH_ICON_SIZE = 32;

    async function handleSearch() {
        if (!value.trim()) return;

        setIsSearching(true);
        try {
            const result = await fetchOMDBData(value.trim());
            onSearchResult?.(result, value);
        } catch (error) {
            console.error('Search error:', error);
            onSearchResult?.(null, value);
        } finally {
            setIsSearching(false);
        }
    }

    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    }

    function handleIconClick() {
        handleSearch();
    }

    return (
        <div className={styles.searchContainer} role='search'>
            <Image
                src='/assets/icon-search.svg'
                alt='Search'
                width={SEARCH_ICON_SIZE}
                height={SEARCH_ICON_SIZE}
                className={styles.searchIcon}
                priority
                onClick={handleIconClick}
                style={{ cursor: isSearching ? 'not-allowed' : 'pointer' }}
                title='Click to search'
            />
            <label htmlFor={id} className={styles.visuallyHidden}>
                {ariaLabel}
            </label>
            <input
                id={id}
                type='search'
                className={styles.searchInput}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setValue(newValue);

                    if (newValue === '' && onSearchClear) {
                        onSearchClear();
                    }
                }}
                onKeyDown={handleKeyDown}
                aria-label={ariaLabel}
                autoComplete='off'
                spellCheck='false'
                disabled={isSearching}
            />
            {isSearching && (
                <div className={styles.searchingIndicator}>
                    Searching...
                </div>
            )}
        </div>
    );
}
