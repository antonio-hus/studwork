/** @format */
import "../globals.css";
import React from "react";
import type {Metadata} from "next";
import {routing} from "@/lib/utils/i18n/routing";
import {notFound} from "next/navigation";
import {Geist, Geist_Mono} from "next/font/google";
import {getConfig} from "@/lib/controller/config-controller";
import {defaultThemeColors, ThemeColors} from "@/lib/domain/config";
import {NextIntlClientProvider} from "next-intl";
import {getMessages} from "next-intl/server";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
    const response = await getConfig();
    const appName = response.success && response.data ? response.data.name : 'University Platform';

    return {
        title: appName,
        description: 'Practical work opportunities platform',
    }
}

/**
 * Recursively converts a nested theme color object into CSS variables.
 *
 * @param themeColors - An object representing theme colors for a single mode
 * @param prefix - Prefix to prepend to variable names (used for nesting)
 * @returns A string of CSS variable declarations
 */
function themeColorsToCssVars(themeColors: Record<string, any>, prefix = ""): string {
    return Object.entries(themeColors)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return typeof value === "object"
                ? themeColorsToCssVars(value, `${prefix}${cssKey}-`)
                : `--${prefix}${cssKey}: ${value};`;
        })
        .join("\n    ");
}

/**
 * Root layout component for the entire Next.js application.
 *
 * Responsibilities:
 * - Applies global fonts using Geist Google fonts.
 * - Injects CSS variables for both light and dark themes, automatically respecting
 *   the user's preferred color scheme.
 * - Falls back to `defaultThemeColors` if no configuration is found in the database.
 *
 * @param children - The React nodes to render inside the layout
 * @param params - Internationalization params
 * @returns The fully themed HTML structure with CSS variables injected
 */
export default async function RootLayout({children, params}: Readonly<{ children: React.ReactNode, params: Promise<{ locale: string }>; }>) {
    // Await the params to get the locale
    const { locale } = await params;

    // Security Check: Validate locale matches your routing config
    // If someone visits /de/dashboard but 'de' isn't supported, 404 immediately.
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Fetch messages for the current locale
    const messages = await getMessages();

    // Await the platform configurations
    const configResponse = await getConfig();

    // Extract data safely based on the success flag
    const config = configResponse.success ? configResponse.data : null;

    // Fallback to default colors if config is missing or request failed
    const themeColors = (config?.themeColors ?? defaultThemeColors) as ThemeColors;

    // Generate CSS variable strings for both light and dark mode
    const lightCssVars = themeColorsToCssVars(themeColors.light);
    const darkCssVars = themeColorsToCssVars(themeColors.dark);

    return (
        <html lang={locale}>
        <head>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                            :root {
                                ${lightCssVars}
                            }
                            
                            @media (prefers-color-scheme: dark) {
                                :root {
                                    ${darkCssVars}
                                }
                            }
                            
                            .dark {
                                ${darkCssVars}
                            }
                        `,
                }}
            />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
