'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { user, logout } = useAuth();

    if (!user) {
        router.push('/auth');
        return null;
    }

    return (
        <>
            <h1>Welcome to the Home Page</h1>
            <p>You are logged in as {user.name}</p>
            <button onClick={logout}>Logout</button>
        </>
    );
}
