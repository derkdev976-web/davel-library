import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding services data...')

  // Create sample study spaces
  const studySpaces = [
    {
      name: "Quiet Study Room A",
      description: "Individual study space with desk, chair, and power outlets. Perfect for focused studying.",
      capacity: 1,
      location: "Main Library - 2nd Floor",
      amenities: ["WiFi", "Power Outlets", "Desk Lamp"],
      hourlyRate: 5.00,
      image: null
    },
    {
      name: "Group Study Room B",
      description: "Collaborative space with large table, whiteboard, and presentation screen.",
      capacity: 6,
      location: "Main Library - 3rd Floor",
      amenities: ["WiFi", "Power Outlets", "Whiteboard", "Monitor", "Projector"],
      hourlyRate: 15.00,
      image: null
    },
    {
      name: "Computer Lab C",
      description: "High-tech study space with computers, printers, and software access.",
      capacity: 8,
      location: "Science Library - 1st Floor",
      amenities: ["WiFi", "Power Outlets", "Computers", "Printers", "Software Access"],
      hourlyRate: 20.00,
      image: null
    },
    {
      name: "Reading Nook D",
      description: "Cozy corner with comfortable seating and natural lighting.",
      capacity: 2,
      location: "Main Library - 1st Floor",
      amenities: ["WiFi", "Natural Light", "Comfortable Seating"],
      hourlyRate: 8.00,
      image: null
    }
  ]

  for (const space of studySpaces) {
    try {
      await prisma.studySpace.create({
        data: space
      })
    } catch (error) {
      // Skip if already exists
      console.log(`Study space "${space.name}" already exists, skipping...`)
    }
  }

  // Create sample print services
  const printServices = [
    {
      name: "Standard Black & White",
      description: "High-quality black and white printing for documents and text.",
      pricePerPage: 0.10,
      colorPrice: 0.00,
      paperSizes: ["A4", "Letter", "Legal"],
      paperTypes: ["Standard", "Recycled"],
      maxPages: 100,
      turnaroundTime: "Same day"
    },
    {
      name: "Color Printing",
      description: "Vibrant color printing for presentations, photos, and graphics.",
      pricePerPage: 0.15,
      colorPrice: 0.25,
      paperSizes: ["A4", "Letter", "A3"],
      paperTypes: ["Standard", "Glossy", "Matte"],
      maxPages: 50,
      turnaroundTime: "24 hours"
    },
    {
      name: "Large Format Printing",
      description: "Posters, banners, and large format documents up to A0 size.",
      pricePerPage: 2.00,
      colorPrice: 3.00,
      paperSizes: ["A3", "A2", "A1", "A0"],
      paperTypes: ["Standard", "Glossy", "Matte", "Photo"],
      maxPages: 10,
      turnaroundTime: "48 hours"
    },
    {
      name: "Binding Services",
      description: "Professional binding for reports, theses, and presentations.",
      pricePerPage: 0.05,
      colorPrice: 0.00,
      paperSizes: ["A4", "Letter"],
      paperTypes: ["Standard"],
      maxPages: 200,
      turnaroundTime: "24 hours"
    }
  ]

  for (const service of printServices) {
    try {
      await prisma.printService.create({
        data: service
      })
    } catch (error) {
      // Skip if already exists
      console.log(`Print service "${service.name}" already exists, skipping...`)
    }
  }

  console.log('Services data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
