// scripts/migrate-year-2026.ts
import { Pool } from 'pg'

// OLD database (source)
const oldPool = new Pool({
    connectionString: 'postgresql://biblio_user:mpo13783@localhost:5432/biblio'
})

// NEW database (target)
const newPool = new Pool({
    connectionString: 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

async function migrateYear2026() {
    const sourceYear = 2026
    const targetSchema = `year_${sourceYear}`

    const oldClient = await oldPool.connect()
    const newClient = await newPool.connect()

    try {
        console.log(`🚀 Starting migration of year ${sourceYear} from OLD to NEW database...`)
        console.log(`📋 Source: OLD database (biblio) -> Target: NEW database (biblio_ylikou)`)
        console.log(`📋 Target schema: ${targetSchema}`)

        // 1. Drop target schema if it exists (clean slate)
        console.log(`\n[1/9] Dropping schema ${targetSchema} if it exists...`)
        await newClient.query(`DROP SCHEMA IF EXISTS "${targetSchema}" CASCADE`)
        console.log(`✅ Schema ${targetSchema} dropped (if it existed)`)

        // 2. Create target schema
        console.log(`\n[2/9] Creating schema ${targetSchema}...`)
        await newClient.query(`CREATE SCHEMA "${targetSchema}"`)
        console.log(`✅ Schema ${targetSchema} created`)

        // 3. Create tables based on NEW Prisma schema
        console.log(`\n[3/9] Creating tables based on NEW Prisma schema...`)

        // Create Chapter table
        await newClient.query(`
            CREATE TABLE "${targetSchema}"."Chapter" (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                page TEXT,
                year INTEGER NOT NULL,
                position INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('  ✅ Chapter table created')

        // Create Onomastiko table
        await newClient.query(`
            CREATE TABLE "${targetSchema}"."Onomastiko" (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                number TEXT,
                position INTEGER NOT NULL DEFAULT 0,
                page INTEGER,
                infos TEXT,
                highlighted BOOLEAN NOT NULL DEFAULT false,
                "chapterId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('  ✅ Onomastiko table created')

        // Create Record table
        await newClient.query(`
            CREATE TABLE "${targetSchema}"."Record" (
                id SERIAL PRIMARY KEY,
                aa INTEGER,
                month TEXT NOT NULL,
                day INTEGER NOT NULL,
                description TEXT NOT NULL,
                document TEXT,
                year INTEGER NOT NULL,
                "chapterId" INTEGER NOT NULL,
                page INTEGER,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('  ✅ Record table created')

        // Create Entry table
        await newClient.query(`
            CREATE TABLE "${targetSchema}"."Entry" (
                id SERIAL PRIMARY KEY,
                debit DOUBLE PRECISION,
                credit DOUBLE PRECISION,
                "recordId" INTEGER NOT NULL,
                "onomastikoId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('  ✅ Entry table created')

        // Create Attachment table
        await newClient.query(`
            CREATE TABLE "${targetSchema}"."Attachment" (
                id SERIAL PRIMARY KEY,
                filename TEXT NOT NULL,
                "mimeType" TEXT NOT NULL,
                size INTEGER NOT NULL,
                data BYTEA NOT NULL,
                "recordId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('  ✅ Attachment table created')

        // Create yearly_totals table
        await newClient.query(`
            CREATE TABLE "${targetSchema}".yearly_totals (
                id SERIAL PRIMARY KEY,
                year INTEGER NOT NULL,
                "chapterId" INTEGER NOT NULL,
                "onomastikoId" INTEGER NOT NULL,
                "totalDebit" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "totalCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
                balance DOUBLE PRECISION NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('  ✅ yearly_totals table created')

        // Create YearLock table
        await newClient.query(`
            CREATE TABLE "${targetSchema}"."YearLock" (
                year INTEGER PRIMARY KEY,
                locked BOOLEAN NOT NULL DEFAULT false,
                "lockedAt" TIMESTAMP(3),
                "lockedBy" TEXT
            )
        `)
        console.log('  ✅ YearLock table created')

        // 4. Get data from OLD database
        console.log(`\n[4/9] Copying data for year ${sourceYear}...`)

        // Copy Chapters
        console.log('  Copying Chapter data...')
        const chaptersResult = await oldClient.query(`
            SELECT * FROM "Chapter" WHERE year = $1
        `, [sourceYear])

        for (const chapter of chaptersResult.rows) {
            await newClient.query(`
                INSERT INTO "${targetSchema}"."Chapter" (
                    name, description, page, year, position, "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                chapter.name,
                chapter.description || null,
                chapter.page || null,
                chapter.year,
                chapter.position || 0,
                chapter.createdAt || new Date(),
                chapter.updatedAt || new Date()
            ])
        }
        console.log(`  ✅ ${chaptersResult.rows.length} chapters copied`)

        // Get mapping of old IDs to new IDs for chapters
        const chapterIdMap = new Map()
        const newChapters = await newClient.query(`
            SELECT id, name FROM "${targetSchema}"."Chapter"
        `)
        for (const oldChapter of chaptersResult.rows) {
            const newChapter = newChapters.rows.find(nc => nc.name === oldChapter.name)
            if (newChapter) {
                chapterIdMap.set(oldChapter.id, newChapter.id)
            }
        }

        // Copy Onomastika
        console.log('  Copying Onomastiko data...')
        const chapterIds = chaptersResult.rows.map(c => c.id)
        const onomastikaResult = await oldClient.query(`
            SELECT * FROM "Onomastiko" 
            WHERE "chapterId" = ANY($1::int[])
        `, [chapterIds])

        for (const onom of onomastikaResult.rows) {
            const newChapterId = chapterIdMap.get(onom.chapterId)
            if (!newChapterId) continue

            await newClient.query(`
                INSERT INTO "${targetSchema}"."Onomastiko" (
                    name, number, position, page, infos, highlighted, "chapterId", "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                onom.name,
                onom.number || null,
                onom.position || 0,
                onom.page || null,
                onom.infos || null,
                onom.highlighted || false,
                newChapterId,
                onom.createdAt || new Date(),
                onom.updatedAt || new Date()
            ])
        }
        console.log(`  ✅ ${onomastikaResult.rows.length} onomastika copied`)

        // Get mapping of old IDs to new IDs for onomastika
        const onomIdMap = new Map()
        const newOnomastika = await newClient.query(`
            SELECT id, name, "chapterId" FROM "${targetSchema}"."Onomastiko"
        `)

        for (const oldOnom of onomastikaResult.rows) {
            const newChapterId = chapterIdMap.get(oldOnom.chapterId)
            const newOnom = newOnomastika.rows.find(no =>
                no.name === oldOnom.name && no.chapterId === newChapterId
            )
            if (newOnom) {
                onomIdMap.set(oldOnom.id, newOnom.id)
            }
        }

        // Copy Records
        console.log('  Copying Record data...')
        const recordsResult = await oldClient.query(`
            SELECT * FROM "Record" WHERE year = $1
        `, [sourceYear])

        for (const record of recordsResult.rows) {
            const newChapterId = chapterIdMap.get(record.chapterId)
            if (!newChapterId) continue

            await newClient.query(`
                INSERT INTO "${targetSchema}"."Record" (
                    aa, month, day, description, document, year, "chapterId", page, "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                record.aa || null,
                record.month,
                record.day,
                record.description,
                record.document || null,
                record.year,
                newChapterId,
                record.page || null,
                record.createdAt || new Date(),
                record.updatedAt || new Date()
            ])
        }
        console.log(`  ✅ ${recordsResult.rows.length} records copied`)

        // Get mapping of old IDs to new IDs for records
        const recordIdMap = new Map()
        const newRecords = await newClient.query(`
            SELECT id, aa, description, "chapterId" FROM "${targetSchema}"."Record"
        `)

        for (const oldRecord of recordsResult.rows) {
            const newChapterId = chapterIdMap.get(oldRecord.chapterId)
            const newRecord = newRecords.rows.find(nr =>
                nr.aa === oldRecord.aa &&
                nr.chapterId === newChapterId &&
                nr.description === oldRecord.description
            )
            if (newRecord) {
                recordIdMap.set(oldRecord.id, newRecord.id)
            }
        }

        // Copy Entries
        console.log('  Copying Entry data...')
        const recordIds = recordsResult.rows.map(r => r.id)
        const entriesResult = await oldClient.query(`
            SELECT * FROM "Entry" 
            WHERE "recordId" = ANY($1::int[])
        `, [recordIds])

        for (const entry of entriesResult.rows) {
            const newRecordId = recordIdMap.get(entry.recordId)
            const newOnomId = onomIdMap.get(entry.onomastikoId)

            if (!newRecordId || !newOnomId) continue

            await newClient.query(`
                INSERT INTO "${targetSchema}"."Entry" (
                    debit, credit, "recordId", "onomastikoId", "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                entry.debit || null,
                entry.credit || null,
                newRecordId,
                newOnomId,
                entry.createdAt || new Date(),
                entry.updatedAt || new Date()
            ])
        }
        console.log(`  ✅ ${entriesResult.rows.length} entries copied`)

        // Copy Attachments
        console.log('  Copying Attachment data...')
        const attachmentsResult = await oldClient.query(`
            SELECT * FROM "Attachment" 
            WHERE "recordId" = ANY($1::int[])
        `, [recordIds])

        for (const attachment of attachmentsResult.rows) {
            const newRecordId = recordIdMap.get(attachment.recordId)
            if (!newRecordId) continue

            await newClient.query(`
                INSERT INTO "${targetSchema}"."Attachment" (
                    filename, "mimeType", size, data, "recordId", "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                attachment.filename,
                attachment.mimeType,
                attachment.size,
                attachment.data,
                newRecordId,
                attachment.createdAt || new Date(),
                attachment.updatedAt || new Date()
            ])
        }
        console.log(`  ✅ ${attachmentsResult.rows.length} attachments copied`)

        // Copy YearlyTotals
        console.log('  Copying yearly_totals data...')
        const yearlyTotalsResult = await oldClient.query(`
            SELECT * FROM "yearly_totals" WHERE year = $1
        `, [sourceYear])

        for (const total of yearlyTotalsResult.rows) {
            const newChapterId = chapterIdMap.get(total.chapterId)
            const newOnomId = onomIdMap.get(total.onomastikoId)

            if (!newChapterId || !newOnomId) continue

            await newClient.query(`
                INSERT INTO "${targetSchema}".yearly_totals (
                    year, "chapterId", "onomastikoId", "totalDebit", "totalCredit", balance, "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                total.year,
                newChapterId,
                newOnomId,
                total.totalDebit || 0,
                total.totalCredit || 0,
                total.balance || 0,
                total.createdAt || new Date(),
                total.updatedAt || new Date()
            ])
        }
        console.log(`  ✅ ${yearlyTotalsResult.rows.length} yearly totals copied`)

        // Copy YearLock
        console.log('  Copying YearLock data...')
        const yearLockResult = await oldClient.query(`
            SELECT * FROM "YearLock" WHERE year = $1
        `, [sourceYear])

        for (const lock of yearLockResult.rows) {
            await newClient.query(`
                INSERT INTO "${targetSchema}"."YearLock" (
                    year, locked, "lockedAt", "lockedBy"
                ) VALUES ($1, $2, $3, $4)
            `, [
                lock.year,
                lock.locked || false,
                lock.lockedAt || null,
                lock.lockedBy || null
            ])
        }
        console.log(`  ✅ ${yearLockResult.rows.length} year locks copied`)

        // 5. Add foreign key constraints
        console.log(`\n[5/9] Adding foreign key constraints...`)

        await newClient.query(`
            ALTER TABLE "${targetSchema}"."Onomastiko"
            ADD CONSTRAINT "Onomastiko_chapterId_fkey"
            FOREIGN KEY ("chapterId") REFERENCES "${targetSchema}"."Chapter"(id) ON DELETE CASCADE
        `)
        console.log('  ✅ Onomastiko_chapterId_fkey')

        await newClient.query(`
            ALTER TABLE "${targetSchema}"."Record"
            ADD CONSTRAINT "Record_chapterId_fkey"
            FOREIGN KEY ("chapterId") REFERENCES "${targetSchema}"."Chapter"(id) ON DELETE CASCADE
        `)
        console.log('  ✅ Record_chapterId_fkey')

        await newClient.query(`
            ALTER TABLE "${targetSchema}"."Entry"
            ADD CONSTRAINT "Entry_recordId_fkey"
            FOREIGN KEY ("recordId") REFERENCES "${targetSchema}"."Record"(id) ON DELETE CASCADE
        `)
        console.log('  ✅ Entry_recordId_fkey')

        await newClient.query(`
            ALTER TABLE "${targetSchema}"."Entry"
            ADD CONSTRAINT "Entry_onomastikoId_fkey"
            FOREIGN KEY ("onomastikoId") REFERENCES "${targetSchema}"."Onomastiko"(id) ON DELETE CASCADE
        `)
        console.log('  ✅ Entry_onomastikoId_fkey')

        await newClient.query(`
            ALTER TABLE "${targetSchema}"."Attachment"
            ADD CONSTRAINT "Attachment_recordId_fkey"
            FOREIGN KEY ("recordId") REFERENCES "${targetSchema}"."Record"(id) ON DELETE CASCADE
        `)
        console.log('  ✅ Attachment_recordId_fkey')

        await newClient.query(`
            ALTER TABLE "${targetSchema}".yearly_totals
            ADD CONSTRAINT "yearly_totals_chapterId_fkey"
            FOREIGN KEY ("chapterId") REFERENCES "${targetSchema}"."Chapter"(id) ON DELETE CASCADE
        `)
        console.log('  ✅ yearly_totals_chapterId_fkey')

        await newClient.query(`
            ALTER TABLE "${targetSchema}".yearly_totals
            ADD CONSTRAINT "yearly_totals_onomastikoId_fkey"
            FOREIGN KEY ("onomastikoId") REFERENCES "${targetSchema}"."Onomastiko"(id) ON DELETE CASCADE
        `)
        console.log('  ✅ yearly_totals_onomastikoId_fkey')

        // 6. Add unique constraint for yearly_totals
        console.log(`\n[6/9] Adding unique constraint for yearly_totals...`)
        await newClient.query(`
            ALTER TABLE "${targetSchema}".yearly_totals
            ADD CONSTRAINT "yearly_totals_year_chapterId_onomastikoId_key"
            UNIQUE (year, "chapterId", "onomastikoId")
        `)
        console.log('  ✅ yearly_totals unique constraint added')

        // 7. Add indexes
        console.log(`\n[7/9] Adding indexes...`)
        await newClient.query(`CREATE INDEX "Chapter_year_idx" ON "${targetSchema}"."Chapter"(year)`)
        await newClient.query(`CREATE INDEX "Onomastiko_chapterId_idx" ON "${targetSchema}"."Onomastiko"("chapterId")`)
        await newClient.query(`CREATE INDEX "Record_year_idx" ON "${targetSchema}"."Record"(year)`)
        await newClient.query(`CREATE INDEX "Record_chapterId_idx" ON "${targetSchema}"."Record"("chapterId")`)
        await newClient.query(`CREATE INDEX "Entry_recordId_idx" ON "${targetSchema}"."Entry"("recordId")`)
        await newClient.query(`CREATE INDEX "Entry_onomastikoId_idx" ON "${targetSchema}"."Entry"("onomastikoId")`)
        await newClient.query(`CREATE INDEX "Attachment_recordId_idx" ON "${targetSchema}"."Attachment"("recordId")`)
        console.log('  ✅ Indexes added')

        // 8. Add to AvailableYear table in public schema
        console.log(`\n[8/9] Adding year ${sourceYear} to AvailableYear table...`)
        await newClient.query(`
            INSERT INTO "AvailableYear" (year, "createdAt", "updatedAt") 
            VALUES ($1, NOW(), NOW())
            ON CONFLICT (year) DO UPDATE SET "updatedAt" = NOW()
        `, [sourceYear])
        console.log(`  ✅ Year ${sourceYear} added to available years`)

        // 9. Verification
        console.log(`\n[9/9] Verification - checking data counts...`)
        const verifyTables = ['Chapter', 'Onomastiko', 'Record', 'Entry', 'Attachment', 'yearly_totals']
        for (const table of verifyTables) {
            const countResult = await newClient.query(`
                SELECT COUNT(*) as count FROM "${targetSchema}"."${table}"
            `)
            console.log(`  ${table}: ${countResult.rows[0].count} rows`)
        }

        console.log(`\n🎉 Migration of year ${sourceYear} completed successfully!`)
        console.log(`📊 Summary:`)
        console.log(`  - ${chaptersResult.rows.length} chapters`)
        console.log(`  - ${onomastikaResult.rows.length} onomastika`)
        console.log(`  - ${recordsResult.rows.length} records`)
        console.log(`  - ${entriesResult.rows.length} entries`)
        console.log(`  - ${attachmentsResult.rows.length} attachments`)
        console.log(`  - ${yearlyTotalsResult.rows.length} yearly totals`)
        console.log(`  - ${yearLockResult.rows.length} year locks`)

        console.log(`\n💡 You can now verify the data with:`)
        console.log(`  npm run studio:2026`)

    } catch (error) {
        console.error('❌ Error during migration:', error)
        console.log('\n💡 To rollback, drop the schema:')
        console.log(`  DROP SCHEMA "${targetSchema}" CASCADE;`)
    } finally {
        oldClient.release()
        newClient.release()
        await oldPool.end()
        await newPool.end()
    }
}

// Run the migration
migrateYear2026().catch(console.error)