// C:\Biblio_Ylikou_NEW\src\utils\schemaManager.ts
import prisma from '@/lib/prisma'

// ✅ Ονομασία schema για κάθε έτος
export const getSchemaName = (year: number): string => `year_${year}`

// ✅ Έλεγχος αν υπάρχει schema - ΒΕΛΤΙΩΜΕΝΗ ΕΚΔΟΣΗ
export const schemaExists = async (year: number): Promise<boolean> => {
    const schemaName = getSchemaName(year)
    try {
        const result = await prisma.$queryRawUnsafe(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = '${schemaName}'
        `)
        return (result as any[]).length > 0
    } catch (error) {
        console.error('Error checking schema existence:', error)
        return false
    }
}


// ✅ Δημιουργία schema
export const createSchema = async (year: number): Promise<string> => {
    const schemaName = getSchemaName(year)

    const exists = await schemaExists(year)
    if (exists) {
        console.log(`Schema ${schemaName} already exists`)
        return schemaName
    }

    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
    console.log(`✅ Schema ${schemaName} created`)
    return schemaName
}


// ✅ Δημιουργία όλων των πινάκων σε ένα schema
export const createTables = async (year: number): Promise<boolean> => {
    const schemaName = getSchemaName(year)

    console.log(`📊 Creating tables in schema ${schemaName}`)

    // Πίνακας Chapter
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ${schemaName}."Chapter" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            page TEXT,
            year INTEGER NOT NULL,
            position INTEGER DEFAULT 0,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `)

    // Πίνακας Onomastiko
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ${schemaName}."Onomastiko" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            number VARCHAR(50),
            position INTEGER DEFAULT 0,
            page INTEGER,
            infos TEXT,
            highlighted BOOLEAN DEFAULT false,
            "chapterId" INTEGER REFERENCES ${schemaName}."Chapter"(id) ON DELETE CASCADE,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `)

    // Πίνακας Record
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ${schemaName}."Record" (
            id SERIAL PRIMARY KEY,
            aa INTEGER,
            month VARCHAR(50),
            day INTEGER,
            description TEXT,
            document TEXT,
            year INTEGER NOT NULL,
            "chapterId" INTEGER REFERENCES ${schemaName}."Chapter"(id) ON DELETE CASCADE,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `)

    // Πίνακας Entry
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ${schemaName}."Entry" (
            id SERIAL PRIMARY KEY,
            debit DECIMAL(10,2),
            credit DECIMAL(10,2),
            "recordId" INTEGER REFERENCES ${schemaName}."Record"(id) ON DELETE CASCADE,
            "onomastikoId" INTEGER REFERENCES ${schemaName}."Onomastiko"(id) ON DELETE CASCADE,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `)

    // Πίνακας Attachment
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ${schemaName}."Attachment" (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            "mimeType" VARCHAR(100),
            size INTEGER,
            data BYTEA,
            "recordId" INTEGER REFERENCES ${schemaName}."Record"(id) ON DELETE CASCADE,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `)

    // ✅ Πίνακας yearly_totals (με μικρά - συνεπής με το year_2025)
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ${schemaName}.yearly_totals (
            id SERIAL PRIMARY KEY,
            year INTEGER NOT NULL,
            "totalDebit" DECIMAL(10,2) DEFAULT 0,
            "totalCredit" DECIMAL(10,2) DEFAULT 0,
            balance DECIMAL(10,2) DEFAULT 0,
            "chapterId" INTEGER REFERENCES ${schemaName}."Chapter"(id) ON DELETE CASCADE,
            "onomastikoId" INTEGER REFERENCES ${schemaName}."Onomastiko"(id) ON DELETE CASCADE,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `)

    console.log(`✅ Tables created in ${schemaName}`)
    return true
}



// ✅ Εναλλαγή σε schema (set search path)
export const setActiveSchema = async (year: number): Promise<string> => {
    const schemaName = getSchemaName(year)

    const exists = await schemaExists(year)
    if (!exists) {
        console.log(`⚠️ Schema ${schemaName} does not exist. Creating...`)
        await createSchema(year)
        await createTables(year)
    }

    await prisma.$executeRawUnsafe(`SET search_path TO ${schemaName}, public`)
    console.log(`🔀 Switched to schema: ${schemaName}`)
    return schemaName
}

// ✅ Λήψη όλων των schemas (ετών)
export const getAllSchemas = async (): Promise<number[]> => {
    try {
        const result = await prisma.$queryRaw`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name LIKE 'year_%'
            ORDER BY schema_name
        `
        return (result as any[]).map(r => {
            const match = r.schema_name.match(/year_(\d+)/)
            return match ? parseInt(match[1]) : null
        }).filter(year => year !== null).sort((a, b) => a - b)
    } catch (error) {
        console.error('Error getting schemas:', error)
        return []
    }
}

// ✅ Διαγραφή schema
export const deleteSchema = async (year: number): Promise<boolean> => {
    const schemaName = getSchemaName(year)
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`)
    console.log(`🗑️ Schema ${schemaName} deleted`)
    return true
}

// ✅ Αρχικοποίηση: Δημιουργία schema για το τρέχον έτος
export const initializeYear = async (year: number): Promise<number> => {
    const exists = await schemaExists(year)
    if (!exists) {
        await createSchema(year)
        await createTables(year)
        console.log(`✅ Initialized year ${year} with schema year_${year}`)
    }
    return year
}