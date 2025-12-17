/** @format */
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {verifySession} from '@/lib/controller/auth/session-controller';
import {ShieldAlert, ArrowLeft, Home} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

/**
 * Props for the AccessDeniedPage component.
 */
interface AccessDeniedPageProps {
    searchParams: Promise<{
        /** Comma-separated list of role identifiers required for access. */
        required?: string;
    }>;
}

/**
 * Access Denied (403) Page Component.
 *
 * Displays a clear error message when an authenticated user attempts to access
 * a route they are not authorized for, providing context and navigation options.
 */
export default async function AccessDeniedPage({searchParams}: AccessDeniedPageProps) {
    const t = await getTranslations('pages.auth.accessControl');
    const params = await searchParams;

    const user = await verifySession();
    if (!user) {
        redirect('/login');
    }

    const requiredRoles = params.required ? params.required.split(',') : [];

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-muted/30 px-4 py-10">
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">

                {/* Standardized Card Border to match Login/Register pages */}
                <Card className="shadow-xl border-border overflow-hidden w-full">

                    {/* Subtle red indicator strip at the top only */}
                    <div className="bg-destructive/5 h-2 w-full"/>

                    <CardHeader className="flex flex-col items-center text-center pt-8 pb-2 px-6">
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                            <ShieldAlert className="h-8 w-8 text-destructive"/>
                        </div>
                        <div className="space-y-2 w-full">
                            <CardTitle className="text-2xl font-bold tracking-tight">
                                {t('accessDenied')}
                            </CardTitle>
                            <CardDescription className="text-base mt-2 break-words">
                                {t('noPermission')}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4 px-8 text-center">
                        <div
                            className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground break-words w-full">
                            <p className="mb-2 font-medium text-foreground">
                                {t('whyHapped')}
                            </p>
                            <p>
                                {t('roleRestrictionMessage', {
                                    role: user.role.toLowerCase()
                                })}
                            </p>

                            {requiredRoles.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <p className="text-xs uppercase tracking-wider font-semibold mb-2">
                                        {t('requiredRoles')}:
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {requiredRoles.map((role) => (
                                            <span
                                                key={role}
                                                className="inline-flex items-center rounded-md bg-background border border-border px-2.5 py-1 text-xs font-medium text-foreground shadow-sm whitespace-nowrap max-w-full truncate"
                                            >
                                                {role.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 p-6 bg-muted/30 border-t border-border">
                        <Button
                            variant="default"
                            className="w-full justify-center gap-2 truncate"
                            asChild
                        >
                            <Link href="/dashboard">
                                <ArrowLeft className="h-4 w-4 shrink-0"/>
                                <span className="truncate">{t('backToSafety')}</span>
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-center gap-2 truncate bg-background"
                            asChild
                        >
                            <Link href="/">
                                <Home className="h-4 w-4 shrink-0"/>
                                <span className="truncate">{t('goToHome')}</span>
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <div className="mt-6 text-center text-sm text-muted-foreground px-4 break-words max-w-full">
                    <p>
                        {t('switchAccountPrompt')}{' '}
                        <Link
                            href="/logout"
                            className="font-medium text-primary hover:underline underline-offset-4 transition-colors whitespace-nowrap"
                        >
                            {t('signOut')}
                        </Link>
                    </p>
                    <p className="mt-2 text-xs font-mono text-muted-foreground/60 break-all">
                        Error Code: 403_FORBIDDEN • ID: {user.id.slice(0, 8)}
                    </p>
                </div>

            </div>
        </div>
    );
}
