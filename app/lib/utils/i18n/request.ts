/** @format */
import {getRequestConfig} from 'next-intl/server'
import {routing} from './routing'

/**
 * Per-Request Internationalization Configuration.
 *
 * This function is invoked by `next-intl` on every request to determine the
 * active locale and load the corresponding translation messages.
 *
 * It acts as a bridge between the route parameters (e.g., `[locale]`) and
 * the translation files stored in the resources directory.
 *
 * @returns {Promise<Object>} The configuration object containing the validated locale and messages.
 */
export default getRequestConfig(async ({requestLocale}) => {
    // This corresponds to the [locale] dynamic segment in the URL
    let locale = await requestLocale

    // Validate the requested locale against the supported list.
    // If undefined or unsupported (e.g. manual URL manipulation), fallback to the default locale.
    // This prevents the application from crashing when trying to load non-existent message files.
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale
    }

    return {
        locale,
        /**
         * Load messages dynamically from the resources folder.
         * The path is relative to this file location.
         *
         * Structure assumed: root/resources/messages/{locale}.json
         */
        messages: (await import(`../../../resources/messages/${locale}.json`)).default,
    }
})
