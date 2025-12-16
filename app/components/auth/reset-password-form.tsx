/** @format */
"use client"

import React, {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {useTranslations} from 'next-intl'
import * as Label from '@radix-ui/react-label'
import {resetPassword, verifyResetToken} from "@/lib/controller/auth/auth-controller"
import {AlertCircle, ArrowRight, Loader2, Lock, XCircle} from 'lucide-react'

/**
 * Reset Password Form Component.
 *
 * Handles the logic for verifying the reset token and submitting the new password.
 * Includes token validation states (checking, valid, invalid).
 */
export function ResetPasswordForm({token}: { token?: string }) {
    const t = useTranslations('pages.auth.resetPassword')
    const router = useRouter()

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')

    // Verify token validity on mount
    useEffect(() => {
        async function checkToken() {
            if (!token) {
                setTokenStatus('invalid')
                setError(t('noToken'))
                return
            }

            try {
                const result = await verifyResetToken(token)

                if (result.success && result.data.valid) {
                    setTokenStatus('valid')
                } else {
                    setTokenStatus('invalid')
                    // Use error from result or fallback to generic
                    setError(result.success === false ? result.error : t('invalidToken'))
                }
            } catch (err) {
                setTokenStatus('invalid')
                setError(t('invalidToken'))
            }
        }

        checkToken()
    }, [token, t])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError("")
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        // Ensure token is attached
        formData.append("token", token!)

        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError(t('passwordMismatch'))
            setLoading(false)
            return
        }

        try {
            const result = await resetPassword(formData)

            if (!result.success) {
                setError(result.error)
                setLoading(false)
            } else {
                // Successful reset
                router.push("/login?reset=success")
                router.refresh()
            }
        } catch (err) {
            setError(t('errors.unexpected'))
            setLoading(false)
        }
    }

    // Loading State: Verifying Token
    if (tokenStatus === 'checking') {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p className="text-sm text-muted-foreground">{t('verifyingToken')}</p>
            </div>
        )
    }

    // Error State: Invalid Token
    if (tokenStatus === 'invalid') {
        return (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <XCircle className="h-8 w-8 text-destructive"/>
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">{t('tokenErrorTitle')}</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                    {t('requestNew')}
                    <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </div>
        )
    }

    // Success State: Valid Token -> Show Form
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

            <div className="space-y-4">
                {/* New Password Field */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="password"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        {t('newPassword')} <span className="text-destructive">*</span>
                    </Label.Root>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
                            className="flex h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-1">
                        {t('passwordHint')}
                    </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="confirmPassword"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        {t('confirmPassword')} <span className="text-destructive">*</span>
                    </Label.Root>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
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
                        {t('resetting')}
                    </>
                ) : (
                    t('resetPassword')
                )}
            </button>
        </form>
    )
}
