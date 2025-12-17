/** @format */
"use client"

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {resendVerificationEmailAuthenticated} from '@/lib/controller/auth/auth-controller'
import {signOut} from '@/lib/controller/auth/auth-controller'
import {Button} from "@/components/ui/button"
import {AlertCircle, CheckCircle2, Loader2, LogOut, Send, Timer} from 'lucide-react'

/**
 * Verify Email Pending Form Component.
 *
 * Allows users to resend the verification email or sign out.
 * Includes a cooldown timer to prevent spamming and visual feedback states.
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
                <div
                    className={`rounded-lg border p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 text-sm ${message.type === 'success'
                        ? 'bg-success/10 border-success/20 text-success'
                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5"/>
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5"/>
                    )}
                    <span className="font-medium leading-relaxed">{message.text}</span>
                </div>
            )}

            {/* Resend Button */}
            <div className="space-y-3">
                <Button
                    onClick={handleResend}
                    disabled={loading || countdown > 0 || signingOut}
                    className="w-full h-11 text-base shadow-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            {t('sending')}
                        </>
                    ) : countdown > 0 ? (
                        <>
                            <Timer className="mr-2 h-4 w-4 animate-pulse"/>
                            {t('resendIn')} {countdown}s
                        </>
                    ) : (
                        <>
                            {t('resendButton')} <Send className="ml-2 h-4 w-4"/>
                        </>
                    )}
                </Button>

                {countdown > 0 && (
                    <p className="text-[11px] text-center text-muted-foreground animate-pulse font-medium">
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
                <Button
                    variant="outline"
                    onClick={handleSignOut}
                    disabled={signingOut || loading}
                    className="w-full h-11 text-sm font-medium"
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
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                    {t('signOutHelp')}
                </p>
            </div>
        </div>
    )
}
