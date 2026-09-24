// C:\Biblio_Ylikou_NEW\scripts\delete-year-2026.ts
import prisma from '../src/lib/prisma'

async function main() {
    try {
        console.log('🗑️ Deleting schema year_2026...')
        await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS year_2026 CASCADE`)
        console.log('✅ Schema year_2026 deleted successfully')
    } catch (error) {
        console.error('❌ Error deleting schema:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()