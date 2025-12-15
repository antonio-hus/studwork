/** @format */
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import {routing} from '@/lib/utils/i18n/routing'
import {isConfigured} from '@/lib/controller/config-controller'

/**
 * Initialize the next-intl middleware with the routing configuration.
 * This handles locale prefixing, language negotiation, and redirects.
 */
const handleI18n = createIntlMiddleware(routing)

/**
 * List of path prefixes that should bypass all proxy checks.
 * Includes Next.js internals, static assets, and the API routes (which handle their own auth).
 */
const PUBLIC_PATHS = [
    '/_next',
    '/static',
    '/favicon.ico',
    '/images',
    '/api',
]

/**
 * The Central Proxy Function (Replaces Middleware in Next.js 16+).
 *
 * Acting as the application's primary gatekeeper, this function intercepts
 * every incoming request to the server (running on the Node.js runtime).
 *
 * **Responsibilities:**
 * 1. **Asset Bypass:** Skips processing for static files and Next.js internals.
 * 2. **Setup Guard:** Checks if the platform has been initialized by querying the configuration controller.
 *    - If **NOT configured**: Forces a redirect to `/setup` (unless already there).
 *    - If **configured**: Blocks access to `/setup` and redirects to login (security measure).
 * 3. **Internationalization:** Hands off valid requests to `next-intl` to handle locale routing (e.g., `/en/dashboard`).
 *
 * **Performance Note:**
 * This function calls `isConfigured()` which may trigger a database call. Ensure the
 * controller or service layer implements caching (e.g., Singleton pattern) to prevent
 * excessive database load on every request.
 *
 * @async
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} The response to be sent to the client (redirect, next, or rewrite).
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
    const {pathname} = request.nextUrl

    // Skip public assets to avoid unnecessary processing
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Check Platform Configuration Status
    // We call the controller directly (Server Action logic) since we are in the Node environment.
    const configState = await isConfigured()

    // Default to false if the check fails (fail-safe), otherwise use the returned data
    const isPlatformConfigured = configState.success && configState.data

    // Enforce Setup Redirection Rules
    const isSetupPage = pathname.includes('/setup')

    // Platform is not Configured -> Mandate Setup
    // Redirects any traffic trying to access the main app to the setup wizard.
    if (!isPlatformConfigured) {
        if (!isSetupPage) {
            return NextResponse.redirect(new URL('/setup', request.url))
        }
    }

        // Platform is Configured -> Secure Setup
    // Prevents re-accessing the setup wizard once the platform is live.
    else if (isPlatformConfigured && isSetupPage) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Delegate to Internationalization Middleware
    // Handles locale detection and URL rewriting (e.g. /about -> /en/about)
    return handleI18n(request)
}

/**
 * Next.js Middleware/Proxy Configuration.
 *
 * Defines which paths invoke the proxy function.
 * We exclude internal Next.js paths, Vercel internals, and files with extensions (likely assets).
 */
export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
