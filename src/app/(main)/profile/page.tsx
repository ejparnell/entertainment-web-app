'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOMDBData, OMDBMovie } from '@/services/omdbService';
import Input from '@/ui/Input';
import Button from '@/ui/Button';
import Spinner from '@/ui/Spinner';
import PageLayout from '@/components/PageLayout';
import { renderCards } from '@/utils/cardRenderer';
import styles from './ProfilePage.module.css';

interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout, loading, tokens, isBookmarked, toggleBookmark } = useAuth();
    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const [searchResult, setSearchResult] = useState<OMDBMovie | null>(null);

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

    async function handlePasswordChange() {
        setShowErrors(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!passwordData.currentPassword.trim()) {
            setPasswordError('Current password is required');
            return;
        }

        if (!passwordData.newPassword.trim()) {
            setPasswordError('New password is required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            setPasswordError('New password must be different from current password');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens?.accessToken}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to change password');
            }

            setPasswordSuccess('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowErrors(false);
            setTimeout(() => {
                setPasswordSuccess(null);
            }, 3000);

        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleLogout() {
        try {
            await logout();
            router.push('/auth');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    function handlePasswordInputChange(field: keyof PasswordChangeData, value: string) {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (passwordError) {
            setPasswordError(null);
        }
        if (passwordSuccess) {
            setPasswordSuccess(null);
        }
    }

    function handleSearchResult(result: OMDBMovie | null, query: string) {
        setSearchResult(result);
    }

    function handleSearchClear() {
        setSearchResult(null);
    }

    async function handleBookmarkToggle(identifier: string) {
        try {
            await toggleBookmark(identifier);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const searchResultItem = searchResult ? [{
        mlData: {
            title: searchResult.Title,
            platform: '',
            type: searchResult.Type === 'movie' ? 'Movie' : 'TV Series',
            similarity_score: 0,
            genres: '',
            release_year: searchResult.Year ? parseInt(searchResult.Year) : undefined,
            rating: searchResult.Rated
        },
        omdbData: searchResult
    }] : [];

    return (
        <PageLayout
            pageTitle="Profile Settings"
            onSearchResult={handleSearchResult}
            onSearchClear={handleSearchClear}
        >
            {/* Show search result if available */}
            {searchResult && (
                <div className={styles.profileSection}>
                    <h2 className={styles.sectionTitle}>Search Result</h2>
                    <div className={styles.cardsScrollY}>
                        {renderCards({
                            items: searchResultItem,
                            keyPrefix: 'search',
                            isBookmarked,
                            onToggleBookmark: handleBookmarkToggle
                        })}
                    </div>
                </div>
            )}

            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Account Information</h2>
                
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>Name</label>
                        <p className={styles.infoValue}>{user.name}</p>
                    </div>
                    
                    <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>Email</label>
                        <p className={styles.infoValue}>{user.email}</p>
                    </div>
                    
                    <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>Role</label>
                        <p className={styles.infoValue}>{user.role}</p>
                    </div>
                    
                    <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>Email Verified</label>
                        <p className={styles.infoValue}>
                            {user.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                        </p>
                    </div>
                    
                    <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>Member Since</label>
                        <p className={styles.infoValue}>{formatDate(user.createdAt)}</p>
                    </div>
                    
                    <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>Bookmarks</label>
                        <p className={styles.infoValue}>{user.bookmarkedMovies?.length || 0} items</p>
                    </div>
                </div>
            </div>

            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Change Password</h2>
                
                <div className={styles.passwordForm}>
                    <Input
                        type="password"
                        placeholder="Current password"
                        value={passwordData.currentPassword}
                        onChange={(value) => handlePasswordInputChange('currentPassword', value)}
                        id="current-password"
                        label="Current Password"
                        required
                        showError={showErrors}
                        errorMessage="Current password is required"
                        disabled={isChangingPassword}
                    />
                    
                    <Input
                        type="password"
                        placeholder="New password"
                        value={passwordData.newPassword}
                        onChange={(value) => handlePasswordInputChange('newPassword', value)}
                        id="new-password"
                        label="New Password"
                        required
                        showError={showErrors}
                        errorMessage="New password must be at least 6 characters"
                        disabled={isChangingPassword}
                    />
                    
                    <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(value) => handlePasswordInputChange('confirmPassword', value)}
                        id="confirm-password"
                        label="Confirm New Password"
                        required
                        showError={showErrors}
                        errorMessage="Please confirm your new password"
                        disabled={isChangingPassword}
                    />
                    
                    <Button
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                        className="primary"
                        aria-label="Change password"
                    >
                        {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </div>

                {passwordSuccess && (
                    <p className={styles.successMessage}>{passwordSuccess}</p>
                )}
                {passwordError && (
                    <p className={styles.errorMessage}>{passwordError}</p>
                )}
            </div>

            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Account Actions</h2>
                
                <div className={styles.actionsGrid}>
                    <Button
                        onClick={handleLogout}
                        className="secondary"
                        aria-label="Logout from account"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}