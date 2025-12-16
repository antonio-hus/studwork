/** @format */
import {getTranslations} from 'next-intl/server'
import Link from 'next/link'
import {RegisterForm} from "@/components/auth/register-form";

/**
 * Register Page
 * Server Component that sets up the layout and fetches translations.
 */
export default async function RegisterPage() {
    const t = await getTranslations('pages.auth.register')

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-background py-10 px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                {/* Main Card Container */}
                <div
                    className="rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">

                    {/* Card Header */}
                    <div className="flex flex-col space-y-1.5 p-8 pb-6 text-center border-b border-border">
                        <h1 className="text-2xl font-bold leading-none tracking-tight text-foreground">
                            {t('title')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 pt-6">
                        <RegisterForm/>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-center p-6 bg-muted/20 border-t border-border">
                        <p className="text-sm text-muted-foreground text-center">
                            {t('hasAccount')}{" "}
                            <Link
                                href="/login"
                                className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline transition-colors"
                            >
                                {t('signIn')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
