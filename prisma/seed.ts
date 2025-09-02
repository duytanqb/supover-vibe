import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default roles
  const roles = [
    { name: 'Super Admin', code: 'SUPER_ADMIN' as UserRole, description: 'Full system access' },
    { name: 'Admin', code: 'ADMIN' as UserRole, description: 'Administrative access' },
    { name: 'Seller', code: 'SELLER' as UserRole, description: 'Store and order management' },
    { name: 'Designer', code: 'DESIGNER' as UserRole, description: 'Design asset management' },
    { name: 'Fulfiller', code: 'FULFILLER' as UserRole, description: 'Factory operations' },
    { name: 'Finance', code: 'FINANCE' as UserRole, description: 'Financial operations' },
    { name: 'Support', code: 'SUPPORT' as UserRole, description: 'Customer support' },
    { name: 'Leader', code: 'LEADER' as UserRole, description: 'Team management' },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    })
  }

  // Create default permissions
  const permissions = [
    { name: 'Read Users', resource: 'users', action: 'read' },
    { name: 'Write Users', resource: 'users', action: 'write' },
    { name: 'Delete Users', resource: 'users', action: 'delete' },
    { name: 'Read Stores', resource: 'stores', action: 'read' },
    { name: 'Write Stores', resource: 'stores', action: 'write' },
    { name: 'Delete Stores', resource: 'stores', action: 'delete' },
    { name: 'Read Orders', resource: 'orders', action: 'read' },
    { name: 'Write Orders', resource: 'orders', action: 'write' },
    { name: 'Delete Orders', resource: 'orders', action: 'delete' },
    { name: 'Read Finance', resource: 'finance', action: 'read' },
    { name: 'Write Finance', resource: 'finance', action: 'write' },
    { name: 'Read Reports', resource: 'reports', action: 'read' },
    { name: 'Read Settings', resource: 'settings', action: 'read' },
    { name: 'Write Settings', resource: 'settings', action: 'write' },
    { name: 'Delete Settings', resource: 'settings', action: 'delete' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { 
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        }
      },
      update: {},
      create: permission,
    })
  }

  // Create sample teams
  const teams = [
    { name: 'North America Team', code: 'NA_TEAM', description: 'North American operations', region: 'North America' },
    { name: 'Europe Team', code: 'EU_TEAM', description: 'European operations', region: 'Europe' },
    { name: 'Asia Pacific Team', code: 'APAC_TEAM', description: 'Asia Pacific operations', region: 'APAC' },
    { name: 'Design Team', code: 'DESIGN_TEAM', description: 'Creative design team', region: 'Global' },
  ]

  for (const team of teams) {
    await prisma.team.upsert({
      where: { code: team.code },
      update: {},
      create: team,
    })
  }

  // Create sample users with random roles
  const sampleUsers = [
    { name: 'Super Admin', email: 'superadmin@dragonmedia.com', role: 'SUPER_ADMIN' as UserRole, teamCode: 'NA_TEAM' },
    { name: 'John Admin', email: 'admin@dragonmedia.com', role: 'ADMIN' as UserRole, teamCode: 'NA_TEAM' },
    { name: 'Sarah Seller', email: 'sarah@dragonmedia.com', role: 'SELLER' as UserRole, teamCode: 'NA_TEAM' },
    { name: 'Mike Designer', email: 'mike@dragonmedia.com', role: 'DESIGNER' as UserRole, teamCode: 'DESIGN_TEAM' },
    { name: 'Anna Fulfiller', email: 'anna@dragonmedia.com', role: 'FULFILLER' as UserRole, teamCode: 'EU_TEAM' },
    { name: 'David Finance', email: 'david@dragonmedia.com', role: 'FINANCE' as UserRole, teamCode: 'NA_TEAM' },
    { name: 'Lisa Support', email: 'lisa@dragonmedia.com', role: 'SUPPORT' as UserRole, teamCode: 'APAC_TEAM' },
    { name: 'Tom Leader', email: 'tom@dragonmedia.com', role: 'LEADER' as UserRole, teamCode: 'EU_TEAM' },
    { name: 'Emma Seller', email: 'emma@dragonmedia.com', role: 'SELLER' as UserRole, teamCode: 'APAC_TEAM' },
    { name: 'Chris Designer', email: 'chris@dragonmedia.com', role: 'DESIGNER' as UserRole, teamCode: 'DESIGN_TEAM' },
    { name: 'Rachel Fulfiller', email: 'rachel@dragonmedia.com', role: 'FULFILLER' as UserRole, teamCode: 'NA_TEAM' },
  ]

  const hashedPassword = await bcrypt.hash('password123', 12)

  for (const userData of sampleUsers) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        username: userData.email.split('@')[0],
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        emailVerified: new Date(),
      },
    })

    // Assign role
    const role = await prisma.role.findUnique({
      where: { code: userData.role }
    })

    if (role) {
      await prisma.userRoles.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          }
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      })
    }

    // Assign to team
    const team = await prisma.team.findUnique({
      where: { code: userData.teamCode }
    })

    if (team) {
      await prisma.teamMember.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          teamId: team.id,
          isLeader: userData.role === 'LEADER',
        },
      })
    }
  }

  // Assign permissions to roles
  const rolePermissions = [
    // SUPER_ADMIN gets all permissions
    { roleCode: 'SUPER_ADMIN', permissions: ['users.read', 'users.write', 'users.delete', 'stores.read', 'stores.write', 'stores.delete', 'orders.read', 'orders.write', 'orders.delete', 'finance.read', 'finance.write', 'reports.read', 'settings.read', 'settings.write', 'settings.delete'] },
    // ADMIN gets most permissions except settings
    { roleCode: 'ADMIN', permissions: ['users.read', 'users.write', 'stores.read', 'stores.write', 'orders.read', 'orders.write', 'finance.read', 'reports.read'] },
    // SELLER gets store and order permissions
    { roleCode: 'SELLER', permissions: ['stores.read', 'stores.write', 'orders.read', 'orders.write'] },
    // DESIGNER gets limited permissions
    { roleCode: 'DESIGNER', permissions: ['orders.read'] },
    // FULFILLER gets order and production permissions
    { roleCode: 'FULFILLER', permissions: ['orders.read', 'orders.write'] },
    // FINANCE gets financial permissions
    { roleCode: 'FINANCE', permissions: ['finance.read', 'finance.write', 'reports.read'] },
    // SUPPORT gets read permissions
    { roleCode: 'SUPPORT', permissions: ['users.read', 'orders.read'] },
    // LEADER gets team management permissions
    { roleCode: 'LEADER', permissions: ['users.read', 'orders.read', 'reports.read'] },
  ]

  for (const rolePermission of rolePermissions) {
    const role = await prisma.role.findUnique({
      where: { code: rolePermission.roleCode as UserRole }
    })

    if (role) {
      for (const permissionKey of rolePermission.permissions) {
        const [resource, action] = permissionKey.split('.')
        const permission = await prisma.permission.findUnique({
          where: {
            resource_action: { resource, action }
          }
        })

        if (permission) {
          await prisma.rolePermissions.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            }
          })
        }
      }
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })