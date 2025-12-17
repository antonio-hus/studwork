import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                surface: {
                    DEFAULT: "var(--color-surface)",
                    elevated: "var(--color-surface-elevated)",
                },
                primary: {
                    DEFAULT: "var(--color-primary)",
                    hover: "var(--color-primary-hover)",
                    light: "var(--color-primary-light)",
                    dark: "var(--color-primary-dark)",
                    foreground: "var(--color-primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    hover: "var(--color-secondary-hover)",
                    light: "var(--color-secondary-light)",
                    dark: "var(--color-secondary-dark)",
                    foreground: "var(--color-secondary-foreground)",
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    hover: "var(--color-accent-hover)",
                    light: "var(--color-accent-light)",
                    dark: "var(--color-accent-dark)",
                    foreground: "var(--color-accent-foreground)",
                },
                success: {
                    DEFAULT: "var(--color-success)",
                    light: "var(--color-success-light)",
                    foreground: "var(--color-success-foreground)",
                },
                error: {
                    DEFAULT: "var(--color-error)",
                    light: "var(--color-error-light)",
                    foreground: "var(--color-error-foreground)",
                },
                warning: {
                    DEFAULT: "var(--color-warning)",
                    light: "var(--color-warning-light)",
                    foreground: "var(--color-warning-foreground)",
                },
                info: {
                    DEFAULT: "var(--color-info)",
                    light: "var(--color-info-light)",
                    foreground: "var(--color-info-foreground)",
                },
                muted: {
                    DEFAULT: "var(--color-muted)",
                    foreground: "var(--color-muted-foreground)",
                },
                border: "var(--color-border)",
                input: "var(--color-input)",
                ring: "var(--color-ring)",
                text: {
                    primary: "var(--color-text-primary)",
                    secondary: "var(--color-text-secondary)",
                    tertiary: "var(--color-text-tertiary)",
                    disabled: "var(--color-text-disabled)",
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
