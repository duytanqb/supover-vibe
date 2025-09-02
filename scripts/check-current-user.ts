import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

// This is a sample token - replace with actual token from browser
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWYxd2Z1NHUwMDB5amtuMmM2a3hjOHlnIiwiaWF0IjoxNzU2ODEyOTcxLCJleHAiOjE3NTc0MTc3NzF9.L7EXtcKM-jJrJvLIMJXKhxLx0Qh1F4bJ7-OX0e5bLqw'

async function checkCurrentUser() {
  try {
    // Decode the token
    const decoded = jwt.verify(sampleToken, process.env.JWT_SECRET || 'your-secret-key-here') as any
    console.log('Decoded token:', decoded)
    
    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        teamMember: {
          include: {
            team: true
          }
        }
      }
    })
    
    if (user) {
      console.log('\nUser details:')
      console.log('- ID:', user.id)
      console.log('- Name:', user.name)
      console.log('- Email:', user.email)
      console.log('- Roles:', user.userRoles.map(ur => `${ur.role.name} (${ur.role.code})`).join(', '))
      console.log('- Team:', user.teamMember?.team?.name || 'No team')
      console.log('- Active:', user.isActive)
      
      // Check permissions
      const roles = user.userRoles.map(ur => ur.role.code)
      console.log('\nPermission checks:')
      console.log('- Has ADMIN:', roles.includes('ADMIN'))
      console.log('- Has SUPER_ADMIN:', roles.includes('SUPER_ADMIN'))
      console.log('- Has SELLER:', roles.includes('SELLER'))
      console.log('- Has LEADER:', roles.includes('LEADER'))
      
      // Generate a proper admin token if this user is not admin
      if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
        console.log('\n⚠️  This user does not have admin permissions!')
        console.log('Finding an admin user to generate a proper token...')
        
        const adminUser = await prisma.user.findFirst({
          where: {
            userRoles: {
              some: {
                role: {
                  code: {
                    in: ['SUPER_ADMIN', 'ADMIN']
                  }
                }
              }
            }
          }
        })
        
        if (adminUser) {
          const adminToken = jwt.sign(
            { 
              userId: adminUser.id,
              email: adminUser.email
            },
            process.env.JWT_SECRET || 'your-secret-key-here',
            { expiresIn: '7d' }
          )
          
          console.log('\n✅ Generated admin token for:', adminUser.email)
          console.log('\nRun this in your browser console to login as admin:')
          console.log(`localStorage.setItem('token', '${adminToken}'); window.location.reload();`)
        }
      }
    } else {
      console.log('User not found!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUser()