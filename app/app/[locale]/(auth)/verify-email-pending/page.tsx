/** @format */
import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {verifySession} from '@/lib/controller/auth/session-controller';
import {Mail} from 'lucide-react';
import {VerifyEmailPendingForm} from "@/components/auth/verify-email-pending-form";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";

/**
 * Verify Email Pending Page Component.
 *
 * Displays a notice to registered users who need to verify their email address.
 * Includes instructions and options to resend the verification link.
 * Redirects verified users to the dashboard.
 */
export default async function VerifyEmailPendingPage() {
    const t = await getTranslations('pages.auth.verifyEmailPending');

    // Verify authentication using session controller
    const user = await verifySession();

    // Must be logged in to see this pending state
    if (!user) {
        redirect('/login');
    }

    // If already verified, redirect to dashboard
    if (user.emailVerified) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-muted/30 px-4 py-10">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                <Card className="shadow-xl border-border overflow-hidden">

                    <CardHeader
                        className="flex flex-col items-center space-y-4 pt-10 pb-2 text-center bg-muted/5 border-b border-border/50">
                        <div
                            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 mb-2">
                            <Mail className="h-8 w-8 text-primary"/>
                        </div>
                        <div className="space-y-2 w-full">
                            <CardTitle className="text-2xl font-bold tracking-tight">
                                {t('title')}
                            </CardTitle>
                            <CardDescription className="text-sm max-w-xs mx-auto text-muted-foreground">
                                {t('subtitle')} <span
                                className="font-medium text-foreground block mt-1">{user.email}</span>
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        <div className="rounded-xl border border-border bg-muted/50 p-4">
                            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                {t('nextSteps')}
                            </h2>
                            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside marker:text-primary marker:font-medium">
                                <li className="pl-1"><span className="pl-1">{t('step1')}</span></li>
                                <li className="pl-1"><span className="pl-1">{t('step2')}</span></li>
                                <li className="pl-1"><span className="pl-1">{t('step3')}</span></li>
                            </ol>
                        </div>

                        {/* Interactive Form Area */}
                        <div className="space-y-4 pt-2">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    {t('didNotReceive')}
                                </p>
                            </div>
                            <VerifyEmailPendingForm/>
                        </div>
                    </CardContent>

                </Card>

            </div>
        </div>
    );
}
