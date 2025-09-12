import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create an admin user if one doesn't exist
  const adminEmail = process.env.ADMIN_EMAIL || "davel@admin.library.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "myDavellibraAdminiCITIE123@" // This should be hashed in a real app

  // Hash the password for the admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10) // Hash the password

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Davel Admin",
        role: "ADMIN", // Corrected to uppercase "ADMIN"
        password: hashedPassword, // Store the hashed password
        emailVerified: new Date(), // Mark as verified for direct login
      },
    })
    console.log(`Admin user with email ${adminEmail} created.`)
  } else {
    // Update existing admin user's role and password if it's not already set
    // Check if role is not 'ADMIN' or if password needs update
    if (existingAdmin.role !== "ADMIN" || existingAdmin.password !== hashedPassword) {
      // Corrected to uppercase "ADMIN"
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN", // Corrected to uppercase "ADMIN"
          password: hashedPassword,
        },
      })
      console.log(`Admin user with email ${adminEmail} updated.`)
    } else {
      console.log(`Admin user with email ${adminEmail} already exists and is up to date.`)
    }
  }

  // Create a librarian user
  const librarianEmail = process.env.LIBRARIAN_EMAIL || "librarian@davel.library.com"
  const librarianPassword = process.env.LIBRARIAN_PASSWORD || "myDavellibraLooktoCITIES456@"
  const librarianHashed = await bcrypt.hash(librarianPassword, 10)
  const existingLibrarian = await prisma.user.findUnique({ where: { email: librarianEmail } })
  if (!existingLibrarian) {
    await prisma.user.create({
      data: {
        email: librarianEmail,
        name: "Davel Librarian",
        role: "LIBRARIAN",
        password: librarianHashed,
        emailVerified: new Date(),
      },
    })
    console.log(`Librarian user with email ${librarianEmail} created.`)
  } else {
    // Update existing librarian user's password if needed
    if (existingLibrarian.password !== librarianHashed) {
      await prisma.user.update({
        where: { email: librarianEmail },
        data: {
          password: librarianHashed,
        },
      })
      console.log(`Librarian user with email ${librarianEmail} updated.`)
    } else {
      console.log(`Librarian user with email ${librarianEmail} already exists and is up to date.`)
    }
  }

  // Create a member user
  const memberEmail = "davellibrary37@gmail.com"
  const memberPassword = "member123"
  const memberHashed = await bcrypt.hash(memberPassword, 10)
  const existingMember = await prisma.user.findUnique({ where: { email: memberEmail } })
  if (!existingMember) {
    await prisma.user.create({
      data: {
        email: memberEmail,
        name: "Sipho Zwane",
        role: "MEMBER",
        password: memberHashed,
        emailVerified: new Date(),
      },
    })
    console.log(`Member user with email ${memberEmail} created.`)
  } else {
    // Update existing member user's password if needed
    if (existingMember.password !== memberHashed) {
      await prisma.user.update({
        where: { email: memberEmail },
        data: {
          password: memberHashed,
        },
      })
      console.log(`Member user with email ${memberEmail} updated.`)
    } else {
      console.log(`Member user with email ${memberEmail} already exists and is up to date.`)
    }
  }

  // Seed books with Dewey Decimal categories (including electronic books)
  const books = [
    {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      isbn: "9780262033848",
      genre: ["Computer Science", "Algorithms"],
      deweyDecimal: "005.1",
      isElectronic: false,
      summary: "Comprehensive guide to modern algorithms.",
      coverImage: "/images/books/intro-to-algorithms.jpg",
      totalCopies: 8,
      availableCopies: 6,
      publishedYear: 2009,
      publisher: "MIT Press",
      language: "English",
      pages: 1312,
    },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      isbn: "9780553380163",
      genre: ["Science", "Physics"],
      deweyDecimal: "523.1",
      isElectronic: true,
      summary: "From the Big Bang to black holes.",
      coverImage: "/images/books/brief-history-time.jpg",
      totalCopies: 5,
      availableCopies: 5,
      publishedYear: 1998,
      publisher: "Bantam",
      language: "English",
      pages: 212,
      digitalFile: "/ebooks/brief-history-time.pdf",
    },
    {
      title: "The Art of Computer Programming, Vol. 1",
      author: "Donald E. Knuth",
      isbn: "9780201558029",
      genre: ["Computer Science"],
      deweyDecimal: "005.1",
      isElectronic: false,
      summary: "Seminal work on computer algorithms and programming.",
      coverImage: "/images/books/taocp1.jpg",
      totalCopies: 3,
      availableCopies: 2,
      publishedYear: 2011,
      publisher: "Addison-Wesley",
      language: "English",
      pages: 672,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      genre: ["Software Engineering"],
      deweyDecimal: "005.1",
      isElectronic: true,
      summary: "A Handbook of Agile Software Craftsmanship.",
      coverImage: "/images/books/clean-code.jpg",
      totalCopies: 10,
      availableCopies: 8,
      publishedYear: 2008,
      publisher: "Prentice Hall",
      language: "English",
      pages: 464,
      digitalFile: "/ebooks/clean-code.epub",
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      genre: ["Fiction", "Classic Literature"],
      deweyDecimal: "813.52",
      isElectronic: true,
      summary: "A classic American novel set in the Jazz Age.",
      coverImage: "/images/books/great-gatsby.jpg",
      totalCopies: 15,
      availableCopies: 12,
      publishedYear: 1925,
      publisher: "Scribner",
      language: "English",
      pages: 180,
      digitalFile: "/ebooks/great-gatsby.pdf",
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "9780061120084",
      genre: ["Fiction", "Classic Literature"],
      deweyDecimal: "813.54",
      isElectronic: true,
      summary: "A gripping tale of racial injustice and childhood innocence.",
      coverImage: "/images/books/to-kill-mockingbird.jpg",
      totalCopies: 12,
      availableCopies: 10,
      publishedYear: 1960,
      publisher: "J.B. Lippincott & Co.",
      language: "English",
      pages: 281,
      digitalFile: "/ebooks/to-kill-mockingbird.pdf",
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      genre: ["Fiction", "Dystopian"],
      deweyDecimal: "823.912",
      isElectronic: true,
      summary: "A dystopian social science fiction novel.",
      coverImage: "/images/books/1984.jpg",
      totalCopies: 8,
      availableCopies: 6,
      publishedYear: 1949,
      publisher: "Secker & Warburg",
      language: "English",
      pages: 328,
      digitalFile: "/ebooks/1984.pdf",
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "9780141439518",
      genre: ["Fiction", "Romance", "Classic Literature"],
      deweyDecimal: "823.7",
      isElectronic: true,
      summary: "A romantic novel of manners written by Jane Austen.",
      coverImage: "/images/books/pride-prejudice.jpg",
      totalCopies: 10,
      availableCopies: 8,
      publishedYear: 1813,
      publisher: "T. Egerton, Whitehall",
      language: "English",
      pages: 432,
      digitalFile: "/ebooks/pride-prejudice.pdf",
    },
    {
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      isbn: "9780062316097",
      genre: ["History"],
      deweyDecimal: "909",
      isElectronic: false,
      summary: "Explores the history and impact of Homo sapiens.",
      coverImage: "/images/books/sapiens.jpg",
      totalCopies: 7,
      availableCopies: 7,
      publishedYear: 2015,
      publisher: "Harper",
      language: "English",
      pages: 498,
    },
  ]

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn! },
      update: {
        ...book,
        genre: Array.isArray(book.genre) ? book.genre.join(', ') : book.genre
      },
      create: {
        ...book,
        genre: Array.isArray(book.genre) ? book.genre.join(', ') : book.genre
      },
    })
  }
  console.log(`Seeded ${books.length} books.`)

  // Seed some membership applications
  const applications = [
    {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("1990-05-15"),
      gender: "MALE" as const,
      email: "john.doe@example.com",
      phone: "+15555550123",
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      country: "USA",
      hasDisability: false,
      preferredGenres: ["Fiction", "History"],
      readingFrequency: "WEEKLY" as const,
      subscribeNewsletter: true,
      status: "PENDING" as const,
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: new Date("1985-09-22"),
      gender: "FEMALE" as const,
      email: "jane.smith@example.com",
      phone: "+15555559876",
      street: "456 Oak Ave",
      city: "Madison",
      state: "WI",
      zipCode: "53703",
      country: "USA",
      hasDisability: true,
      disabilityDetails: "Wheelchair access",
      preferredGenres: ["Science", "Biography"],
      readingFrequency: "MONTHLY" as const,
      subscribeNewsletter: false,
      status: "UNDER_REVIEW" as const,
    },
  ]

  for (const app of applications) {
    await prisma.membershipApplication.upsert({
      where: { email: app.email },
      update: {
        ...app,
        preferredGenres: Array.isArray(app.preferredGenres) ? app.preferredGenres.join(', ') : app.preferredGenres
      },
      create: {
        ...app,
        preferredGenres: Array.isArray(app.preferredGenres) ? app.preferredGenres.join(', ') : app.preferredGenres
      },
    })
  }
  console.log(`Seeded ${applications.length} membership applications.`)

  // Create additional test users
  const testUsers = [
    {
      email: "test.member1@example.com",
      name: "Alice Johnson",
      role: "MEMBER" as const,
      password: await bcrypt.hash("password123", 10),
    },
    {
      email: "test.member2@example.com",
      name: "Bob Wilson",
      role: "MEMBER" as const,
      password: await bcrypt.hash("password123", 10),
    },
    {
      email: "test.librarian@example.com",
      name: "Carol Davis",
      role: "LIBRARIAN" as const,
      password: await bcrypt.hash("password123", 10),
    },
  ]

  for (const userData of testUsers) {
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } })
    if (!existingUser) {
      await prisma.user.create({
        data: {
          ...userData,
          emailVerified: new Date(),
        },
      })
      console.log(`Test user ${userData.email} created.`)
    }
  }

  // Create some test reservations
  const testReservations = [
    {
      userId: (await prisma.user.findUnique({ where: { email: "davellibrary37@gmail.com" } }))?.id,
      bookId: (await prisma.book.findFirst({ where: { title: "Clean Code" } }))?.id,
      status: "APPROVED" as const,
      reservedAt: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      userId: (await prisma.user.findUnique({ where: { email: "test.member1@example.com" } }))?.id,
      bookId: (await prisma.book.findFirst({ where: { title: "Sapiens: A Brief History of Humankind" } }))?.id,
      status: "PENDING" as const,
      reservedAt: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const reservationData of testReservations) {
    if (reservationData.userId && reservationData.bookId) {
      const existingReservation = await prisma.bookReservation.findFirst({
        where: {
          userId: reservationData.userId,
          bookId: reservationData.bookId,
        },
      })
      if (!existingReservation) {
        await prisma.bookReservation.create({
          data: {
            userId: reservationData.userId,
            bookId: reservationData.bookId,
            status: reservationData.status,
            reservedAt: reservationData.reservedAt,
            dueDate: reservationData.dueDate,
          },
        })
        console.log(`Test reservation created for user ${reservationData.userId}.`)
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect() // Corrected to $disconnect()
  })
