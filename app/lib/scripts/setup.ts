import 'dotenv/config'
import { execSync } from 'child_process'
import * as readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

/**
 * Runs a shell command with a short, descriptive label.
 *
 * The command inherits the current process stdio so that
 * interactive prompts in child processes work as expected.
 * If the command exits with a non-zero status, the process
 * is terminated with exit code 1.
 *
 * @param {string} cmd - Shell command to execute.
 * @param {string} desc - Human-readable description shown in logs.
 */
const run = (cmd: string, desc: string) => {
    console.log(`[${desc}]`)
    try {
        execSync(cmd, { stdio: 'inherit' })
        console.log(`[${desc}] Completed successfully.`)
    } catch (e) {
        console.error(`[${desc}] Failed.`)
        process.exit(1)
    }
}

/**
 * Setup script for the University Platform.
 *
 * Performs the following steps:
 * 1. Generates the Prisma client.
 * 2. Syncs the database schema using db push.
 * 3. Launches the admin creation script.
 */
async function main() {
    console.log('University Platform - Setup Script')

    // 1. Database Setup
    run('npx prisma generate', 'Generating Prisma client')
    run('npx prisma db push', 'Syncing database schema')

    // 2. Create Admin
    console.log('Launching admin creation wizard...')
    try {
        // Inherit stdio for interactive password prompts
        execSync('npm run admin:add', { stdio: 'inherit' })
    } catch (e) {
        console.log('Admin creation was skipped or failed.')
    }

    console.log('Setup Complete.')
    console.log('Next steps:')
    console.log('  - Run: npm run dev')
    console.log('  - Open: http://localhost:3000/setup')

    rl.close()
}

main()
