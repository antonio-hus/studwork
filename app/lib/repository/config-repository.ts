/** @format */

import {database} from '@/lib/database'
import {encrypt, decrypt} from '@/lib/utils/crypto'
import {Config, ConfigCreateType, ConfigUpdateType} from '@/lib/domain/config'

/**
 * Repository for managing Platform Configuration.
 *
 * Handles direct database interactions for the singleton configuration record.
 * Responsible for security concerns such as encryption/decryption of sensitive credentials.
 * Includes optional in-memory caching for improved read performance.
 */
export class ConfigRepository {
    /** Singleton instance */
    private static _instance: ConfigRepository

    /** In-memory cache for the global configuration */
    private cache: Config | null = null

    /** Private constructor to prevent direct instantiation */
    private constructor() {
    }

    /** Accessor for the singleton instance */
    static get instance(): ConfigRepository {
        if (!ConfigRepository._instance) {
            ConfigRepository._instance = new ConfigRepository()
        }
        return ConfigRepository._instance
    }

    /**
     * Retrieves the global configuration singleton.
     *
     * Automatically handles the decryption of the SMTP password. If decryption fails
     * (e.g., due to a changed encryption key), the password field is returned as `null`
     * to prevent application crashes.
     *
     * @param useCache - Whether to return a cached version if available (default: true)
     * @returns {Promise<Config | null>} The configuration object or null if not initialized.
     */
    async getGlobalConfig(useCache = true): Promise<Config | null> {
        if (useCache && this.cache) return this.cache

        const config = await database.config.findUnique({
            where: {id: 'global_config'},
        })

        if (!config) return null

        if (config.smtpPassword) {
            try {
                config.smtpPassword = decrypt(config.smtpPassword)
            } catch (error) {
                console.error(
                    '[ConfigRepository] Failed to decrypt SMTP password. Returning null for safety.',
                    error
                )
                config.smtpPassword = ''
            }
        }

        this.cache = config
        return config
    }

    /**
     * Creates the global configuration record.
     *
     * Handles secure encryption of the SMTP password before saving.
     *
     * @param data - The Prisma create input object.
     * @returns {Promise<Config>} The newly created configuration record.
     */
    async createConfig(data: ConfigCreateType): Promise<Config> {
        const payload = {...data}

        if (payload.smtpPassword) {
            payload.smtpPassword = encrypt(payload.smtpPassword)
        }

        const createdConfig = await database.config.create({
            data: payload,
        })

        this.cache = createdConfig
        return createdConfig
    }

    /**
     * Updates the global configuration record.
     *
     * Handles secure encryption of the SMTP password before updating.
     *
     * @param data - The Prisma update input object.
     * @returns {Promise<Config>} The updated configuration record.
     */
    async updateConfig(data: ConfigUpdateType): Promise<Config> {
        const payload = {...data}

        if (payload.smtpPassword) {
            payload.smtpPassword = encrypt(payload.smtpPassword as string)
        }

        const updatedConfig = await database.config.update({
            where: {id: 'global_config'},
            data: payload,
        })

        this.cache = updatedConfig
        return updatedConfig
    }

    /**
     * Checks if the platform has been initialized.
     *
     * @returns {Promise<boolean>} True if configuration exists, False otherwise.
     */
    async isConfigured(): Promise<boolean> {
        const count = await database.config.count({
            where: {id: 'global_config'},
        })
        return count > 0
    }

    /**
     * Clears the in-memory cache.
     *
     * Useful after a manual update outside this repository instance.
     */
    clearCache() {
        this.cache = null
    }
}
