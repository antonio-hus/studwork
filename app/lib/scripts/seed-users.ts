import 'dotenv/config'
import {UserRole} from '../domain/user'
import {database} from '../database'
import {hashPassword} from '../utils/password'

/**
 * Creates a set of test users with different roles.
 * Each user will have the password 'Test1234'.
 * Skips creation if the user email already exists.
 */
async function seedTestUsers() {
    console.log('Starting test user seeding...')

    const hashedPassword = await hashPassword('Test1234')

    const testUsers = [
        {
            email: 'student@test.com',
            name: 'Test Student',
            role: UserRole.STUDENT,
        },
        {
            email: 'coordinator@test.com',
            name: 'Test Coordinator',
            role: UserRole.COORDINATOR,
        },
        {
            email: 'organization@test.com',
            name: 'Test Organization',
            role: UserRole.ORGANIZATION,
        },
        {
            email: 'admin@test.com',
            name: 'Test Administrator',
            role: UserRole.ADMINISTRATOR,
        },
    ]

    for (const userData of testUsers) {
        try {
            const existingUser = await database.user.findUnique({
                where: {email: userData.email},
            })

            if (existingUser) {
                console.log(`User already exists: ${userData.email}`)
                continue
            }

            await database.user.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                    hashedPassword,
                    role: userData.role,
                    emailVerified: new Date(),
                    isSuspended: false,
                },
            })

            console.log(`Created ${userData.role}: ${userData.email}`)
        } catch (error) {
            console.error(`Failed to create ${userData.email}:`, error)
        }
    }

    console.log('Test user seeding completed.')
    console.log('Login credentials:')
    console.log('Email: [role]@test.com')
    console.log('Password: Test1234')
}

seedTestUsers()
    .then(async () => {
        await database.$disconnect()
        process.exit(0)
    })
    .catch(async (error) => {
        console.error('Seeding failed:', error)
        await database.$disconnect()
        process.exit(1)
    })
