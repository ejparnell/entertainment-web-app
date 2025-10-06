'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/ui/Input';
import Button from '@/ui/Button';
import styles from '../../AuthPage.module.css';

interface RegisterFormProps {
    onToggleMode: () => void;
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
    const { register } = useAuth();
    const [name, setName] = useState('');
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
            await register(name, email, password);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.authForm}>
                <p className={styles.authTitle}>
                    Sign Up
                </p>

                <form onSubmit={handleSubmit} className={styles.authFormFields}>
                    <Input
                        id="register-name"
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={setName}
                        showError={submitted && !name.trim()}
                        errorMessage="Name is required"
                        aria-label="Full name"
                    />

                    <Input
                        id="register-email"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={setEmail}
                        showError={submitted && !email.trim()}
                        errorMessage="Email is required"
                        aria-label="Email address"
                    />

                    <Input
                        id="register-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={setPassword}
                        showError={submitted && password.length > 0 && password.length < 6}
                        errorMessage="Password must be at least 6 characters"
                        aria-label="Password"
                    />

                    {error && (
                        <p className={styles.authError}>
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create an account'}
                    </Button>
                </form>

                <div className={styles.authToggle}>
                    <p className={styles.authToggleText}>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className={styles.authLink}
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}