// scripts/copy-year-complete.ts
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

async function copyYearComplete() {
    const sourceYear = 2026
    const targetYear = 2025

    const client = await pool.connect()

    try {
        console.log(`📋 Copying data from ${sourceYear} to ${targetYear} with all relationships...`)

        // Create schema
        await client.query(`CREATE SCHEMA IF NOT EXISTS "year_${targetYear}"`)
        console.log(`✅ Schema year_${targetYear} created`)

        // Get all tables in the source schema
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = $1
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `, [`year_${sourceYear}`])

        const tables = tablesResult.rows.map(r => r.table_name)
        console.log(`📋 Found tables: ${tables.join(', ')}`)

        // 1. Create tables with structure (no data yet)
        console.log('\n📋 Creating table structures...')
        for (const table of tables) {
            console.log(`  Creating ${table}...`)

            // Drop if exists in target
            await client.query(`DROP TABLE IF EXISTS "year_${targetYear}"."${table}" CASCADE`)

            // Create table with structure only
            await client.query(`
                CREATE TABLE "year_${targetYear}"."${table}" 
                AS SELECT * FROM "year_${sourceYear}"."${table}" 
                WHERE 1 = 0
            `)
            console.log(`  ✅ ${table} structure created`)
        }

        // 2. Create sequences for auto-increment IDs
        console.log('\n📋 Creating sequences...')
        for (const table of tables) {
            try {
                const seqName = `"year_${targetYear}"."${table}_id_seq"`
                await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName}`)

                // Set the sequence to start from max id + 1
                const maxResult = await client.query(`
                    SELECT COALESCE(MAX(id), 0) + 1 as next_val 
                    FROM "year_${sourceYear}"."${table}"
                `)
                const nextVal = maxResult.rows[0].next_val || 1
                await client.query(`SELECT setval('${seqName}', ${nextVal}, false)`)

                // Set default for id column
                await client.query(`
                    ALTER TABLE "year_${targetYear}"."${table}" 
                    ALTER COLUMN id SET DEFAULT nextval('${seqName}')
                `)
                console.log(`  ✅ Sequence for ${table}.id (starts at ${nextVal})`)
            } catch (error) {
                console.log(`  ⚠️ Could not create sequence for ${table}:`, error.message)
            }
        }

        // 3. Copy data
        console.log('\n📋 Copying data...')
        // Order matters: Chapter -> Onomastiko -> Record -> Entry/Attachment -> YearlyTotal
        const copyOrder = ['Chapter', 'Onomastiko', 'Record', 'Entry', 'Attachment', 'yearly_totals']

        for (const table of copyOrder) {
            if (!tables.includes(table)) {
                console.log(`  ⚠️ ${table} not found, skipping`)
                continue
            }

            console.log(`  Copying ${table}...`)
            await client.query(`
                INSERT INTO "year_${targetYear}"."${table}"
                SELECT * FROM "year_${sourceYear}"."${table}"
            `)
            const countResult = await client.query(
                `SELECT COUNT(*) FROM "year_${targetYear}"."${table}"`
            )
            console.log(`  ✅ ${table}: ${countResult.rows[0].count} rows`)
        }

        // 4. Add foreign key constraints based on schema
        console.log('\n📋 Adding foreign key constraints...')
        const constraints = [
            {
                table: 'Onomastiko',
                column: 'chapterId',
                refTable: 'Chapter',
                refColumn: 'id',
                name: 'Onomastiko_chapterId_fkey'
            },
            {
                table: 'Record',
                column: 'chapterId',
                refTable: 'Chapter',
                refColumn: 'id',
                name: 'Record_chapterId_fkey'
            },
            {
                table: 'Entry',
                column: 'recordId',
                refTable: 'Record',
                refColumn: 'id',
                name: 'Entry_recordId_fkey'
            },
            {
                table: 'Entry',
                column: 'onomastikoId',
                refTable: 'Onomastiko',
                refColumn: 'id',
                name: 'Entry_onomastikoId_fkey'
            },
            {
                table: 'Attachment',
                column: 'recordId',
                refTable: 'Record',
                refColumn: 'id',
                name: 'Attachment_recordId_fkey'
            },
            {
                table: 'yearly_totals',
                column: 'chapterId',
                refTable: 'Chapter',
                refColumn: 'id',
                name: 'yearly_totals_chapterId_fkey'
            },
            {
                table: 'yearly_totals',
                column: 'onomastikoId',
                refTable: 'Onomastiko',
                refColumn: 'id',
                name: 'yearly_totals_onomastikoId_fkey'
            }
        ]

        for (const constraint of constraints) {
            try {
                await client.query(`
                    ALTER TABLE "year_${targetYear}"."${constraint.table}"
                    ADD CONSTRAINT "${constraint.name}"
                    FOREIGN KEY ("${constraint.column}")
                    REFERENCES "year_${targetYear}"."${constraint.refTable}"("${constraint.refColumn}")
                    ON DELETE CASCADE
                `)
                console.log(`  ✅ ${constraint.name}`)
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`  ℹ️ ${constraint.name} already exists`)
                } else {
                    console.log(`  ⚠️ Could not add ${constraint.name}:`, error.message)
                }
            }
        }

        // 5. Add unique constraint for YearlyTotal
        try {
            await client.query(`
                ALTER TABLE "year_${targetYear}"."yearly_totals"
                ADD CONSTRAINT "yearly_totals_year_chapterId_onomastikoId_key"
                UNIQUE (year, "chapterId", "onomastikoId")
            `)
            console.log('  ✅ yearly_totals unique constraint added')
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('  ℹ️ yearly_totals unique constraint already exists')
            } else {
                console.log('  ⚠️ Could not add yearly_totals unique constraint:', error.message)
            }
        }

        // 6. Add indexes for performance
        console.log('\n📋 Adding indexes...')
        const indexes = [
            { table: 'Record', columns: ['chapterId'], name: 'Record_chapterId_idx' },
            { table: 'Record', columns: ['year'], name: 'Record_year_idx' },
            { table: 'Record', columns: ['page'], name: 'Record_page_idx' },
            { table: 'Entry', columns: ['recordId'], name: 'Entry_recordId_idx' },
            { table: 'Entry', columns: ['onomastikoId'], name: 'Entry_onomastikoId_idx' },
            { table: 'Attachment', columns: ['recordId'], name: 'Attachment_recordId_idx' },
            { table: 'Onomastiko', columns: ['chapterId'], name: 'Onomastiko_chapterId_idx' },
            { table: 'yearly_totals', columns: ['chapterId'], name: 'yearly_totals_chapterId_idx' },
            { table: 'yearly_totals', columns: ['onomastikoId'], name: 'yearly_totals_onomastikoId_idx' },
            { table: 'yearly_totals', columns: ['year'], name: 'yearly_totals_year_idx' }
        ]

        for (const idx of indexes) {
            try {
                await client.query(`
                    CREATE INDEX IF NOT EXISTS "${idx.name}" 
                    ON "year_${targetYear}"."${idx.table}" (${idx.columns.map(c => `"${c}"`).join(', ')})
                `)
                console.log(`  ✅ ${idx.name}`)
            } catch (error) {
                console.log(`  ⚠️ Could not add ${idx.name}:`, error.message)
            }
        }

        // 7. Verification
        console.log('\n📊 Verification:')
        for (const table of copyOrder) {
            if (!tables.includes(table)) continue
            try {
                const countResult = await client.query(
                    `SELECT COUNT(*) FROM "year_${targetYear}"."${table}"`
                )
                console.log(`  ${table}: ${countResult.rows[0].count} rows`)
            } catch (error) {
                console.log(`  ${table}: ❌ Error checking`)
            }
        }

        console.log('\n🎉 Year 2025 created successfully with all relationships!')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        client.release()
        await pool.end()
    }
}

copyYearComplete()