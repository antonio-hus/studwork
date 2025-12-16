"use server"

import {redirect} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {AuthService} from "@/lib/service/auth-service";
import {RateLimitService} from "@/lib/service/rate-limit-service";
import {SessionService} from "@/lib/service/session-service";
import {TokenService} from "@/lib/service/token-service";
import {getClientIp} from "@/lib/utils/ip";
import {createLogger} from "@/lib/utils/logger";
import {ActionResponse} from "@/lib/domain/actions";
import {UserRole} from "@/lib/domain/user";

const logger = createLogger('AuthController');

/**
 * Validates email format using regex.
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates password complexity.
 * At least 8 chars, 1 uppercase, 1 number.
 */
function isValidPassword(password: string): boolean {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Signs up a new user.
 *
 * Orchestrates form validation, rate limiting, and business logic execution.
 *
 * @param {FormData} formData - The raw form data containing registration fields.
 * @returns {Promise<ActionResponse<{ needsVerification: boolean }>>} Success status or error message.
 */
export async function signUp(formData: FormData): Promise<ActionResponse<{ needsVerification: boolean }>> {
    const t = await getTranslations();
    const authService = AuthService.instance;
    const sessionService = SessionService.instance;

    try {
        const clientIp = await getClientIp();
        const rateLimitResult = RateLimitService.signupLimiter.check(3, clientIp);

        if (!rateLimitResult.success) {
            return {
                success: false,
                error: t('errors.auth.tooManyAttempts')
            };
        }

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as UserRole;

        // Validation
        if (!name || name.trim().length < 2) {
            return {success: false, error: t('errors.validation.nameTooShort')};
        }
        if (!email || !isValidEmail(email)) {
            return {success: false, error: t('errors.validation.invalidEmail')};
        }
        if (!password || !isValidPassword(password)) {
            return {success: false, error: t('errors.validation.weakPassword')};
        }
        if (!Object.values(UserRole).includes(role)) {
            return {success: false, error: t('errors.validation.invalidRole')};
        }

        const {user} = await authService.signUp({name, email, password, role}, clientIp);
        await sessionService.createSession(user);

        return {success: true, data: {needsVerification: true}};

    } catch (error) {
        logger.error("Sign up error", error as Error);
        return {success: false, error: t('errors.auth.signUpFailed')};
    }
}

/**
 * Signs in an existing user.
 *
 * Handles credential validation and session creation.
 *
 * @param {FormData} formData - Form data containing email and password.
 * @returns {Promise<ActionResponse<void>>} Success status or error message.
 */
export async function signIn(formData: FormData): Promise<ActionResponse<void>> {
    const t = await getTranslations();
    const authService = AuthService.instance;

    try {
        const clientIp = await getClientIp();
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !isValidEmail(email)) {
            return {success: false, error: t('errors.validation.invalidEmail')};
        }
        if (!password) {
            return {success: false, error: t('errors.validation.passwordRequired')};
        }

        await authService.signIn({email, password}, clientIp);
        return {success: true, data: undefined};

    } catch (error) {
        logger.error("Sign in error", error as Error);
        return {success: false, error: t('errors.auth.signInFailed')};
    }
}

/**
 * Signs out the current user.
 *
 * Destroys the active session and redirects to the login page.
 */
export async function signOut(): Promise<void> {
    await AuthService.instance.signOut();
    redirect("/login");
}

/**
 * Verifies a user's email address using a verification token.
 *
 * @param {string} token - The unique verification token from the URL.
 * @returns {Promise<ActionResponse<void>>} Success status or error message.
 */
export async function verifyEmail(token: string): Promise<ActionResponse<void>> {
    const t = await getTranslations();
    const authService = AuthService.instance;

    try {
        if (!token) {
            return {success: false, error: t('errors.auth.invalidToken')};
        }

        await authService.verifyEmail(token);
        return {success: true, data: undefined};
    } catch (error) {
        logger.error('Email verification error', error as Error);
        return {success: false, error: t('errors.auth.verificationFailed')};
    }
}

/**
 * Requests a password reset email for a given email address.
 *
 * @param {FormData} formData - Form data containing the user's email.
 * @returns {Promise<ActionResponse<{ message: string }>>} Success message (always returns success for security).
 */
export async function requestPasswordReset(formData: FormData): Promise<ActionResponse<{ message: string }>> {
    const t = await getTranslations();
    const authService = AuthService.instance;

    try {
        const clientIp = await getClientIp();
        const email = formData.get("email") as string;

        if (!email || !isValidEmail(email)) {
            return {success: false, error: t('errors.validation.invalidEmail')};
        }

        await authService.requestPasswordReset({email}, clientIp);
        return {success: true, data: {message: t('success.auth.resetEmailSent')}};

    } catch (error) {
        logger.error("Password reset request error", error as Error);
        return {success: false, error: t('errors.auth.resetRequestFailed')};
    }
}

/**
 * Resets a user's password using a valid reset token.
 *
 * @param {FormData} formData - Form data containing the reset token and new password.
 * @returns {Promise<ActionResponse<void>>} Success status or error message.
 */
export async function resetPassword(formData: FormData): Promise<ActionResponse<void>> {
    const t = await getTranslations();
    const authService = AuthService.instance;

    try {
        const token = formData.get("token") as string;
        const password = formData.get("password") as string;

        if (!token) {
            return {success: false, error: t('errors.auth.missingFields')};
        }
        if (!password || !isValidPassword(password)) {
            return {success: false, error: t('errors.validation.weakPassword')};
        }

        await authService.resetPassword({token, password});
        return {success: true, data: undefined};

    } catch (error) {
        logger.error('Password reset error', error as Error);
        return {success: false, error: t('errors.auth.resetFailed')};
    }
}

/**
 * Verifies if a password reset token is valid without consuming it.
 * Useful for UI checks before showing the reset form.
 *
 * @param {string} token - The reset token to verify.
 * @returns {Promise<ActionResponse<{ valid: boolean }>>} Validity status.
 */
export async function verifyResetToken(token: string): Promise<ActionResponse<{ valid: boolean }>> {
    const t = await getTranslations();
    const tokenService = TokenService.instance;

    try {
        if (!token) return {success: false, error: t('errors.auth.invalidToken')};

        const result = await tokenService.verifyPasswordResetToken(token);

        if (!result.valid) {
            return {success: false, error: t('errors.auth.tokenInvalid')};
        }

        return {success: true, data: {valid: true}};

    } catch (error) {
        logger.error('Token verification error', error as Error);
        return {success: false, error: t('errors.auth.tokenVerificationFailed')};
    }
}

/**
 * Resends the email verification link.
 *
 * @param {FormData} formData - Form data containing the email address.
 * @returns {Promise<ActionResponse<{ message: string }>>} Success message.
 */
export async function resendVerificationEmail(formData: FormData): Promise<ActionResponse<{ message: string }>> {
    const t = await getTranslations();
    const authService = AuthService.instance;

    try {
        const email = formData.get("email") as string;
        if (!email || !isValidEmail(email)) {
            return {success: false, error: t('errors.validation.invalidEmail')};
        }

        await authService.resendVerificationEmail({email});
        return {success: true, data: {message: t('success.auth.verificationEmailSent')}};

    } catch (error) {
        logger.error('Resend verification email error', error as Error);
        return {success: false, error: t('errors.auth.resendFailed')};
    }
}
