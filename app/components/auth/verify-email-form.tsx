/** @format */
"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {useTranslations} from 'next-intl'
import {verifyEmail} from "@/lib/controller/auth/auth-controller"
import {Button} from "@/components/ui/button"
import {CheckCircle2, Loader2, XCircle, ArrowRight} from "lucide-react"

/**
 * Verify Email Form Component.
 *
 * Automatically verifies the email token upon mounting.
 * Provides rich visual feedback for Loading, Success (with auto-redirect), and Error states.
 */
export function VerifyEmailForm({token}: { token?: string }) {
    const t = useTranslations('pages.auth.verifyEmail')
    const router = useRouter()

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        async function verify() {
            // Missing Token Check
            if (!token) {
                setStatus('error')
                setMessage(t('noToken'))
                return
            }

            // Attempt Verification
            try {
                const result = await verifyEmail(token)

                if (result.success) {
                    setStatus('success')
                    setMessage(t('success'))

                    // Redirect to dashboard after 3 seconds
                    timeoutId = setTimeout(() => {
                        router.push('/dashboard')
                        router.refresh()
                    }, 3000)
                } else {
                    setStatus('error')
                    setMessage(result.error || t('failed'))
                }
            } catch (error) {
                setStatus('error')
                setMessage(t('failed'))
            }
        }

        verify()

        // Cleanup timeout on unmount
        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [token, router, t])

    // Loading
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-8 animate-in fade-in duration-300">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"/>
                    <Loader2 className="relative h-12 w-12 animate-spin text-primary"/>
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {t('verifying')}
                </p>
            </div>
        )
    }

    // Success
    if (status === 'success') {
        return (
            <div
                className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-300 py-4">
                <div
                    className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center ring-1 ring-success/20 mb-2">
                    <CheckCircle2 className="h-10 w-10 text-success"/>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {t('verifiedTitle')}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="w-full pt-4 space-y-3">
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                        <div className="h-full bg-primary w-full origin-left animate-[progress_3s_ease-in-out]"/>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {t('redirecting')}
                    </p>
                </div>
            </div>
        )
    }

    // Error
    return (
        <div
            className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-300 py-4">
            <div
                className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center ring-1 ring-destructive/20 mb-2">
                <XCircle className="h-10 w-10 text-destructive"/>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {t('failedTitle')}
                </h3>
                <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                    {message}
                </p>
            </div>

            <div className="pt-4 w-full space-y-4">
                <Button asChild className="w-full h-11 text-base shadow-sm">
                    <Link href="/login">
                        {t('backToLogin')} <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>

                <p className="text-xs text-muted-foreground">
                    {t('resendPrompt')}{" "}
                    <Link href="/resend-verification"
                          className="text-primary hover:text-primary/80 font-medium hover:underline underline-offset-4 transition-colors">
                        {t('resendLink')}
                    </Link>
                </p>
            </div>
        </div>
    )
}
