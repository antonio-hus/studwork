/** @format */
"use client"

import React, {useState} from "react"
import {useRouter} from "next/navigation"
import {useTranslations} from 'next-intl'
import * as Label from '@radix-ui/react-label'
import {signUp} from "@/lib/controller/auth/auth-controller"
import {AlertCircle, Loader2, ArrowRight, User, Mail, Lock, Building2} from "lucide-react"

/**
 * Register Form Component
 * Uses Radix Primitives where applicable and raw HTML styled with your Tailwind design tokens.
 */
export function RegisterForm() {
    const t = useTranslations('pages.auth.register')
    const router = useRouter()

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        try {
            const result = await signUp(formData)

            if (!result.success) {
                setError(result.error)
                setLoading(false)
            } else {
                router.push("/verify-email-pending")
                router.refresh()
            }
        } catch (err) {
            setError(t('errors.unexpected'))
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error State */}
            {error && (
                <div
                    className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5"/>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                    >
                        {t('fullName')} <span className="text-destructive">*</span>
                    </Label.Root>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder={t('fullNamePlaceholder')}
                            className="flex h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="email"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        {t('email')} <span className="text-destructive">*</span>
                    </Label.Root>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="student@university.edu"
                            className="flex h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        />
                    </div>
                </div>

                {/* Role Select (Native styled to match theme) */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="role"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        {t('role')} <span className="text-destructive">*</span>
                    </Label.Root>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10"/>
                        <select
                            id="role"
                            name="role"
                            required
                            className="flex h-11 w-full appearance-none rounded-xl border border-border bg-muted/50 pl-10 pr-8 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        >
                            <option value="" disabled selected>{t('roleSelect')}</option>
                            <option value="STUDENT">{t('roleStudent')}</option>
                            <option value="COORDINATOR">{t('roleCoordinator')}</option>
                            <option value="ORGANIZATION">{t('roleOrganization')}</option>
                        </select>
                        {/* Custom Chevron */}
                        <div className="absolute right-3 top-3.5 h-4 w-4 opacity-50 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="h-4 w-4">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label.Root
                        htmlFor="password"
                        className="text-sm font-medium leading-none text-foreground"
                    >
                        {t('password')} <span className="text-destructive">*</span>
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
                        {t('creatingAccount')}
                    </>
                ) : (
                    <>
                        {t('createAccount')} <ArrowRight className="ml-2 h-4 w-4"/>
                    </>
                )}
            </button>
        </form>
    )
}
