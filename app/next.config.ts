/** @format */
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    serverExternalPackages: ['pino', 'pino-pretty'],
};

const withNextIntl = createNextIntlPlugin(
    './lib/utils/i18n/request.ts'
);

export default withNextIntl(nextConfig);
