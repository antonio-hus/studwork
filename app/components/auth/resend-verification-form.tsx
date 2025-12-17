/** @format */
"use client"
import React, {useState, useEffect} from "react"
import {useTranslations} from 'next-intl'
import {resendVerificationEmail} from '@/lib/controller/auth/auth-controller'
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {AlertCircle, CheckCircle2, Loader2, Mail, Send, Timer} from 'lucide-react'

/**
 * Resend Verification Form Component.
 *
 * Handles requests for new verification emails with spam protection (cooldown timer)
 * and clear user feedback.
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
                    className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive flex items-start gap-3 animate-in slide-in-from-top-1 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5"/>
                    <span className="font-medium leading-relaxed">{error}</span>
                </div>
            )}

            {/* Success Feedback */}
            {success && (
                <div
                    className="rounded-lg border border-success/40 bg-success/10 p-3 text-success flex items-start gap-3 animate-in slide-in-from-top-1 text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5"/>
                    <div className="space-y-1">
                        <p className="font-medium leading-none">{success}</p>
                        <p className="opacity-90 leading-relaxed text-xs">{t('checkInbox')}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email">
                        {t('emailLabel')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            disabled={loading || countdown > 0}
                            placeholder={t('emailPlaceholder')}
                            className="pl-10 h-11"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-3">
                <Button
                    type="submit"
                    disabled={loading || countdown > 0}
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
                            {t('resendIn', {seconds: countdown})}
                        </>
                    ) : (
                        <>
                            {t('sendButton')} <Send className="ml-2 h-4 w-4"/>
                        </>
                    )}
                </Button>

                {countdown > 0 && (
                    <p className="text-[11px] text-center text-muted-foreground animate-pulse font-medium">
                        {t('waitMessage')}
                    </p>
                )}
            </div>
        </form>
    )
}
