/** @format */
import {getTranslations} from 'next-intl/server';
import {VerifyEmailForm} from "@/components/auth/verify-email-form";
import {BadgeCheck} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";

/**
 * Verify Email Page Component.
 *
 * Renders the email verification interface.
 * Extracts the token from the URL and processes the verification request within a clean, centered layout.
 */
export default async function VerifyEmailPage({searchParams,}: {
    searchParams: Promise<{ token?: string }>
}) {
    const t = await getTranslations('pages.auth.verifyEmail');
    const params = await searchParams;
    const token = params.token;

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-muted/30 px-4 py-10">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                <Card className="shadow-xl border-border overflow-hidden">
                    <CardHeader className="flex flex-col items-center space-y-4 pt-10 pb-2 text-center">
                        <div
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-2">
                            <BadgeCheck className="h-7 w-7 text-primary"/>
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

                    <CardContent className="p-8 pb-10">
                        <VerifyEmailForm token={token}/>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
