/** @format */
import {getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {ForgotPasswordForm} from "@/components/auth/forgot-password-form";
import {KeyRound, ArrowLeft} from 'lucide-react';
import {Card, CardHeader, CardContent, CardFooter} from '@/components/ui/card';

/**
 * Forgot Password Page Component.
 */
export default async function ForgotPasswordPage() {
    const t = await getTranslations('pages.auth.forgotPassword');

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-muted/30 px-4 py-10">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                <Card className="shadow-xl border-border overflow-hidden">

                    {/* Header Section */}
                    <CardHeader className="flex flex-col items-center space-y-4 pb-2 pt-10 text-center">
                        {/* Featured Icon */}
                        <div
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 transition-transform hover:rotate-6 mb-2 rotate-3">
                            <KeyRound className="h-7 w-7 text-primary"/>
                        </div>

                        <div className="space-y-2 w-full">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {t('title')}
                            </h1>
                            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                                {t('subtitle')}
                            </p>
                        </div>
                    </CardHeader>

                    {/* Form Content */}
                    <CardContent className="p-8">
                        <ForgotPasswordForm/>
                    </CardContent>

                    {/* Footer / Navigation */}
                    <CardFooter className="bg-muted/30 border-t border-border p-6 flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <div
                                className="rounded-full bg-background border border-border p-1 group-hover:border-foreground/30 transition-colors">
                                <ArrowLeft className="h-3 w-3"/>
                            </div>
                            {t('backToLogin')}
                        </Link>
                    </CardFooter>

                </Card>
            </div>
        </div>
    );
}
