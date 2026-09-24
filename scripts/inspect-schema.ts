// scripts/inspect-schema.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function inspectSchema() {
    const year = 2026

    try {
        console.log(`🔍 Inspecting schema year_${year}...`)

        // Get all tables in the schema
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ${`year_${year}`}
            ORDER BY table_name
        `

        console.log('📋 Tables found:')
        console.log(tables)

        // For each table, get column info
        for (const table of tables as any[]) {
            console.log(`\n📋 Table: ${table.table_name}`)
            const columns = await prisma.$queryRaw`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = ${`year_${year}`}
                AND table_name = ${table.table_name}
                ORDER BY ordinal_position
            `
            console.log(columns)
        }

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

inspectSchema()