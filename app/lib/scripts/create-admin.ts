import 'dotenv/config'
import readline from 'node:readline'
import {Writable} from 'node:stream'
import {UserRole} from '../domain/user'
import {database} from '../database'
import {hashPassword} from '../utils/password'

/**
 * MutedStdout
 * A writable stream that can suppress output.
 * Used for securely capturing password input without echoing characters.
 */
class MutedStdout extends Writable {
    public muted = false

    _write(
        chunk: any,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void
    ) {
        if (!this.muted) {
            process.stdout.write(chunk, encoding)
        }
        callback()
    }
}

/**
 * Prompts the user for input via stdin.
 * Supports silent input for sensitive data like passwords.
 *
 * @param {string} question - The text to display to the user.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.silent=false] - If true, input characters are hidden.
 * @returns {Promise<string>} The user's trimmed input.
 */
function ask(question: string, {silent = false} = {}): Promise<string> {
    if (!silent) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true,
        })

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close()
                resolve(answer.trim())
            })
        })
    }

    // Handle silent input manually
    process.stdout.write(question)

    const mutedStdout = new MutedStdout()
    mutedStdout.muted = true

    const rl = readline.createInterface({
        input: process.stdin,
        output: mutedStdout,
        terminal: true,
    })

    return new Promise((resolve) => {
        rl.question('', (answer) => {
            rl.close()
            process.stdout.write('\n')
            resolve(answer.trim())
        })
    })
}

/**
 * Main execution function.
 * Collects admin credentials and creates or updates the user in the database.
 */
async function main() {
    console.log('--- Create Admin User ---')

    const email = await ask('Admin email: ')
    const name = await ask('Admin name (optional): ')
    const password = await ask('Admin password: ', {silent: true})

    if (!email || !password) {
        console.error('Error: Email and password are required.')
        process.exit(1)
    }

    try {
        const hashedPassword = await hashPassword(password)

        const user = await database.user.upsert({
            where: {email},
            update: {
                name: name,
                role: UserRole.ADMINISTRATOR,
                isSuspended: false,
            },
            create: {
                email,
                name: name,
                hashedPassword,
                role: UserRole.ADMINISTRATOR,
                emailVerified: new Date(),
                isSuspended: false,
            },
        })

        console.log(`Admin account successfully configured for: ${user.email}`)
        console.log(`ID: ${user.id}`)

    } catch (error) {
        console.error('Database Error:', error)
        process.exit(1)
    }
}

main()
    .then(async () => {
        await database.$disconnect()
        process.exit(0)
    })
    .catch(async (err) => {
        console.error('Unexpected Error:', err)
        await database.$disconnect()
        process.exit(1)
    })
