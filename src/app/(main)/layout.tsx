import React from 'react';
import Navbar from '@/ui/Navbar';
import styles from './MainLayout.module.css';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout}>
            <Navbar id='main-navigation' aria-label='Main Navigation' />
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}
