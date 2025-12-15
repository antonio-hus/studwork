/** @format */
'use server'

import {ConfigService} from '@/lib/service/config-service'
import {Config, ConfigCreateType, ConfigUpdateType} from '@/lib/domain/config'
import {ActionResponse} from "@/lib/domain/actions";

/**
 * Access the existing singleton instance from your service layer.
 */
const service = ConfigService.instance

/**
 * Retrieves the global configuration.
 */
export async function getConfig(): Promise<ActionResponse<Config | null>> {
    try {
        const config = await service.getConfig()
        return {success: true, data: config}
    } catch (error) {
        console.error('[ConfigController] getConfig error:', error)
        return {success: false, error: 'Failed to fetch configuration'}
    }
}

/**
 * Creates the global configuration.
 */
export async function createConfig(input: ConfigCreateType): Promise<ActionResponse<Config>> {
    try {
        const config = await service.createConfig(input)
        return {success: true, data: config}
    } catch (error) {
        console.error('[ConfigController] createConfig error:', error)
        return {success: false, error: 'Failed to create configuration'}
    }
}

/**
 * Updates the global configuration.
 */
export async function updateConfig(input: ConfigUpdateType): Promise<ActionResponse<Config>> {
    try {
        const config = await service.updateConfig(input)
        return {success: true, data: config}
    } catch (error) {
        console.error('[ConfigController] updateConfig error:', error)
        return {success: false, error: 'Failed to update configuration'}
    }
}

/**
 * Checks if the platform has been configured.
 */
export async function isConfigured(): Promise<ActionResponse<boolean>> {
    try {
        const configured = await service.isConfigured()
        return {success: true, data: configured}
    } catch (error) {
        console.error('[ConfigController] isConfigured error:', error)
        return {success: false, error: 'Failed to check configuration status'}
    }
}

/**
 * Clears the in-memory configuration cache.
 */
export async function clearCache(): Promise<ActionResponse<string>> {
    try {
        service.clearCache()
        return {success: true, data: 'Configuration cache cleared'}
    } catch (error) {
        console.error('[ConfigController] clearCache error:', error)
        return {success: false, error: 'Failed to clear cache'}
    }
}
