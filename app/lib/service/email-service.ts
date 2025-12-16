/** @format */
import 'server-only'
import nodemailer, {Transporter} from 'nodemailer'
import {getTranslations} from 'next-intl/server'
import {ConfigService} from '@/lib/service/config-service'
import {Locale} from '@/lib/utils/i18n/routing'
import {getVerificationEmailTemplate} from '@/resources/emails/verification'
import {getWelcomeEmailTemplate} from '@/resources/emails/welcome'
import {getPasswordResetEmailTemplate} from '@/resources/emails/password-reset'
import {getAccountSuspendedTemplate} from '@/resources/emails/account-suspended'
import {getOrganizationRejectedTemplate} from '@/resources/emails/organization-rejected'
import {getOrganizationApprovedTemplate} from '@/resources/emails/organization-approved'
import {Config} from "@/lib/domain/config"

/**
 * Email Service
 * Handles sending transactional emails with templating and i18n support.
 */
export class EmailService {
    private static _instance: EmailService
    private transporter: Transporter | null = null
    private config: Config | null = null

    private constructor() {}

    static get instance(): EmailService {
        if (!EmailService._instance) {
            EmailService._instance = new EmailService()
        }
        return EmailService._instance
    }

    /**
     * Retrieves the cached configuration or fetches a fresh one.
     * Throws an error if configuration cannot be loaded.
     */
    private async getSafeConfig(): Promise<Config> {
        if (this.config) {
            return this.config
        }

        const config = await ConfigService.instance.getConfig()

        if (!config) {
            throw new Error('[EmailService] Global configuration not found')
        }

        this.config = config
        return config
    }

    /**
     * Gets or creates the email transporter instance.
     */
    private async getTransporter(): Promise<Transporter | null> {
        if (this.transporter) {
            return this.transporter
        }

        try {
            const config = await this.getSafeConfig()
            const isSecure = config.smtpPort === 465

            this.transporter = nodemailer.createTransport({
                host: config.smtpHost,
                port: config.smtpPort,
                secure: isSecure,
                auth: {
                    user: config.smtpUser,
                    pass: config.smtpPassword,
                },
                tls: {
                    ciphers: 'SSLv3',
                },
                family: 4,
                connectionTimeout: 10000,
                greetingTimeout: 10000,
            } as any)

            console.log(`[EmailService] SMTP initialized: Host=${config.smtpHost} Port=${config.smtpPort}`)
            return this.transporter
        } catch (error) {
            console.error('[EmailService] Failed to initialize transporter:', error)
            return null
        }
    }

    /**
     * Helper to get the "From" address from config.
     */
    private async getFromAddress(label: string): Promise<string> {
        const config = await this.getSafeConfig()
        const email = config.emailFrom || config.smtpUser || 'noreply@example.com'
        return `"${label}" <${email}>`
    }

    /**
     * Verifies SMTP transporter configuration.
     */
    async verifyConnection(): Promise<boolean> {
        try {
            const transporter = await this.getTransporter()
            if (!transporter) return false

            await transporter.verify()
            console.log('[EmailService] SMTP connection verified')
            return true
        } catch (error) {
            console.error('[EmailService] SMTP connection failed:', error)
            this.transporter = null
            return false
        }
    }

    async sendVerificationEmail(
        name: string,
        email: string,
        token: string,
        locale: Locale = 'en'
    ): Promise<void> {
        try {
            const transporter = await this.getTransporter()
            const config = await this.getSafeConfig()
            if (!transporter) return

            const t = await getTranslations({locale, namespace: 'email.verification'})
            const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`

            const htmlBody = getVerificationEmailTemplate(name, verificationUrl, t, locale, config)

            await transporter.sendMail({
                from: await this.getFromAddress(t('from')),
                to: email,
                subject: t('subject'),
                html: htmlBody,
            })

            console.log(`[EmailService] Verification email sent to ${email}`)
        } catch (error) {
            console.error('[EmailService] Failed to send verification email:', error)
            throw new Error('email.verificationFailed')
        }
    }

    async sendWelcomeEmail(
        email: string,
        name: string,
        locale: Locale = 'en'
    ): Promise<void> {
        try {
            const transporter = await this.getTransporter()
            const config = await this.getSafeConfig()
            if (!transporter) return

            const t = await getTranslations({locale, namespace: 'email.welcome'})
            const dashboardUrl = `${process.env.APP_URL}/dashboard`

            const htmlBody = getWelcomeEmailTemplate(name, dashboardUrl, t, locale, config)

            await transporter.sendMail({
                from: await this.getFromAddress(t('from')),
                to: email,
                subject: t('subject'),
                html: htmlBody,
            })
        } catch (error) {
            console.error('[EmailService] Failed to send welcome email:', error)
        }
    }

    async sendPasswordResetEmail(
        name: string,
        email: string,
        token: string,
        locale: Locale = 'en'
    ): Promise<void> {
        try {
            const transporter = await this.getTransporter()
            const config = await this.getSafeConfig()
            if (!transporter) return

            const t = await getTranslations({locale, namespace: 'email.passwordReset'})
            const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

            const htmlBody = getPasswordResetEmailTemplate(name, resetUrl, t, locale, config)

            await transporter.sendMail({
                from: await this.getFromAddress(t('from')),
                to: email,
                subject: t('subject'),
                html: htmlBody,
            })
        } catch (error) {
            console.error('[EmailService] Failed to send password reset email:', error)
            throw new Error('email.resetFailed')
        }
    }

    async sendOrganizationApproved(
        email: string,
        name: string,
        locale: Locale = 'en'
    ): Promise<void> {
        try {
            const transporter = await this.getTransporter()
            const config = await this.getSafeConfig()
            if (!transporter) return

            const t = await getTranslations({locale, namespace: 'email.orgApproved'})
            const dashboardUrl = `${process.env.APP_URL}/dashboard/organization`

            const htmlBody = getOrganizationApprovedTemplate(name, dashboardUrl, t, locale, config)

            await transporter.sendMail({
                from: await this.getFromAddress(t('from')),
                to: email,
                subject: t('subject'),
                html: htmlBody,
            })
        } catch (error) {
            console.error('[EmailService] Failed to send org approval email:', error)
        }
    }

    async sendOrganizationRejected(
        email: string,
        name: string,
        reason: string,
        locale: Locale = 'en'
    ): Promise<void> {
        try {
            const transporter = await this.getTransporter()
            const config = await this.getSafeConfig()
            if (!transporter) return

            const t = await getTranslations({locale, namespace: 'email.orgRejected'})
            const supportUrl = `${process.env.APP_URL}/contact`

            const htmlBody = getOrganizationRejectedTemplate(name, reason, supportUrl, locale, config)

            await transporter.sendMail({
                from: await this.getFromAddress(t('from')),
                to: email,
                subject: t('subject'),
                html: htmlBody,
            })
        } catch (error) {
            console.error('[EmailService] Failed to send org rejection email:', error)
        }
    }

    async sendAccountSuspended(
        email: string,
        name: string,
        reason: string,
        locale: Locale = 'en'
    ): Promise<void> {
        try {
            const transporter = await this.getTransporter()
            const config = await this.getSafeConfig()
            if (!transporter) return

            const t = await getTranslations({locale, namespace: 'email.suspended'})

            const htmlBody = getAccountSuspendedTemplate(name, reason, t, locale, config)

            await transporter.sendMail({
                from: await this.getFromAddress(t('from')),
                to: email,
                subject: t('subject'),
                html: htmlBody,
            })
        } catch (error) {
            console.error('[EmailService] Failed to send suspension email:', error)
        }
    }

    /**
     * Forces a reload of the transporter configuration.
     * Clears both the cached config and the transporter instance.
     */
    async refreshConfig(): Promise<void> {
        this.config = null
        if (this.transporter) {
            this.transporter.close()
            this.transporter = null
        }
        await this.getTransporter()
    }
}
