/** @format */
'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {signIn} from '@/lib/controller/auth/auth-controller';
import {AlertCircle, Loader2, Mail, Lock, LogIn} from 'lucide-react';

/**
 * Login Form Component.
 *
 * Handles user credentials submission with validation and loading states.
 * Integrated with the standard design system for a cohesive look.
 */
export function LoginForm() {
    const t = useTranslations('pages.auth.login');
    const router = useRouter();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await signIn(formData);

            if (!result.success) {
                setError(result.error);
                setLoading(false);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError(t('errors.unexpected'));
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
                <div
                    className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive flex items-start gap-3 animate-in slide-in-from-top-1 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5"/>
                    <span className="font-medium leading-relaxed">{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email">
                        {t('email')}
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="user@example.com"
                            className="pl-10 h-11"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">
                            {t('password')}
                        </Label>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="pl-10 h-11"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base shadow-sm"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        {t('signingIn')}
                    </>
                ) : (
                    <>
                        {t('signIn')} <LogIn className="ml-2 h-4 w-4"/>
                    </>
                )}
            </Button>
        </form>
    );
}
