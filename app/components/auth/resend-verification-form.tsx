/** @format */
"use client"
import React, {useState, useEffect} from "react"
import {useTranslations} from 'next-intl'
import * as Label from '@radix-ui/react-label'
import {resendVerificationEmail} from '@/lib/controller/auth/auth-controller'
import {AlertCircle, CheckCircle2, Loader2, Mail, Send, Timer} from 'lucide-react'

/**
 * Resend Verification Form Component.
 *
 * Handles the logic for requesting a new verification email, including
 * a cooldown timer to prevent spamming and proper UI feedback states.
 */
export function ResendVerificationForm() {
    const t = useTranslations('pages.auth.resendVerification')

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)

    // Countdown timer logic
    useEffect(() => {
        if (countdown <= 0) return

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [countdown])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await resendVerificationEmail(formData)

            if (!result.success) {
                setError(result.error)
            } else {
                setSuccess(result.data?.message || t('success'))
                setCountdown(60) // 60 seconds cooldown
            }
        } catch (err) {
            setError(t('errors.unexpected'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Feedback */}
            {error && (
                <div
                    className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0"/>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Success Feedback */}
            {success && (
                <div
                    className="rounded-xl border border-success/20 bg-success/10 p-4 text-success flex items-start gap-3 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0"/>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{success}</p>
                        <p className="text-xs opacity-90">{t('checkInbox')}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="email"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        {t('emailLabel')} <span className="text-destructive">*</span>
                    </Label.Root>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            disabled={loading || countdown > 0}
                            placeholder={t('emailPlaceholder')}
                            className="flex h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-3">
                <button
                    type="submit"
                    disabled={loading || countdown > 0}
                    className="inline-flex items-center justify-center w-full whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 shadow-md hover:shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            {t('sending')}
                        </>
                    ) : countdown > 0 ? (
                        <>
                            <Timer className="mr-2 h-4 w-4"/>
                            {t('resendIn', {seconds: countdown})}
                        </>
                    ) : (
                        <>
                            {t('sendButton')} <Send className="ml-2 h-4 w-4"/>
                        </>
                    )}
                </button>

                {countdown > 0 && (
                    <p className="text-[11px] text-center text-muted-foreground animate-pulse">
                        {t('waitMessage')}
                    </p>
                )}
            </div>
        </form>
    )
}
