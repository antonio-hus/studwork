/** @format */
import 'server-only'
import {Locale} from '@/lib/utils/i18n/routing';
import {Config, ThemeColors} from "@/lib/domain/config";

/**
 * Account Suspended Template
 * Notification sent when a user account is suspended by an admin
 *
 * @param name - Username
 * @param reason - Reason of account suspension
 * @param translations - Translation function
 * @param locale - Locale language
 * @param config - Platform config
 * @returns HTML string for email body
 */
export function getAccountSuspendedTemplate(
    name: string,
    reason: string,
    translations: any,
    locale: Locale = 'en',
    config: Config
): string {
    const t = translations;
    const lightColors = (config.themeColors as ThemeColors).light

    return `
        <!DOCTYPE html>
        <html lang="${locale}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${t('email.suspended.subject')}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: ${lightColors.surface};">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${lightColors.surface};">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: ${lightColors.background}; border-radius: 8px; overflow: hidden; border-width: 1px; border-style: solid; border-color: ${lightColors.border}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                            
                            <!-- BRANDING HEADER -->
                            <tr>
                                <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: ${lightColors.background}; border-bottom: 1px solid ${lightColors.border};">
                                    <img src="${config.logo}" 
                                         alt="${config.name}" 
                                         style="max-height: 60px; max-width: 200px; height: auto; width: auto; display: block; margin: 0 auto;" 
                                    />
                                </td>
                            </tr>

                            <!-- STATUS STRIPE (Error Color for Suspension) -->
                            <tr>
                                <td style="background-color: ${lightColors.error}; height: 4px;"></td>
                            </tr>

                            <!-- MAIN CONTENT -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: ${lightColors.textPrimary}; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; line-height: 1.3;">
                                        ${t('email.suspended.greeting')} ${name},
                                    </h2>
                                    <p style="color: ${lightColors.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                        ${t('email.suspended.body')}
                                    </p>
                                    
                                    <!-- REASON BOX -->
                                    <div style="background-color: ${lightColors.muted}; border-left-width: 4px; border-left-style: solid; border-left-color: ${lightColors.error}; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
                                        <h3 style="color: ${lightColors.error}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin: 0 0 8px 0;">
                                            ${t('email.suspended.reasonTitle')}
                                        </h3>
                                        <p style="color: ${lightColors.textPrimary}; font-size: 16px; line-height: 1.5; margin: 0; font-style: italic;">
                                            "${reason}"
                                        </p>
                                    </div>

                                    <p style="color: ${lightColors.textPrimary}; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                        ${t('email.suspended.impact')}
                                    </p>
                                    
                                    <p style="color: ${lightColors.textSecondary}; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                                        ${t('email.suspended.footer')}
                                    </p>
                                </td>
                            </tr>

                            <!-- FOOTER -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: ${lightColors.muted}; border-top-width: 1px; border-top-style: solid; border-top-color: ${lightColors.border};">
                                    <p style="color: ${lightColors.textSecondary}; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                                        © ${new Date().getFullYear()} <strong>${config.name}</strong>. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}
