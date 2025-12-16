/** @format */
import {defineRouting} from 'next-intl/routing'
import {createNavigation} from 'next-intl/navigation'

/**
 * Global Internationalization (i18n) Routing Configuration.
 *
 * Defines the core routing strategy for the application, including supported languages
 * and the fallback locale. This object is used by both the middleware (proxy)
 * to handle redirects/rewrites and the navigation APIs to generate localized links.
 */
export const routing = defineRouting({
    /**
     * A list of all locales that are supported by the application.
     * Currently supports English ('en').
     */
    locales: ['en'],

    /**
     * The default locale used when:
     * 1. The user visits the root path (/) and no preference is detected.
     * 2. An unsupported locale is requested.
     */
    defaultLocale: 'en',
})

/**
 * Type-safe Navigation Utilities.
 *
 * Lightweight wrappers around Next.js' native navigation APIs (`Link`, `useRouter`, etc.).
 * These automatically handle locale prefixes (e.g., prepending `/en`) based on
 * the current active locale, ensuring all internal navigation remains localized.
 *
 * @exports Link - Configured Link component for internal navigation.
 * @exports redirect - Function to trigger server-side redirects with locale support.
 * @exports usePathname - Hook to get the current pathname without the locale prefix.
 * @exports useRouter - Hook to access the router with locale-aware methods.
 * @exports getPathname - Helper to generate localized pathnames.
 */
export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing)

/**
 * Supported Locale Type.
 *
 * Represents the union of all valid language codes defined in the routing configuration.
 * Use this type to enforce strict typing for locale parameters across the application
 * (e.g., in page props, API handlers, or email services).
 *
 * Derived automatically from `routing.locales`.
 */
export type Locale = (typeof routing.locales)[number]
