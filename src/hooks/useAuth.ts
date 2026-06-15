import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth-client';

interface User {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    isRegistrationComplete: boolean;
    onboardingStep: number;
    [key: string]: any;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('Auth error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    return { user, loading, isAuthenticated: !!user };
}
