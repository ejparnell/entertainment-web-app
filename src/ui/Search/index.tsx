import React from 'react';
import Image from 'next/image';
import styles from './Search.module.css';

interface SearchProps {
    placeholder?: string;
    value: string;
    onChange: (newValue: string) => void;
    id?: string;
    'aria-label'?: string;
}

export default function Search({
    placeholder = 'Search for movies or TV series',
    value,
    onChange,
    id = 'search-input',
    'aria-label': ariaLabel = 'Search for movies or TV series',
}: SearchProps) {
    const SEARCH_ICON_SIZE = 32;

    return (
        <div className={styles.searchContainer} role='search'>
            <Image
                src='/assets/icon-search.svg'
                alt=''
                width={SEARCH_ICON_SIZE}
                height={SEARCH_ICON_SIZE}
                className={styles.searchIcon}
                priority
                aria-hidden='true'
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
                onChange={(e) => onChange(e.target.value)}
                aria-label={ariaLabel}
                autoComplete='off'
                spellCheck='false'
            />
        </div>
    );
}
