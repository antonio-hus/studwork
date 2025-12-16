/** @format */
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import {routing} from '@/lib/utils/i18n/routing'
import {isConfigured} from '@/lib/controller/admin/config-controller'
import {checkSessionForProxy} from '@/lib/controller/auth/session-controller'
import {UserRole} from '@/lib/domain/user'

/**
 * Initialize the next-intl middleware with the routing configuration.
 */
const handleI18n = createIntlMiddleware(routing)

/**
 * List of path prefixes that should bypass all proxy checks.
 */
const PUBLIC_PATHS = [
    '/_next',
    '/static',
    '/favicon.ico',
    '/images',
    '/api',
]

/**
 * Routes that do not require authentication.
 * Note: We check against the localized path (e.g. /en/login).
 */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/verify-email']

/**
 * Helper to strip locale from pathname for logic checks
 * e.g., /en/dashboard -> /dashboard
 */
function getPathWithoutLocale(pathname: string): string {
    const segments = pathname.split('/')
    if (routing.locales.includes(segments[1] as any)) {
        return '/' + segments.slice(2).join('/')
    }
    return pathname
}

/**
 * The Central Proxy Function.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
    const {pathname} = request.nextUrl

    // Asset Bypass
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Setup Guard
    const configState = await isConfigured()
    const isPlatformConfigured = configState.success && configState.data
    const isSetupPage = pathname.includes('/setup')

    if (!isPlatformConfigured) {
        if (!isSetupPage) {
            return NextResponse.redirect(new URL('/setup', request.url))
        }

        // Allow access to setup if not configured
        return handleI18n(request)
    } else if (isSetupPage) {

        // Block access to setup if already configured
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Authentication & Authorization Guard
    const pathWithoutLocale = getPathWithoutLocale(pathname)

    // Check if the user is authenticated (using the uncached controller method)
    const user = await checkSessionForProxy()
    const isAuthenticated = !!user

    // Protect Dashboard/Protected Routes
    // If the path starts with /dashboard or other protected segments
    if (pathWithoutLocale.startsWith('/dashboard') || pathWithoutLocale.startsWith('/admin')) {
        if (!isAuthenticated) {
            // Redirect to login, preserving the return URL
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Redirect authenticated users away from Auth Pages
    // If user is logged in, they shouldn't see /login or /register
    if (isAuthenticated && AUTH_ROUTES.some(route => pathWithoutLocale.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Internationalization
    return handleI18n(request)
}

/**
 * Next.js Middleware Configuration.
 */
export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
