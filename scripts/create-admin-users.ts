import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUsers() {
  try {
    console.log('Creating admin and librarian users...')

    // Hash passwords
    const adminPassword = await bcrypt.hash('myDavellibraAdminiCITIE123@', 12)
    const librarianPassword = await bcrypt.hash('myDavellibraLooktoCITIES456@', 12)

    // Create Admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'davel@admin.library.com' },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
        name: 'Davel Admin'
      },
      create: {
        email: 'davel@admin.library.com',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
        name: 'Davel Admin',
        emailVerified: new Date()
      }
    })

    console.log('✅ Admin user created:', adminUser.email)

    // Create Librarian user
    const librarianUser = await prisma.user.upsert({
      where: { email: 'librarian@davel.library.com' },
      update: {
        password: librarianPassword,
        role: 'LIBRARIAN',
        isActive: true,
        name: 'Davel Librarian'
      },
      create: {
        email: 'librarian@davel.library.com',
        password: librarianPassword,
        role: 'LIBRARIAN',
        isActive: true,
        name: 'Davel Librarian',
        emailVerified: new Date()
      }
    })

    console.log('✅ Librarian user created:', librarianUser.email)

    // Create a test member user
    const memberPassword = await bcrypt.hash('member123', 12)
    const memberUser = await prisma.user.upsert({
      where: { email: 'member@davel.library.com' },
      update: {
        password: memberPassword,
        role: 'MEMBER',
        isActive: true,
        name: 'Test Member'
      },
      create: {
        email: 'member@davel.library.com',
        password: memberPassword,
        role: 'MEMBER',
        isActive: true,
        name: 'Test Member',
        emailVerified: new Date()
      }
    })

    console.log('✅ Test member user created:', memberUser.email)

    console.log('\n🎉 All users created successfully!')
    console.log('\nLogin credentials:')
    console.log('Admin: davel@admin.library.com / myDavellibraAdminiCITIE123@')
    console.log('Librarian: librarian@davel.library.com / myDavellibraLooktoCITIES456@')
    console.log('Member: member@davel.library.com / member123')

  } catch (error) {
    console.error('❌ Error creating users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUsers()
