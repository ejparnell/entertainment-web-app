'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';

interface User {
    _id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    isEmailVerified: boolean;
    bookmarkedMovies: string[];
    watchHistory: string[];
    preferences: {
        favoriteGenres: string[];
        maturityRating: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthContextType {
    user: User | null;
    tokens: AuthTokens | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokens: () => Promise<boolean>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    toggleBookmark: (movieId: string) => Promise<void>;
    isBookmarked: (movieId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            try {
                const parsedTokens = JSON.parse(storedTokens);
                setTokens(parsedTokens);
                fetchUserProfile(parsedTokens.accessToken);
            } catch (error) {
                console.error('Error parsing stored tokens:', error);
                localStorage.removeItem('authTokens');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (tokens) {
            localStorage.setItem('authTokens', JSON.stringify(tokens));
        } else {
            localStorage.removeItem('authTokens');
        }
    }, [tokens]);

    const makeAuthenticatedRequest = async (
        url: string,
        options: RequestInit = {}
    ) => {
        if (!tokens) {
            throw new Error('No authentication tokens available');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${tokens.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            const refreshed = await refreshTokens();
            if (refreshed && tokens) {
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${tokens.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        }

        return response;
    };

    const fetchUserProfile = async (accessToken: string) => {
        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        setTokens(data.tokens);
        setUser(data.user);
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data = await response.json();
        setTokens(data.tokens);
        setUser(data.user);
    };

    const logout = async () => {
        try {
            if (tokens) {
                await makeAuthenticatedRequest('/api/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({
                        refreshToken: tokens.refreshToken,
                    }),
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setTokens(null);
            setUser(null);
        }
    };

    const refreshTokens = async (): Promise<boolean> => {
        if (!tokens?.refreshToken) {
            return false;
        }

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: tokens.refreshToken,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTokens(data.tokens);
                return true;
            } else {
                setTokens(null);
                setUser(null);
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            setTokens(null);
            setUser(null);
            return false;
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        const response = await makeAuthenticatedRequest('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Profile update failed');
        }

        const responseData = await response.json();
        setUser(responseData.user);
    };

    const toggleBookmark = async (movieId: string) => {
        if (!user) return;

        const action = user.bookmarkedMovies.includes(movieId) ? 'remove' : 'add';

        const response = await makeAuthenticatedRequest('/api/user/bookmarks', {
            method: 'POST',
            body: JSON.stringify({ movieId, action }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Bookmark update failed');
        }

        const data = await response.json();
        setUser(prev => prev ? { ...prev, bookmarkedMovies: data.bookmarkedMovies } : null);
    };

    const isBookmarked = (movieId: string): boolean => {
        return user?.bookmarkedMovies.includes(movieId) || false;
    };

    const value: AuthContextType = {
        user,
        tokens,
        loading,
        login,
        register,
        logout,
        refreshTokens,
        updateProfile,
        toggleBookmark,
        isBookmarked,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};