import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUsernames() {
  try {
    const users = await prisma.user.findMany({
      where: {
        username: null
      }
    })

    console.log(`Found ${users.length} users without usernames`)

    for (const user of users) {
      // Generate username from email (part before @)
      const baseUsername = user.email.split('@')[0].toLowerCase()
      let username = baseUsername
      let counter = 1

      // Check if username already exists and add number if needed
      while (true) {
        const existing = await prisma.user.findUnique({
          where: { username }
        })
        
        if (!existing) break
        
        username = `${baseUsername}${counter}`
        counter++
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      })

      console.log(`Updated user ${user.email} with username: ${username}`)
    }

    console.log('All usernames updated successfully!')
  } catch (error) {
    console.error('Error updating usernames:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUsernames()