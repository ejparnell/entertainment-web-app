'use client';
import Card from '@/ui/Card';
import { useState } from 'react';

export default function TestPage() {
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
        <div>
            {testTVData.map((show) => (
                <Card
                    key={show.id}
                    type='short'
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
    );
}