/** @format */
import type { Prisma } from "@/prisma/generated/client";

/**
 * Re-exporting generated Prisma types for Security Tokens.
 */
export type { VerificationToken, PasswordResetToken } from "@/prisma/generated/client";

/**
 * DTO for creating an Email Verification Token.
 */
export type VerificationTokenCreateType = Prisma.VerificationTokenCreateInput;

/**
 * DTO for creating a Password Reset Token.
 */
export type PasswordResetTokenCreateType = Prisma.PasswordResetTokenCreateInput;
