import { headers } from 'next/headers'

/**
 * Retrieves the client's IP address from the request headers.
 *
 * It checks multiple headers in order of reliability to account for proxies,
 * load balancers, and CDN environments (like Cloudflare).
 *
 * @returns {Promise<string>} The client's IP address or 'unknown' if not found.
 */
export async function getClientIp(): Promise<string> {
    const headersList = await headers()

    // Retrieve headers that commonly store the client's real IP
    const forwarded = headersList.get('x-forwarded-for')
    const real = headersList.get('x-real-ip')

    // Cloudflare specific
    const cfConnecting = headersList.get('cf-connecting-ip')

    if (forwarded) {
        // x-forwarded-for can contain a list of IPs (e.g., client, proxy1, proxy2)
        // The first IP in the list is the original client IP.
        return forwarded.split(',')[0].trim()
    }

    if (real) {
        return real
    }

    if (cfConnecting) {
        return cfConnecting
    }

    return 'unknown'
}
