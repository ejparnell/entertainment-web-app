'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

interface NavbarProps {
    id?: string;
    'aria-label'?: string;
}

const NAV_LINKS = [
    { href: '/', icon: '/assets/icon-nav-home.svg', alt: 'Home' },
    { href: '/movies', icon: '/assets/icon-nav-movies.svg', alt: 'Movies' },
    { href: '/shows', icon: '/assets/icon-nav-tv-series.svg', alt: 'TV Series' },
    { href: '/bookmarks', icon: '/assets/icon-nav-bookmark.svg', alt: 'Bookmarks' },
];

export default function Navbar({
    id = 'main-navigation',
    'aria-label': ariaLabel = 'Main Navigation',
}: NavbarProps) {
    const pathname = usePathname();

    return (
        <nav className={styles.navbar} id={id} aria-label={ariaLabel}>
            <div className={styles.navTop}>
                <Link href="/">
                    <Image
                        src='/assets/logo.svg'
                        alt='App Logo'
                        width={32}
                        height={25}
                        priority
                    />
                </Link>

                <div className={styles.navLinks}>
                    {NAV_LINKS.map(({ href, icon, alt }) => {
                        const isActive = pathname === href;

                        return (
                            <Link key={href} href={href} className={isActive ? styles.active : ''}>
                                <Image src={icon} alt={alt} width={20} height={20} />
                            </Link>
                        );
                    })}
                </div>
            </div>

            <Link href="/profile" className={styles.userAvatar}>
                <Image
                    src='/assets/icon-user.png'
                    alt='User Avatar'
                    width={32}
                    height={32}
                    priority
                />
            </Link>
        </nav>
    );
}