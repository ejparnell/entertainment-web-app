'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/ui/Input';
import Button from '@/ui/Button';
import styles from '../../AuthPage.module.css';

interface LoginFormProps {
    onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        setSubmitted(true);

        try {
            await login(email, password);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.authForm}>
                <p className={styles.authTitle}>Login</p>

                <form onSubmit={handleSubmit} className={styles.authFormFields}>
                    <Input
                        id="login-email"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={setEmail}
                        showError={submitted && !email.trim()}
                        errorMessage="Can't be empty"
                        aria-label="Email address"
                    />

                    <Input
                        id="login-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={setPassword}
                        showError={submitted && !password.trim()}
                        errorMessage="Can't be empty"
                        aria-label="Password"
                    />

                    {error && (
                        <p className={styles.authError}>{error}</p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login to your account'}
                    </Button>
                </form>

                <div className={styles.authToggle}>
                    <p className={styles.authToggleText}>
                        Don&apos;t have an account?{' '}
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className={styles.authLink}
                        >
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}