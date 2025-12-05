/** @format */

import {ConfigService} from '@/lib/service/config-service'
import {ConfigCreateType, ConfigUpdateType} from '@/lib/domain/config'

/**
 * Controller for Platform Configuration.
 *
 * Acts as the server action layer, connecting frontend calls to the ConfigService singleton.
 */
class ConfigController {
    /** Service singleton */
    private service = ConfigService.instance

    /** Retrieves the global configuration */
    async getConfig() {
        try {
            const config = await this.service.getConfig()
            return {success: true, data: config}
        } catch (error: any) {
            console.error('[ConfigController] getConfig error:', error)
            return {success: false, error: 'Failed to fetch configuration'}
        }
    }

    /** Creates the global configuration */
    async createConfig(input: ConfigCreateType) {
        try {
            const config = await this.service.createConfig(input)
            return {success: true, data: config}
        } catch (error: any) {
            console.error('[ConfigController] createConfig error:', error)
            return {success: false, error: 'Failed to create configuration'}
        }
    }

    /** Updates the global configuration */
    async updateConfig(input: ConfigUpdateType) {
        try {
            const config = await this.service.updateConfig(input)
            return {success: true, data: config}
        } catch (error: any) {
            console.error('[ConfigController] updateConfig error:', error)
            return {success: false, error: 'Failed to update configuration'}
        }
    }

    /** Checks if the platform has been configured */
    async isConfigured() {
        try {
            const configured = await this.service.isConfigured()
            return {success: true, data: configured}
        } catch (error: any) {
            console.error('[ConfigController] isConfigured error:', error)
            return {success: false, error: 'Failed to check configuration status'}
        }
    }

    /** Clears the in-memory configuration cache */
    async clearCache() {
        this.service.clearCache()
        return {success: true, message: 'Configuration cache cleared'}
    }
}

/** Export a singleton instance */
export const configController = new ConfigController()
