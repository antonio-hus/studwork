/** @format */
"use client"

import React, {useState} from "react"
import {useRouter} from "next/navigation"
import {useTranslations} from 'next-intl'
import {signUp} from "@/lib/controller/auth/auth-controller"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {AlertCircle, Loader2, ArrowRight, User, Mail, Lock, Building2} from "lucide-react"

/**
 * Register Form Component.
 *
 * Handles new user registration with form validation and role selection.
 * Uses standardized UI components for a consistent experience.
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
                    className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive flex items-start gap-3 animate-in slide-in-from-top-1 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5"/>
                    <span className="font-medium leading-relaxed">{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">
                        {t('fullName')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder={t('fullNamePlaceholder')}
                            className="pl-10 h-11"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">
                        {t('email')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="student@university.edu"
                            className="pl-10 h-11"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Role Select */}
                <div className="space-y-2">
                    <Label htmlFor="role">
                        {t('role')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Building2
                            className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none"/>
                        <Select name="role" required disabled={loading}>
                            <SelectTrigger id="role" className="pl-10 h-11 w-full">
                                <SelectValue placeholder={t('roleSelect')}/>
                            </SelectTrigger>
                            <SelectContent className="bg-background border-background">
                                <SelectItem value="STUDENT">{t('roleStudent')}</SelectItem>
                                <SelectItem value="COORDINATOR">{t('roleCoordinator')}</SelectItem>
                                <SelectItem value="ORGANIZATION">{t('roleOrganization')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">
                        {t('password')} <span className="text-destructive">*</span>
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
                        {t('creatingAccount')}
                    </>
                ) : (
                    <>
                        {t('createAccount')} <ArrowRight className="ml-2 h-4 w-4"/>
                    </>
                )}
            </Button>
        </form>
    )
}
