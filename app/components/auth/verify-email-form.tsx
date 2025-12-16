/** @format */
"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {useTranslations} from 'next-intl'
import {verifyEmail} from "@/lib/controller/auth/auth-controller"
import {CheckCircle2, Loader2, XCircle, ArrowRight} from "lucide-react"

/**
 * Verify Email Form Component.
 *
 * Handles the automatic verification of the email token upon mounting.
 * Displays Loading, Success, or Error states with appropriate UI feedback.
 */
export function VerifyEmailForm({token}: { token?: string }) {
    const t = useTranslations('pages.auth.verifyEmail')
    const router = useRouter()

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        async function verify() {
            // 1. Missing Token Check
            if (!token) {
                setStatus('error')
                setMessage(t('noToken'))
                return
            }

            // 2. Attempt Verification
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

    // Loading State
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-in fade-in duration-300">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"/>
                    <Loader2 className="relative h-12 w-12 animate-spin text-primary"/>
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {t('verifying')}
                </p>
            </div>
        )
    }

    // Success State
    if (status === 'success') {
        return (
            <div
                className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-300">
                <div
                    className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center ring-1 ring-success/20">
                    <CheckCircle2 className="h-10 w-10 text-success"/>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                        {t('verifiedTitle')}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        {message}
                    </p>
                </div>

                <div className="w-full pt-2">
                    <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
                        <div className="h-full bg-primary w-full origin-left animate-[progress_3s_ease-in-out]"/>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-medium">
                        {t('redirecting')}
                    </p>
                </div>
            </div>
        )
    }

    // Error State
    return (
        <div
            className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div
                className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center ring-1 ring-destructive/20">
                <XCircle className="h-10 w-10 text-destructive"/>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                    {t('failedTitle')}
                </h3>
                <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                    {message}
                </p>
            </div>

            <div className="pt-2 w-full">
                <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary h-11 px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    {t('backToLogin')} <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>

                <p className="mt-4 text-xs text-muted-foreground">
                    {t('resendPrompt')}{" "}
                    <Link href="/resend-verification" className="text-primary hover:underline underline-offset-4">
                        {t('resendLink')}
                    </Link>
                </p>
            </div>
        </div>
    )
}
