import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Δημιουργία ενός κεφαλαίου για το 2025
  const chapter = await prisma.chapter.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Α.Α.Α.',
      description: 'ΥΓΕΙΟΝΟΜΙΚΟ ΥΛΙΚΟ',
      year: 2025,
      page: '32,34,36,38,40',
      pageProcessingType: 'merge_rows'
    }
  })

  console.log(`✅ Created chapter: ${chapter.name}`)

  // Δημιουργία ονομαστικών
  const onomastikaData = [
    { name: 'Α.Α.Α.', number: '1', position: 0 },
    { name: 'Β.Α.Γ.', number: '2', position: 1 },
    { name: 'Γ.Α.Η.', number: '3', position: 2 },
    { name: 'Δ.Ι.Π.', number: '4', position: 3 },
    { name: 'Ε.Κ.Π.', number: '5', position: 4 },
    { name: 'Σ.Τ.Ρ.', number: '6', position: 5 },
  ]

  for (const data of onomastikaData) {
    await prisma.onomastiko.upsert({
      where: { id: 0 },
      update: {},
      create: {
        ...data,
        chapterId: chapter.id,
        page: 32
      }
    })
  }

  console.log(`✅ Created ${onomastikaData.length} onomastika`)

  console.log('🌱 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })