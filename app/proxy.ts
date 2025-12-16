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
 * Routes that do not require authentication AND should redirect
 * authenticated users away (e.g., Login, Register).
 */
const GUEST_ONLY_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
]

/**
 * Helper to strip locale from pathname for logic checks
 * e.g., /en/dashboard -> /dashboard
 */
function getPathWithoutLocale(pathname: string): string {
    const segments = pathname.split('/')
    if (segments.length > 1 && routing.locales.includes(segments[1] as any)) {
        const cleanPath = '/' + segments.slice(2).join('/')
        return cleanPath === '//' ? '/' : cleanPath
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
    if (pathWithoutLocale.startsWith('/dashboard') || pathWithoutLocale.startsWith('/admin') || pathWithoutLocale.startsWith('/verify-email-pending')) {

        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }

        // Role-Based Access Control (RBAC) - Admin Check
        if (pathWithoutLocale.startsWith('/admin') && user?.role !== UserRole.ADMINISTRATOR) {
            const accessDeniedUrl = new URL('/access-denied', request.url)
            accessDeniedUrl.searchParams.set('required', UserRole.ADMINISTRATOR)
            return NextResponse.redirect(accessDeniedUrl)
        }

        // CEmail Verification Enforcement
        const isVerificationPendingPage = pathWithoutLocale.startsWith('/verify-email-pending')
        const isVerifyingEmail = pathWithoutLocale.startsWith('/verify-email')

        // If user is NOT verified
        if (!user.emailVerified) {
            if (!isVerificationPendingPage && !isVerifyingEmail) {
                return NextResponse.redirect(new URL('/verify-email-pending', request.url))
            }
        }

        // If user IS verified (according to cookie)
        else {
            // If they try to access the pending page, send them to dashboard
            if (isVerificationPendingPage) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    }

    // Redirect Authenticated Users away from Guest-Only Pages
    if (isAuthenticated && GUEST_ONLY_ROUTES.some(route => pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/'))) {
        const target = user.emailVerified ? '/dashboard' : '/verify-email-pending'
        return NextResponse.redirect(new URL(target, request.url))
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
