/** @format */
"use client"

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {resendVerificationEmailAuthenticated} from '@/lib/controller/auth/auth-controller'
import {signOut} from '@/lib/controller/auth/auth-controller'

import {AlertCircle, CheckCircle2, Loader2, LogOut, Send, Timer} from 'lucide-react'

/**
 * Verify Email Pending Form Component.
 *
 * Provides actions to resend the verification email (with cooldown)
 * or sign out if the user wants to switch accounts.
 */
export function VerifyEmailPendingForm() {
    const t = useTranslations('pages.auth.verifyEmailPending')
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [signingOut, setSigningOut] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [countdown, setCountdown] = useState(120)

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

    async function handleResend() {
        setLoading(true)
        setMessage(null)

        try {
            // Using the authenticated version since user is logged in (session exists)
            const result = await resendVerificationEmailAuthenticated()

            if (!result.success) {
                setMessage({type: 'error', text: result.error})
            } else {
                setMessage({type: 'success', text: result.data?.message || t('emailSent')})
                // Reset countdown to 120 seconds on successful send
                setCountdown(120)
            }
        } catch (error) {
            setMessage({type: 'error', text: t('errors.unexpected')})
        } finally {
            setLoading(false)
        }
    }

    async function handleSignOut() {
        setSigningOut(true)
        await signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="space-y-4">
            {/* Feedback Message */}
            {message && (
                <div className={`rounded-xl border p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 ${
                    message.type === 'success'
                        ? 'bg-success/10 border-success/20 text-success'
                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0"/>
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0"/>
                    )}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            {/* Resend Button */}
            <div className="space-y-2">
                <button
                    onClick={handleResend}
                    disabled={loading || countdown > 0 || signingOut}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary h-11 px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            {t('sending')}
                        </>
                    ) : countdown > 0 ? (
                        <>
                            <Timer className="mr-2 h-4 w-4"/>
                            {t('resendIn')} {countdown}s
                        </>
                    ) : (
                        <>
                            {t('resendButton')} <Send className="ml-2 h-4 w-4"/>
                        </>
                    )}
                </button>

                {countdown > 0 && (
                    <p className="text-[11px] text-center text-muted-foreground animate-pulse">
                        {t('waitMessage')}
                    </p>
                )}
            </div>

            {/* Divider */}
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"/>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-medium">
                        {t('or')}
                    </span>
                </div>
            </div>

            {/* Sign Out Section */}
            <div className="space-y-3">
                <button
                    onClick={handleSignOut}
                    disabled={signingOut || loading}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-input bg-background h-11 px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                    {signingOut ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            {t('signingOut')}
                        </>
                    ) : (
                        <>
                            {t('signOut')} <LogOut className="ml-2 h-4 w-4"/>
                        </>
                    )}
                </button>
                <p className="text-[11px] text-center text-muted-foreground">
                    {t('signOutHelp')}
                </p>
            </div>
        </div>
    )
}
