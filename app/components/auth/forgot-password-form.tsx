/** @format */
'use client';

import React, {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {requestPasswordReset} from '@/lib/controller/auth/auth-controller';
import {AlertCircle, CheckCircle2, Loader2, Mail, Send} from 'lucide-react';

/**
 * Forgot Password Form Component.
 *
 * Handles the submission of password reset requests.
 * Features validation feedback and a clear success state upon email dispatch.
 */
export function ForgotPasswordForm() {
    const t = useTranslations('pages.auth.forgotPassword');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await requestPasswordReset(formData);

            if (!result.success) {
                setError(result.error);
            } else {
                setMessage(result.data?.message || t('success'));
            }
        } catch (err) {
            setError(t('errors.unexpected'));
        } finally {
            setLoading(false);
        }
    }

    if (message) {
        return (
            <div
                className="flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in zoom-in-95 duration-300 py-4">
                <div
                    className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center text-success ring-1 ring-success/20 mb-2">
                    <CheckCircle2 className="h-8 w-8"/>
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        {t('checkEmailTitle')}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        );
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
                <div className="space-y-2">
                    <Label htmlFor="email">
                        {t('emailLabel')}
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
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base shadow-sm"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        {t('sending')}
                    </>
                ) : (
                    <>
                        {t('sendButton')} <Send className="ml-2 h-4 w-4"/>
                    </>
                )}
            </Button>
        </form>
    );
}
