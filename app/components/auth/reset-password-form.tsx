/** @format */
"use client"

import React, {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {useTranslations} from 'next-intl'
import {resetPassword, verifyResetToken} from "@/lib/controller/auth/auth-controller"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {AlertCircle, ArrowRight, Loader2, Lock, XCircle} from 'lucide-react'

/**
 * Reset Password Form Component.
 *
 * Verifies the reset token on mount and allows the user to set a new password.
 * Handles token validation, form submission, and password mismatch errors.
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
                router.push("/login?reset=success")
                router.refresh()
            }
        } catch (err) {
            setError(t('errors.unexpected'))
            setLoading(false)
        }
    }

    // State 1: Loading (Verifying Token)
    if (tokenStatus === 'checking') {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-300">
                <Loader2 className="h-10 w-10 animate-spin text-primary/80"/>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {t('verifyingToken')}
                </p>
            </div>
        )
    }

    // State 2: Error (Invalid Token)
    if (tokenStatus === 'invalid') {
        return (
            <div
                className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in-95 duration-300 py-4">
                <div
                    className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center ring-1 ring-destructive/20 mb-2">
                    <XCircle className="h-10 w-10 text-destructive"/>
                </div>
                <div className="space-y-2 max-w-[280px]">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        {t('tokenErrorTitle')}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {error}
                    </p>
                </div>
                <Button asChild className="mt-4 shadow-sm" size="lg">
                    <Link href="/forgot-password">
                        {t('requestNew')}
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </div>
        )
    }

    // State 3: Success (Valid Token -> Show Form)
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Feedback */}
            {error && (
                <div
                    className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive flex items-start gap-3 animate-in slide-in-from-top-1 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5"/>
                    <span className="font-medium leading-relaxed">{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">
                        {t('newPassword')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
                            className="pl-10 h-11"
                            disabled={loading}
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-1">
                        {t('passwordHint')}
                    </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                        {t('confirmPassword')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
                            className="pl-10 h-11"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base shadow-sm"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        {t('resetting')}
                    </>
                ) : (
                    t('resetPassword')
                )}
            </Button>
        </form>
    )
}
