/** @format */
import 'server-only'
import {UserRole} from '@/lib/domain/user'
import {UserRepository} from '@/lib/repository/user-repository'
import {SessionService} from '@/lib/service/session-service'
import {TokenService} from '@/lib/service/token-service'
import {RateLimitService} from '@/lib/service/rate-limit-service'
import {EmailService} from '@/lib/service/email-service'
import {StudentService} from '@/lib/service/student-service'
import {CoordinatorService} from '@/lib/service/coordinator-service'
import {OrganizationService} from '@/lib/service/organization-service'
import {ConfigService} from '@/lib/service/config-service'
import {hashPassword, verifyPassword} from '@/lib/utils/password'
import {UserService} from "@/lib/service/user-service";
import {createLogger} from '@/lib/utils/logger'

/**
 * Authentication Service
 * Centralizes authentication logic
 */
export class AuthService {
    private static _instance: AuthService
    private readonly logger = createLogger('AuthService')

    private constructor() {
    }

    static get instance(): AuthService {
        if (!AuthService._instance) {
            AuthService._instance = new AuthService()
        }
        return AuthService._instance
    }

    /**
     * Register a new user.
     * Checks rate limits, email uniqueness, and configuration policies before creating the account.
     * rolls back user creation if email sending fails.
     *
     * @param data - Registration data including role
     * @param ipAddress - Client IP for rate limiting
     */
    async signUp(
        data: {
            name: string
            email: string
            password: string
            role: UserRole
        },
        ipAddress: string
    ) {
        // Rate Limit Check
        const limitCheck = RateLimitService.signupLimiter.check(3, ipAddress)
        if (!limitCheck.success) {
            this.logger.warn('Signup rate limit exceeded', { ipAddress })
            throw new Error('auth.rateLimitExceeded')
        }

        // Load Configuration for Validation
        const config = await ConfigService.instance.getConfig()
        if (!config) {
            throw new Error('auth.configMissing')
        }

        // Validation Logic
        if (!config.allowPublicRegistration) {
            // For internal roles, check domains if configured
            if (data.role === UserRole.STUDENT && config.studentEmailDomain) {
                const domain = config.studentEmailDomain.toLowerCase()
                const emailDomain = data.email.split('@')[1]?.toLowerCase()
                if (emailDomain !== domain && "@" + emailDomain !== domain) {
                    throw new Error('auth.invalidStudentDomain')
                }
            }

            if (data.role === UserRole.COORDINATOR && config.staffEmailDomain) {
                const domain = config.staffEmailDomain.toLowerCase()
                const emailDomain = data.email.split('@')[1]?.toLowerCase()
                if (emailDomain !== domain && "@" + emailDomain !== domain) {
                    throw new Error('auth.invalidStaffDomain')
                }
            }
        }

        // Check for Existing User
        const existingUser = await UserRepository.instance.getByEmail(data.email)
        if (existingUser) {
            this.logger.debug('Signup failed: email already exists', { email: data.email })
            throw new Error('auth.emailAlreadyExists')
        }

        let user
        let verificationToken

        try {
            // Create User Entity based on Role
            switch (data.role) {
                case UserRole.STUDENT:
                    const studentResult = await StudentService.instance.registerStudent({
                        user: {
                            name: data.name,
                            email: data.email,
                            password: data.password,
                        },
                        student: {}
                    })
                    user = studentResult.user
                    break

                case UserRole.COORDINATOR:
                    const coordinatorResult = await CoordinatorService.instance.registerCoordinator({
                        user: {
                            name: data.name,
                            email: data.email,
                            password: data.password,
                        },
                        coordinator: {},
                    })
                    user = coordinatorResult.user
                    break

                case UserRole.ORGANIZATION:
                    const orgResult = await OrganizationService.instance.registerOrganization({
                        user: {
                            name: data.name,
                            email: data.email,
                            password: data.password,
                        },
                        organization: {},
                    })
                    user = orgResult.user
                    break

                default:
                    throw new Error('auth.invalidRole')
            }

            // Generate Token
            verificationToken = await TokenService.instance.createVerificationToken(user.id)

            // Send Email
            await EmailService.instance.sendVerificationEmail(
                user.name,
                user.email,
                verificationToken.token
            )

            this.logger.info('User signed up successfully', { userId: user.id, role: data.role })

            return {user, verificationToken}

        } catch (error: any) {
            // Rollback if user was created but email failed
            if (user && user.id) {
                this.logger.error(
                    `SignUp failed during email sending. Rolling back user ${user.id}. Error: ${error.message}`
                )

                // Hard delete the user to clean up.
                await UserService.instance.deleteUser(user.id)
            }

            if (error.message === 'email.verificationFailed') {
                throw new Error('auth.emailDeliveryFailed')
            }
            throw error
        }
    }

    /**
     * Authenticate a user and create a session.
     *
     * @param data - Login credentials
     * @param ipAddress - Client IP for rate limiting
     */
    async signIn(
        data: {
            email: string
            password: string
        },
        ipAddress: string
    ) {
        const limitCheck = RateLimitService.loginLimiter.check(5, ipAddress)
        if (!limitCheck.success) {
            this.logger.warn('Login rate limit exceeded', { ipAddress, email: data.email })
            throw new Error('auth.rateLimitExceeded')
        }

        const user = await UserRepository.instance.getByEmail(data.email)

        if (!user || !user.hashedPassword) {
            this.logger.debug('Login failed: invalid credentials', { email: data.email })
            throw new Error('auth.invalidCredentials')
        }

        const isValidPassword = await verifyPassword(data.password, user.hashedPassword)
        if (!isValidPassword) {
            this.logger.debug('Login failed: invalid password', { email: data.email })
            throw new Error('auth.invalidCredentials')
        }

        if (user.isSuspended) {
            this.logger.warn('Suspended user attempted login', { userId: user.id })
            throw new Error('auth.accountSuspended')
        }

        await SessionService.instance.createSession(user)

        this.logger.info('User signed in', { userId: user.id })

        return user
    }

    /**
     * Request a password reset email.
     * Silently fails if user doesn't exist to prevent enumeration.
     *
     * @param data - Request data
     * @param ipAddress - Client IP for rate limiting
     */
    async requestPasswordReset(
        data: { email: string },
        ipAddress: string
    ) {
        const limitCheck = RateLimitService.passwordResetLimiter.check(3, ipAddress)
        if (!limitCheck.success) {
            throw new Error('auth.rateLimitExceeded')
        }

        const user = await UserRepository.instance.getByEmail(data.email)

        if (!user) {
            this.logger.debug('Password reset requested for non-existent email', { email: data.email })
            return null
        }

        const token = await TokenService.instance.createPasswordResetToken(user.id)

        try {
            await EmailService.instance.sendPasswordResetEmail(user.name, user.email, token.token)
            this.logger.info('Password reset email sent', { userId: user.id })
        } catch (error) {
            this.logger.error('Failed to send password reset email', error as Error)
            await TokenService.instance.deletePasswordResetToken(token.token) // Note: using token string or ID depending on your delete implementation
            throw new Error('auth.emailDeliveryFailed')
        }

        return {token, user}
    }

    /**
     * Process the password reset with a valid token.
     */
    async resetPassword(data: { token: string; password: string }) {
        const result = await TokenService.instance.verifyPasswordResetToken(data.token)

        if (!result.valid || !result.userId) {
            throw new Error(result.error || 'auth.invalidToken')
        }

        const hashedPassword = await hashPassword(data.password)

        await UserRepository.instance.update(result.userId, {hashedPassword})
        await TokenService.instance.deletePasswordResetToken(data.token)

        this.logger.info('Password reset successfully', { userId: result.userId })

        return {success: true}
    }

    /**
     * Verifies an email address using a token.
     */
    async verifyEmail(token: string) {
        const result = await TokenService.instance.verifyVerificationToken(token)

        if (!result.valid || !result.userId) {
            throw new Error(result.error || 'auth.invalidToken')
        }

        await UserRepository.instance.update(result.userId, {emailVerified: new Date()})
        await TokenService.instance.deleteVerificationToken(token)

        this.logger.info('Email verified successfully', { userId: result.userId })

        // After successful verification, send welcome email
        const user = await UserRepository.instance.getById(result.userId)
        if (user) {
            try {
                await EmailService.instance.sendWelcomeEmail(user.email, user.name)
            } catch (error) {
                this.logger.error('Failed to send welcome email after verification', error as Error)
            }
        }

        return {success: true}
    }

    /**
     * Resends verification email.
     * Uses rate limiting based on the email address itself to prevent spam.
     */
    async resendVerificationEmail(data: { email: string }) {
        const limitCheck = RateLimitService.emailResendLimiter.check(3, data.email)
        if (!limitCheck.success) {
            throw new Error('auth.rateLimitExceeded')
        }

        const user = await UserRepository.instance.getByEmail(data.email)

        if (!user || user.emailVerified) return null

        const verificationToken = await TokenService.instance.createVerificationToken(user.id)

        try {
            await EmailService.instance.sendVerificationEmail(user.name, user.email, verificationToken.token)
            this.logger.info('Verification email resent', { userId: user.id })
        } catch (error) {
            this.logger.error('Failed to resend verification email', error as Error)
            throw new Error('auth.emailDeliveryFailed')
        }

        return {user, verificationToken}
    }

    /**
     * Resends verification email for an authenticated user.
     * Checks if user exists and is not already verified.
     *
     * @param userId - The ID of the currently logged-in user.
     */
    async resendVerificationEmailAuthenticated(userId: string) {
        // Rate limit check based on User ID
        const limitCheck = RateLimitService.emailResendLimiter.check(3, userId)
        if (!limitCheck.success) {
            this.logger.warn('Authenticated email resend rate limit exceeded', { userId })
            throw new Error('auth.rateLimitExceeded')
        }

        const user = await UserRepository.instance.getById(userId)

        if (!user) {
            throw new Error('auth.userNotFound')
        }

        if (user.emailVerified) {
            this.logger.debug('Attempted resend for already verified user', { userId })
            return new Error ('auth.emailAlreadyVerified')
        }

        const verificationToken = await TokenService.instance.createVerificationToken(user.id)

        try {
            await EmailService.instance.sendVerificationEmail(user.name, user.email, verificationToken.token)
            this.logger.info('Verification email resent (authenticated)', { userId })
        } catch (error) {
            this.logger.error('Failed to resend verification email (authenticated)', error as Error)
            throw new Error('auth.emailDeliveryFailed')
        }

        return { user, verificationToken }
    }

    /**
     * Logs out the current user.
     */
    async signOut() {
        const user = await this.getCurrentUser()
        if (user) {
            this.logger.info('User signed out', { userId: user.id })
        }
        await SessionService.instance.destroySession()
    }

    /**
     * Gets the current authenticated user.
     */
    async getCurrentUser() {
        return SessionService.instance.getCurrentSessionUser()
    }
}
