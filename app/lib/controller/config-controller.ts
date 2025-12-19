/** @format */
'use server'

import {ConfigService} from '@/lib/service/config-service'
import {Config, ConfigCreateType, ConfigUpdateType} from '@/lib/domain/config'
import {ActionResponse} from "@/lib/domain/actions"
import {getTranslations} from 'next-intl/server'
import {createLogger} from '@/lib/utils/logger'

// Initialize Logger
const logger = createLogger('ConfigController')

/**
 * Retrieves the global configuration.
 *
 * @returns {Promise<ActionResponse<Config | null>>} The configuration object or null.
 */
export async function getConfig(): Promise<ActionResponse<Config | null>> {
    const t = await getTranslations('errors.config')

    try {
        const config = await ConfigService.instance.getConfig()
        return {success: true, data: config}
    } catch (error) {
        logger.error('Failed to fetch configuration', error as Error)
        return {success: false, error: t('fetchFailed')}
    }
}

/**
 * Creates the global configuration.
 * Used primarily during the initial platform setup.
 *
 * @param {ConfigCreateType} input - Configuration data to create.
 * @returns {Promise<ActionResponse<Config>>} The created configuration.
 */
export async function createConfig(input: ConfigCreateType): Promise<ActionResponse<Config>> {
    const t = await getTranslations('errors.config')

    try {
        const config = await ConfigService.instance.createConfig(input)
        logger.info('Platform configuration created successfully')
        return {success: true, data: config}
    } catch (error) {
        logger.error('Failed to create configuration', error as Error)
        return {success: false, error: t('createFailed')}
    }
}

/**
 * Updates the global configuration.
 *
 * @param {ConfigUpdateType} input - Configuration fields to update.
 * @returns {Promise<ActionResponse<Config>>} The updated configuration.
 */
export async function updateConfig(input: ConfigUpdateType): Promise<ActionResponse<Config>> {
    const t = await getTranslations('errors.config')

    try {
        const config = await ConfigService.instance.updateConfig(input)
        ConfigService.instance.clearCache()

        logger.info('Platform configuration updated')
        return {success: true, data: config}
    } catch (error) {
        logger.error('Failed to update configuration', error as Error)
        return {success: false, error: t('updateFailed')}
    }
}

/**
 * Checks if the platform has been configured.
 * Used by middleware to determine if setup redirection is needed.
 *
 * @returns {Promise<ActionResponse<boolean>>} True if configured, false otherwise.
 */
export async function isConfigured(): Promise<ActionResponse<boolean>> {
    const t = await getTranslations('errors.config')

    try {
        const configured = await ConfigService.instance.isConfigured()
        return {success: true, data: configured}
    } catch (error) {
        logger.error('Failed to check configuration status', error as Error)
        return {success: false, error: t('checkStatusFailed')}
    }
}

/**
 * Clears the in-memory configuration cache.
 * Useful for forcing a refresh if configuration drifts or for debugging.
 *
 * @returns {Promise<ActionResponse<string>>} Success message.
 */
export async function clearCache(): Promise<ActionResponse<string>> {
    const t = await getTranslations('success.config')
    const tError = await getTranslations('errors.config')

    try {
        ConfigService.instance.clearCache()
        logger.debug('Configuration cache cleared manually')
        return {success: true, data: t('cacheCleared')}
    } catch (error) {
        logger.error('Failed to clear cache', error as Error)
        return {success: false, error: tError('clearCacheFailed')}
    }
}
