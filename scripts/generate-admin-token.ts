import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

async function generateAdminToken() {
  try {
    // Find a super admin user
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
      console.log('No SUPER_ADMIN user found. Looking for ADMIN user...')
      
      const adminUser = await prisma.user.findFirst({
        where: {
          userRoles: {
            some: {
              role: {
                code: 'ADMIN'
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
        console.log('No admin users found!')
        return
      }
    }
    
    console.log('Found admin user:')
    console.log('- Name:', adminUser.name)
    console.log('- Email:', adminUser.email)
    console.log('- Roles:', adminUser.userRoles.map(ur => ur.role.code).join(', '))
    
    // Generate token with the correct secret
    const token = jwt.sign(
      { 
        userId: adminUser.id,
        email: adminUser.email
      },
      'your-jwt-secret-key-here-change-in-production', // Using the actual JWT_SECRET from .env
      { expiresIn: '7d' }
    )
    
    console.log('\n✅ Generated admin token successfully!')
    console.log('\n📋 Copy and paste this command in your browser console:')
    console.log('\n-----------------------------------------------------------')
    console.log(`localStorage.setItem('token', '${token}'); window.location.reload();`)
    console.log('-----------------------------------------------------------\n')
    
  } catch (error) {
    console.error('Error generating token:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateAdminToken()