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
 */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/verify-email', '/reset-password']

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
        return handleI18n(request)
    } else if (isSetupPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Authentication & Authorization Guard
    const pathWithoutLocale = getPathWithoutLocale(pathname)
    const user = await checkSessionForProxy()
    const isAuthenticated = !!user

    // Protect Dashboard/Protected Routes
    if (pathWithoutLocale.startsWith('/dashboard') || pathWithoutLocale.startsWith('/admin')) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }

        // Role-Based Access Control (RBAC)
        // Prevent non-admins from accessing /admin routes
        if (pathWithoutLocale.startsWith('/admin') && user?.role !== UserRole.ADMINISTRATOR) {
            const accessDeniedUrl = new URL('/access-denied', request.url)
            accessDeniedUrl.searchParams.set('required', UserRole.ADMINISTRATOR)
            return NextResponse.redirect(accessDeniedUrl)
        }

        // Prevent pending verification users from accessing main dashboard (except verification page)
        if (!user.emailVerified && !pathWithoutLocale.startsWith('/verify-email-pending')) {
            return NextResponse.redirect(new URL('/verify-email-pending', request.url))
        }

        // Prevent verified users from going back to pending page
        if (user.emailVerified && pathWithoutLocale.startsWith('/verify-email-pending')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Redirect Authenticated Users away from Auth Pages
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
