'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/ui/Spinner';

export default function Home() {
    const router = useRouter();
    const { user, logout, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading) {
        return <Spinner fullscreen />;
    }

    if (!user) {
        return <Spinner fullscreen />;
    }

    return (
        <>
            <h1>Welcome to the Home Page</h1>
            <p>You are logged in as {user.name}</p>
            <button onClick={logout}>Logout</button>
        </>
    );
}
