/** @format */
import {PrismaClient} from '@/prisma/generated/client';
import {PrismaPg} from '@prisma/adapter-pg';

/**
 * Extending the Node.js global object to optionally store a PrismaClient instance.
 * This is used to prevent creating multiple instances during development (e.g., hot reloads).
 */
const globalForPrisma = global as unknown as {
    database: PrismaClient;
};

/**
 * Creates a Postgres adapter for Prisma using the DATABASE_URL from environment variables.
 */
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Creates a singleton Prisma client.
 *
 * If a global Prisma client already exists (from a previous hot-reload in development),
 * it reuses it. Otherwise, it creates a new PrismaClient instance using the adapter.
 */
const database = globalForPrisma.database || new PrismaClient({
    adapter,
});

/**
 * During development, store the Prisma client globally to prevent multiple connections.
 * In production, this is skipped because the server process starts only once.
 */
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.database = database;
}

/**
 * The Prisma client instance to be used throughout the application.
 *
 * Example usage:
 * ```ts
 * import database from './database';
 * const users = await database.user.findMany();
 * ```
 */
export {database};
