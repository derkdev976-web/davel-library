import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding study spaces and printing services...')

  // Create study spaces
  const studySpaces = [
    {
      name: "Study Room A",
      description: "Quiet study room perfect for individual study or small group work. Features natural lighting and comfortable seating.",
      capacity: 4,
      location: "Floor 2, Room 201",
      amenities: ["WiFi", "Whiteboard", "Power outlets", "Natural lighting"],
      hourlyRate: 5.00,
      isActive: true,
      isAvailable: true
    },
    {
      name: "Study Room B",
      description: "Larger study room ideal for group projects and collaborative work. Equipped with presentation equipment.",
      capacity: 6,
      location: "Floor 2, Room 202",
      amenities: ["WiFi", "Projector", "Whiteboard", "Power outlets", "Conference table"],
      hourlyRate: 8.00,
      isActive: true,
      isAvailable: true
    },
    {
      name: "Study Room C",
      description: "Intimate study space perfect for focused individual work. Features soundproofing for maximum concentration.",
      capacity: 2,
      location: "Floor 3, Room 301",
      amenities: ["WiFi", "Soundproofing", "Power outlets", "Desk lamp"],
      hourlyRate: 3.50,
      isActive: true,
      isAvailable: true
    },
    {
      name: "Study Room D",
      description: "Modern study room with advanced technology and flexible seating arrangements.",
      capacity: 8,
      location: "Floor 1, Room 101",
      amenities: ["WiFi", "Smart board", "Power outlets", "Flexible seating", "Coffee machine"],
      hourlyRate: 10.00,
      isActive: true,
      isAvailable: true
    },
    {
      name: "Study Room E",
      description: "Quiet corner study space with comfortable armchairs and reading lamps.",
      capacity: 3,
      location: "Floor 3, Room 302",
      amenities: ["WiFi", "Reading lamps", "Power outlets", "Comfortable seating"],
      hourlyRate: 4.00,
      isActive: true,
      isAvailable: true
    }
  ]

  for (const space of studySpaces) {
    await prisma.studySpace.upsert({
      where: { name: space.name },
      update: space,
      create: space
    })
    console.log(`✅ Created/updated study space: ${space.name}`)
  }

  // Create print services
  const printServices = [
    {
      name: "Standard Printing",
      description: "Basic black and white printing service for documents, essays, and reports.",
      pricePerPage: 0.10,
      colorPrice: 0.25,
      paperSizes: ["A4", "Letter", "Legal"],
      paperTypes: ["Standard", "Recycled"],
      maxPages: 100,
      turnaroundTime: "24 hours",
      isActive: true
    },
    {
      name: "Color Printing",
      description: "High-quality color printing for presentations, posters, and visual materials.",
      pricePerPage: 0.15,
      colorPrice: 0.50,
      paperSizes: ["A4", "A3", "Letter", "Legal"],
      paperTypes: ["Standard", "Glossy", "Matte"],
      maxPages: 50,
      turnaroundTime: "48 hours",
      isActive: true
    },
    {
      name: "Large Format Printing",
      description: "Printing for posters, banners, and large documents up to A1 size.",
      pricePerPage: 2.00,
      colorPrice: 3.00,
      paperSizes: ["A3", "A2", "A1", "A0"],
      paperTypes: ["Standard", "Glossy", "Matte", "Cardstock"],
      maxPages: 10,
      turnaroundTime: "72 hours",
      isActive: true
    },
    {
      name: "Thesis Printing",
      description: "Specialized printing service for academic theses and dissertations with binding options.",
      pricePerPage: 0.08,
      colorPrice: 0.20,
      paperSizes: ["A4", "Letter"],
      paperTypes: ["Standard", "Premium", "Archival"],
      maxPages: 500,
      turnaroundTime: "5 days",
      isActive: true
    },
    {
      name: "Express Printing",
      description: "Fast printing service for urgent documents with same-day pickup available.",
      pricePerPage: 0.20,
      colorPrice: 0.40,
      paperSizes: ["A4", "Letter"],
      paperTypes: ["Standard"],
      maxPages: 50,
      turnaroundTime: "2 hours",
      isActive: true
    }
  ]

  for (const service of printServices) {
    await prisma.printService.upsert({
      where: { name: service.name },
      update: service,
      create: service
    })
    console.log(`✅ Created/updated print service: ${service.name}`)
  }

  console.log('🎉 Study spaces and printing services seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding study spaces and printing services:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
