'use client';
import Card from '@/ui/Card';
import Dropdown from '@/ui/Dropdown';
import { useState } from 'react';

export default function TestPage() {
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedRating, setSelectedRating] = useState<string>('');

    const platformOptions = [
        { value: 'netflix', label: 'Netflix' },
        { value: 'hulu', label: 'Hulu' },
        { value: 'prime', label: 'Prime Video' },
        { value: 'disney', label: 'Disney+' },
    ];

    const categoryOptions = [
        { value: 'movie', label: 'Movies' },
        { value: 'tv', label: 'TV Series' },
        { value: 'documentary', label: 'Documentaries' },
    ];

    const ratingOptions = [
        { value: 'g', label: 'G - General Audiences' },
        { value: 'pg', label: 'PG - Parental Guidance' },
        { value: 'pg13', label: 'PG-13 - Parents Strongly Cautioned' },
        { value: 'r', label: 'R - Restricted' },
        { value: '18+', label: '18+ - Adults Only' },
    ];

    const testTVData = [
        {
            id: '1',
            title: 'The Witcher',
            year: '2019',
            category: 'TV Series',
            rating: '18+',
            isBookmarked: false,
            imageSrc: '/assets/icon-image.png',
        },
        {
            id: '2',
            title: 'Stranger Things',
            year: '2016',
            category: 'TV Series',
            rating: '16+',
            isBookmarked: true,
            imageSrc: '/assets/icon-image.png',
        },
        {
            id: '3',
            title: 'Breaking Bad',
            year: '2008',
            category: 'TV Series',
            rating: '18+',
            isBookmarked: false,
            imageSrc: '/assets/icon-image.png',
        }
    ]

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--white)' }}>Component Test Page</h1>
            
            {/* Dropdown Tests */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--white)' }}>Dropdown Components</h2>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--white)',
                            fontSize: 'var(--font-size-4)'
                        }}>
                            Platform:
                        </label>
                        <Dropdown
                            options={platformOptions}
                            value={selectedPlatform}
                            placeholder="Select a platform"
                            onChange={setSelectedPlatform}
                            aria-label="Select streaming platform"
                        />
                    </div>

                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--white)',
                            fontSize: 'var(--font-size-4)'
                        }}>
                            Category:
                        </label>
                        <Dropdown
                            options={categoryOptions}
                            value={selectedCategory}
                            placeholder="Select a category"
                            onChange={setSelectedCategory}
                            aria-label="Select content category"
                        />
                    </div>

                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'var(--white)',
                            fontSize: 'var(--font-size-4)'
                        }}>
                            Rating:
                        </label>
                        <Dropdown
                            options={ratingOptions}
                            value={selectedRating}
                            placeholder="Select a rating"
                            onChange={setSelectedRating}
                            aria-label="Select content rating"
                        />
                    </div>
                </div>

                {/* Selection Display */}
                <div style={{ 
                    padding: '1rem', 
                    background: 'var(--blue-900)', 
                    borderRadius: '6px',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--white)' }}>Selected Values:</h3>
                    <p style={{ color: 'var(--white)', margin: '0.25rem 0' }}>
                        Platform: {selectedPlatform || 'None selected'}
                    </p>
                    <p style={{ color: 'var(--white)', margin: '0.25rem 0' }}>
                        Category: {selectedCategory || 'None selected'}
                    </p>
                    <p style={{ color: 'var(--white)', margin: '0.25rem 0' }}>
                        Rating: {selectedRating || 'None selected'}
                    </p>
                </div>

                {/* Disabled Dropdown Test */}
                <div style={{ maxWidth: '250px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        color: 'var(--white)',
                        fontSize: 'var(--font-size-4)'
                    }}>
                        Disabled Dropdown:
                    </label>
                    <Dropdown
                        options={platformOptions}
                        placeholder="This is disabled"
                        disabled={true}
                        aria-label="Disabled dropdown example"
                    />
                </div>
            </div>

            {/* Card Tests */}
            <div>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--white)' }}>Card Components</h2>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '1rem' 
                }}>
                    {testTVData.map((show) => (
                        <Card
                            key={show.id}
                            imageSrc={show.imageSrc}
                            title={show.title}
                            year={show.year}
                            category={show.category as 'Movie' | 'TV Series'}
                            rating={show.rating}
                            isBookmarked={show.isBookmarked}
                            onToggleBookmark={() => {}}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}