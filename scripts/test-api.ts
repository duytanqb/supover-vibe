import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

async function testAPI() {
  try {
    // Get a super admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        userRoles: {
          some: {
            role: {
              code: 'SUPER_ADMIN'
            }
          }
        }
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (!adminUser) {
      console.log('No admin user found!')
      return
    }
    
    console.log('Testing with admin user:', adminUser.email)
    console.log('Admin roles:', adminUser.userRoles.map(ur => ur.role.code).join(', '))
    
    // Create a test token
    const token = jwt.sign(
      { 
        userId: adminUser.id,
        email: adminUser.email
      },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    )
    
    console.log('\nGenerated test token (use this in the browser console):')
    console.log(`localStorage.setItem('token', '${token}')`)
    
    // Test the users API
    console.log('\nTesting /api/users endpoint...')
    const usersResponse = await fetch('http://localhost:3001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (usersResponse.ok) {
      const data = await usersResponse.json()
      console.log('✅ Users API working! Found', data.users.length, 'users')
    } else {
      console.log('❌ Users API failed:', usersResponse.status, await usersResponse.text())
    }
    
    // Test the teams API
    console.log('\nTesting /api/teams endpoint...')
    const teamsResponse = await fetch('http://localhost:3001/api/teams', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (teamsResponse.ok) {
      const data = await teamsResponse.json()
      console.log('✅ Teams API working! Found', data.teams.length, 'teams')
    } else {
      console.log('❌ Teams API failed:', teamsResponse.status, await teamsResponse.text())
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()