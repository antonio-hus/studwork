/** @format */
import {getTranslations} from 'next-intl/server'
import {VerifyEmailForm} from "@/components/auth/verify-email-form";

/**
 * Verify Email Page Component.
 *
 * Renders the layout for the email verification process, extracting
 * the verification token from search parameters to pass to the client component.
 */
export default async function VerifyEmailPage({
                                                  searchParams,
                                              }: {
    searchParams: Promise<{ token?: string }>
}) {
    const t = await getTranslations('pages.auth.verifyEmail')
    const params = await searchParams
    const token = params.token

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-background py-10 px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                {/* Main Card Container */}
                <div
                    className="rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="flex flex-col space-y-1.5 p-8 pb-6 text-center border-b border-border">
                        <h1 className="text-2xl font-bold leading-none tracking-tight text-foreground">
                            {t('title')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 pt-6 pb-8">
                        <VerifyEmailForm token={token}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
