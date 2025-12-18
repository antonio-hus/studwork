import 'dotenv/config'
import {database} from '../database'
import {ProjectCategory, ProjectStatus} from '../domain/project'
import {UserRole} from '../domain/user'

/**
 * Creates a set of test projects.
 * Skips creation if a project with the same title already exists.
 */
async function seedTestProjects() {
    console.log('Starting test project seeding...')

    const organization = await database.user.findFirst({
        where: {role: UserRole.ORGANIZATION},
    })

    if (!organization) {
        console.error('No organization found to assign projects to. Please seed users first.')
        return
    }
    
    const organizationProfile = await database.organization.findFirst({where: {userId: organization.id}})
    
    if (!organizationProfile) {
        console.error('No organization profile found to assign projects to. Please seed users first.')
        return
    }

    const testProjects = [
        {
            title: 'Develop a new website for our NGO',
            description: 'We are looking for a student to help us develop a new website for our NGO. The website should be modern, responsive, and easy to use. The student will be responsible for the entire development process, from design to deployment.',
            category: ProjectCategory.SOFTWARE_DEVELOPMENT,
            status: ProjectStatus.PUBLISHED,
            requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
            numberOfStudents: 1,
            organizationId: organizationProfile.id,
        },
        {
            title: 'Create a marketing campaign for our new product',
            description: 'We are looking for a student to help us create a marketing campaign for our new product. The student will be responsible for creating a marketing plan, developing marketing materials, and executing the campaign.',
            category: ProjectCategory.MARKETING,
            status: ProjectStatus.PUBLISHED,
            requiredSkills: ['Marketing', 'Social Media', 'Content Creation'],
            numberOfStudents: 2,
            organizationId: organizationProfile.id,
        },
        {
            title: 'Conduct a research study on the effects of climate change',
            description: 'We are looking for a student to help us conduct a research study on the effects of climate change. The student will be responsible for collecting and analyzing data, and writing a research paper.',
            category: ProjectCategory.RESEARCH,
            status: ProjectStatus.PENDING_REVIEW,
            requiredSkills: ['Research', 'Data Analysis', 'Academic Writing'],
            numberOfStudents: 1,
            organizationId: organizationProfile.id,
        },
    ]

    for (const projectData of testProjects) {
        try {
            const existingProject = await database.project.findFirst({
                where: {title: projectData.title},
            })

            if (existingProject) {
                console.log(`Project already exists: ${projectData.title}`)
                continue
            }

            await database.project.create({
                data: projectData,
            })

            console.log(`Created project: ${projectData.title}`)
        } catch (error) {
            console.error(`Failed to create ${projectData.title}:`, error)
        }
    }

    console.log('Test project seeding completed.')
}

seedTestProjects()
    .then(async () => {
        await database.$disconnect()
        process.exit(0)
    })
    .catch(async (error) => {
        console.error('Seeding failed:', error)
        await database.$disconnect()
        process.exit(1)
    })
