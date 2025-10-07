'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Spinner from '@/ui/Spinner';
import styles from './AuthPage.module.css';

export default function AuthPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);

    const toggleAuthMode = () => {
        setIsLoginMode(!isLoginMode);
    };

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <Spinner size='large' />
            </div>
        );
    }

    if (user) {
        return (
            <div className={styles.loading}>
                <Spinner size='large' />
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <Image
                src="/assets/logo.svg"
                alt="App Logo"
                width={32}
                height={32}
                priority
            />
            {isLoginMode ? (
                <LoginForm onToggleMode={toggleAuthMode} />
            ) : (
                <RegisterForm onToggleMode={toggleAuthMode} />
            )}
        </div>
    );
}
