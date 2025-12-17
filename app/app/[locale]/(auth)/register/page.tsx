/** @format */
import {getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {RegisterForm} from "@/components/auth/register-form";
import {UserPlus} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";

/**
 * Register Page Component.
 *
 * Renders the user registration interface.
 * Provides a centered card layout containing the registration form and a navigation link for existing users.
 */
export default async function RegisterPage() {
    const t = await getTranslations('pages.auth.register');

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-muted/30 px-4 py-10">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                <Card className="shadow-xl border-border overflow-hidden">
                    <CardHeader className="flex flex-col items-center space-y-4 pt-10 pb-2 text-center">
                        <div
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-2">
                            <UserPlus className="h-7 w-7 text-primary"/>
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
                        <RegisterForm/>
                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t border-border p-6 justify-center">
                        <p className="text-sm text-muted-foreground text-center">
                            {t('hasAccount')}{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4"
                            >
                                {t('signIn')}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}
