/** @format */
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {};

const withNextIntl = createNextIntlPlugin(
    './lib/utils/i18n/request.ts'
);

export default withNextIntl(nextConfig);
