/** @format */
import {getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {ResendVerificationForm} from "@/components/auth/resend-verification-form";
import {Mail, ArrowLeft} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";

/**
 * Resend Verification Page Component.
 *
 * Renders the interface for requesting a new verification email.
 * Uses a centered card layout with a mail icon to clearly indicate the page's purpose.
 */
export default async function ResendVerificationPage() {
    const t = await getTranslations('pages.auth.resendVerification');

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-muted/30 px-4 py-10">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                <Card className="shadow-xl border-border overflow-hidden">
                    <CardHeader className="flex flex-col items-center space-y-4 pt-10 pb-2 text-center">
                        <div
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-2">
                            <Mail className="h-7 w-7 text-primary"/>
                        </div>

                        <div className="space-y-2 w-full">
                            <CardTitle className="text-2xl font-bold tracking-tight">
                                {t('title')}
                            </CardTitle>
                            <CardDescription className="text-base max-w-[300px] mx-auto">
                                {t('subtitle')}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <ResendVerificationForm/>
                    </CardContent>

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
