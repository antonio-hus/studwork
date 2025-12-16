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

/**
 * Authentication Service
 * Centralizes authentication logic
 */
export class AuthService {
    private static _instance: AuthService

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
                if (emailDomain !== domain) {
                    throw new Error('auth.invalidStudentDomain')
                }
            }

            if (data.role === UserRole.COORDINATOR && config.staffEmailDomain) {
                const domain = config.staffEmailDomain.toLowerCase()
                const emailDomain = data.email.split('@')[1]?.toLowerCase()
                if (emailDomain !== domain) {
                    throw new Error('auth.invalidStaffDomain')
                }
            }
        }

        // Check for Existing User
        const existingUser = await UserRepository.instance.getByEmail(data.email)
        if (existingUser) {
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

            return {user, verificationToken}

        } catch (error: any) {
            // Rollback if user was created but email failed
            if (user && user.id) {
                console.error(`[AuthService] SignUp failed during email sending. Rolling back user ${user.id}. Error: ${error.message}`)

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
            throw new Error('auth.rateLimitExceeded')
        }

        const user = await UserRepository.instance.getByEmail(data.email)

        if (!user || !user.hashedPassword) {
            throw new Error('auth.invalidCredentials')
        }

        const isValidPassword = await verifyPassword(data.password, user.hashedPassword)
        if (!isValidPassword) {
            throw new Error('auth.invalidCredentials')
        }

        if (user.isSuspended) {
            throw new Error('auth.accountSuspended')
        }

        await SessionService.instance.createSession(user)

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

        if (!user) return null

        const token = await TokenService.instance.createPasswordResetToken(user.id)

        try {
            await EmailService.instance.sendPasswordResetEmail(user.name, user.email, token.token)
        } catch (error) {
            console.error('[AuthService] Failed to send password reset email', error)
            await TokenService.instance.deletePasswordResetToken(token.id)
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

        // After successful verification, send welcome email
        const user = await UserRepository.instance.getById(result.userId)
        if (user) {
            try {
                await EmailService.instance.sendWelcomeEmail(user.email, user.name)
            } catch (error) {
                console.error('[AuthService] Failed to send welcome email', error)
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
        } catch (error) {
            console.error('[AuthService] Failed to resend verification email', error)
            throw new Error('auth.emailDeliveryFailed')
        }

        return {user, verificationToken}
    }

    /**
     * Logs out the current user.
     */
    async signOut() {
        await SessionService.instance.destroySession()
    }

    /**
     * Gets the current authenticated user.
     */
    async getCurrentUser() {
        return SessionService.instance.getCurrentSessionUser()
    }
}
