/** @format */
'use client'

import React, {useState} from 'react'
import {useTranslations} from 'next-intl'
import * as Label from '@radix-ui/react-label'
import {requestPasswordReset} from '@/lib/controller/auth/auth-controller'
import {AlertCircle, CheckCircle2, Loader2, Mail, Send} from 'lucide-react'

/**
 * Forgot Password Form Component.
 *
 * Handles the password reset request submission with validation feedback,
 * utilizing the system's design tokens and accessibility primitives.
 */
export function ForgotPasswordForm() {
    const t = useTranslations('pages.auth.forgotPassword')

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await requestPasswordReset(formData)

            if (!result.success) {
                setError(result.error)
            } else {
                setMessage(result.data?.message || t('success'))
            }
        } catch (err) {
            setError(t('errors.unexpected'))
        } finally {
            setLoading(false)
        }
    }

    if (message) {
        return (
            <div
                className="flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-300">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center text-success">
                    <CheckCircle2 className="h-6 w-6"/>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{t('checkEmailTitle')}</h3>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
                <div
                    className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0"/>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="email"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        {t('emailLabel')}
                    </Label.Root>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="user@example.com"
                            className="flex h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center w-full whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 shadow-md hover:shadow-lg"
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
            </button>
        </form>
    )
}
