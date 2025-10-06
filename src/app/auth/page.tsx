'use client';

import { useState } from 'react';
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

    if (loading) {
        return (
            <div className={styles.loading}>
                <Spinner size='large' />
            </div>
        );
    }

    if (user) {
        router.push('/');
        return null;
    }

    return (
        <div className={styles.authContainer}>
            <Image
                src="/assets/logo.svg"
                alt="App Logo"
                width={32}
                height={32}
                className={styles.logo}
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
