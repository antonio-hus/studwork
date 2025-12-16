/** @format */
'use client'

import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import * as Label from '@radix-ui/react-label'
import {signIn} from '@/lib/controller/auth/auth-controller'
import {AlertCircle, Loader2, Mail, Lock, LogIn} from 'lucide-react'

/**
 * Login Form Component.
 *
 * Handles user credentials submission using strict styling
 * and Radix UI primitives for accessibility.
 */
export function LoginForm() {
    const t = useTranslations('pages.auth.login')
    const router = useRouter()

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await signIn(formData)

            if (!result.success) {
                setError(result.error)
                setLoading(false)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError(t('errors.unexpected'))
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
                <div
                    className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5"/>
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
                        {t('email')}
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

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label.Root
                            htmlFor="password"
                            className="text-sm font-medium leading-none text-foreground"
                        >
                            {t('password')}
                        </Label.Root>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
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
                        {t('signingIn')}
                    </>
                ) : (
                    <>
                        {t('signIn')} <LogIn className="ml-2 h-4 w-4"/>
                    </>
                )}
            </button>
        </form>
    )
}
