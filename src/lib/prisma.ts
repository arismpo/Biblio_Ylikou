// C:\Biblio_Ylikou_NEW\src\lib\prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Δημιουργία connection pool για PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

// Δημιουργία adapter
const adapter = new PrismaPg(pool)

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma