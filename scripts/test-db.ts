import { prisma } from '../lib/prisma'

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Count users
    const userCount = await prisma.user.count()
    console.log(`Users in database: ${userCount}`)
    
    // Count teams
    const teamCount = await prisma.team.count()
    console.log(`Teams in database: ${teamCount}`)
    
    // Count roles
    const roleCount = await prisma.role.count()
    console.log(`Roles in database: ${roleCount}`)
    
    // Fetch first user with details
    const firstUser = await prisma.user.findFirst({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (firstUser) {
      console.log('\nFirst user details:')
      console.log('- ID:', firstUser.id)
      console.log('- Name:', firstUser.name)
      console.log('- Email:', firstUser.email)
      console.log('- Roles:', firstUser.userRoles.map(ur => ur.role.name).join(', '))
    } else {
      console.log('\nNo users found in database!')
    }
    
  } catch (error) {
    console.error('Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()