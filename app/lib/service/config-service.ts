/** @format */
import 'server-only'
import {ConfigRepository} from '@/lib/repository/config-repository'
import {Config, ConfigCreateType, ConfigUpdateType} from '@/lib/domain/config'
import {createLogger} from '@/lib/utils/logger'

/**
 * Service layer for Platform Configuration.
 *
 * Provides high-level business logic on top of the ConfigRepository singleton.
 * Responsible for validation, defaults, and orchestrating complex operations.
 */
export class ConfigService {
    /** Singleton instance */
    private static _instance: ConfigService
    private readonly logger = createLogger('ConfigService')

    /** Repository singleton */
    private repository = ConfigRepository.instance

    /** Private constructor to enforce singleton */
    private constructor() {
    }

    /** Accessor for the singleton instance */
    static get instance(): ConfigService {
        if (!ConfigService._instance) {
            ConfigService._instance = new ConfigService()
        }
        return ConfigService._instance
    }

    /**
     * Retrieves the global configuration.
     *
     * Uses caching internally via the repository. Decrypts sensitive fields automatically.
     *
     * @returns {Promise<Config | null>} The current global configuration or null if not initialized.
     */
    async getConfig(): Promise<Config | null> {
        return this.repository.getGlobalConfig()
    }

    /**
     * Creates the global configuration.
     *
     * @param {ConfigCreateType} input - Configuration create input
     * @returns {Promise<Config>} The newly created configuration record.
     */
    async createConfig(input: ConfigCreateType): Promise<Config> {
        try {
            const config = await this.repository.createConfig(input)
            this.logger.info('Global configuration created via service')
            return config
        } catch (error) {
            this.logger.error('Failed to create global configuration via service', error as Error)
            throw error
        }
    }

    /**
     * Updates the global configuration.
     *
     * Handles partial updates and validation.
     *
     * @param {ConfigUpdateType} input - Configuration update input
     * @returns {Promise<Config>} The updated configuration record.
     */
    async updateConfig(input: ConfigUpdateType): Promise<Config> {
        try {
            const config = await this.repository.updateConfig(input)
            this.logger.info('Global configuration updated via service')
            return config
        } catch (error) {
            this.logger.error('Failed to update global configuration via service', error as Error)
            throw error
        }
    }

    /**
     * Checks if the platform has been initialized.
     *
     * @returns {Promise<boolean>} True if configuration exists, false otherwise.
     */
    async isConfigured(): Promise<boolean> {
        return this.repository.isConfigured()
    }

    /**
     * Clears cached configuration in memory.
     */
    clearCache(): void {
        this.repository.clearCache()
        this.logger.debug('Configuration cache cleared via service')
    }
}
