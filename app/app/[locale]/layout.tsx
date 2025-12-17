/** @format */
import "../globals.css";
import React from "react";
import type {Metadata} from "next";
import {routing} from "@/lib/utils/i18n/routing";
import {notFound} from "next/navigation";
import {Geist, Geist_Mono} from "next/font/google";
import {getConfig} from "@/lib/controller/config-controller";
import {defaultThemeColors, ThemeColors, ThemeModeColors} from "@/lib/domain/config";
import {NextIntlClientProvider} from "next-intl";
import {getMessages} from "next-intl/server";

/**
 * Geist Sans font configuration
 */
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

/**
 * Geist Mono font configuration
 */
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * Generates dynamic metadata for the application.
 * Fetches the app name from the database configuration.
 *
 * @returns {Promise<Metadata>} Metadata object with title and description
 */
export async function generateMetadata(): Promise<Metadata> {
    const response = await getConfig();
    const appName = response.success && response.data ? response.data.name : 'University Platform';

    return {
        title: appName,
        description: 'Practical work opportunities platform',
    }
}

/**
 * Converts theme color objects into CSS custom property declarations.
 * Generates all necessary CSS variables with the --color- prefix for Tailwind integration.
 *
 * @param {ThemeModeColors} colors - Theme colors for a specific mode (light or dark)
 * @returns {string} CSS variable declarations as a formatted string
 */
function generateCssVars(colors: ThemeModeColors): string {
    return `
        --color-primary: ${colors.primary};
        --color-primary-hover: ${colors.primaryHover};
        --color-primary-light: ${colors.primaryLight};
        --color-primary-dark: ${colors.primaryDark};
        --color-primary-foreground: ${colors.primaryForeground};
        
        --color-secondary: ${colors.secondary};
        --color-secondary-hover: ${colors.secondaryHover};
        --color-secondary-light: ${colors.secondaryLight};
        --color-secondary-dark: ${colors.secondaryDark};
        --color-secondary-foreground: ${colors.secondaryForeground};
        
        --color-accent: ${colors.accent};
        --color-accent-hover: ${colors.accentHover};
        --color-accent-light: ${colors.accentLight};
        --color-accent-dark: ${colors.accentDark};
        --color-accent-foreground: ${colors.accentForeground};
        
        --color-success: ${colors.success};
        --color-success-light: ${colors.successLight};
        --color-success-foreground: ${colors.successForeground};
        
        --color-error: ${colors.error};
        --color-error-light: ${colors.errorLight};
        --color-error-foreground: ${colors.errorForeground};
        
        --color-warning: ${colors.warning};
        --color-warning-light: ${colors.warningLight};
        --color-warning-foreground: ${colors.warningForeground};
        
        --color-info: ${colors.info};
        --color-info-light: ${colors.infoLight};
        --color-info-foreground: ${colors.infoForeground};
        
        --color-background: ${colors.background};
        --color-foreground: ${colors.foreground};
        --color-surface: ${colors.surface};
        --color-surface-elevated: ${colors.surfaceElevated};
        
        --color-text-primary: ${colors.textPrimary};
        --color-text-secondary: ${colors.textSecondary};
        --color-text-tertiary: ${colors.textTertiary};
        --color-text-disabled: ${colors.textDisabled};
        
        --color-border: ${colors.border};
        --color-input: ${colors.input};
        --color-ring: ${colors.ring};
        
        --color-muted: ${colors.muted};
        --color-muted-foreground: ${colors.mutedForeground};
    `;
}

/**
 * Root Layout Component
 *
 * This is the main layout wrapper for the entire Next.js application.
 * It handles:
 * - Internationalization (i18n) locale validation
 * - Dynamic theme color injection from database configuration
 * - Font loading and application
 * - Global CSS variable setup for light and dark modes
 *
 * The layout injects CSS custom properties that are consumed by Tailwind CSS
 * utilities throughout the application, enabling dynamic theming.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Promise<{locale: string}>} props.params - Next.js route parameters containing locale
 * @returns {Promise<JSX.Element>} The complete HTML document structure
 * ```
 */
export default async function RootLayout({children, params}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    // Await and extract the locale from route parameters
    const {locale} = await params;

    // Validate that the requested locale is supported
    // Returns 404 if locale is not in the allowed list
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Load internationalization messages for the current locale
    const messages = await getMessages();

    // Fetch platform configuration from database
    const configResponse = await getConfig();
    const config = configResponse.success ? configResponse.data : null;

    // Extract theme colors, falling back to defaults if config is unavailable
    const themeColors = (config?.themeColors ?? defaultThemeColors) as ThemeColors;

    // Generate CSS variable declarations for both light and dark modes
    const lightVars = generateCssVars(themeColors.light);
    const darkVars = generateCssVars(themeColors.dark);

    return (
        <html lang={locale}>
        <head>
            {/* Inject dynamic CSS custom properties for theming */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    /* Light mode color scheme (default) */
                    :root {
                        ${lightVars}
                    }
                    
                    /* Dark mode color scheme (respects system preference) */
                    @media (prefers-color-scheme: dark) {
                        :root {
                            ${darkVars}
                        }
                    }
                    
                    /* Dark mode color scheme (explicit class) */
                    .dark {
                        ${darkVars}
                    }
                `
            }}/>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
