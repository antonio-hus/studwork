import 'dotenv/config'
import {UserRole} from '../domain/user'
import {database} from '../database'
import {hashPassword} from '../utils/password'

/**
 * Creates a set of test users with different roles and their corresponding profiles.
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

            const user = await database.user.create({
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

            // Create role-specific profile
            switch (user.role) {
                case UserRole.STUDENT:
                    await database.student.create({
                        data: {userId: user.id, studyProgram: 'Computer Science', yearOfStudy: 3},
                    })
                    console.log(`Created student profile for ${user.email}`)
                    break
                case UserRole.COORDINATOR:
                    await database.coordinator.create({
                        data: {userId: user.id, department: 'Faculty of Engineering'},
                    })
                    console.log(`Created coordinator profile for ${user.email}`)
                    break
                case UserRole.ORGANIZATION:
                    await database.organization.create({
                        data: {userId: user.id, isVerified: true},
                    })
                    console.log(`Created organization profile for ${user.email}`)
                    break
            }
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
