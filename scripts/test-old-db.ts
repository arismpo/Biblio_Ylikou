// scripts/test-old-db.ts
import { Pool } from 'pg'

// OLD database connection
const oldPool = new Pool({
    connectionString: 'postgresql://biblio_user:mpo13783@localhost:5432/biblio'
})

async function testOldDB() {
    const client = await oldPool.connect()

    try {
        console.log('🔍 Testing connection to OLD database...')

        // Check version
        const version = await client.query('SELECT version()')
        console.log(`✅ Connected: ${version.rows[0].version}`)

        // List tables
        console.log('\n📋 Tables in OLD database:')
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `)
        tables.rows.forEach(t => console.log(`  - ${t.table_name}`))

        // Check if schemas exist (for multi-schema structure)
        console.log('\n📋 Schemas in OLD database:')
        const schemas = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name
        `)
        schemas.rows.forEach(s => console.log(`  - ${s.schema_name}`))

        // Count data per year
        console.log('\n📊 Data counts per year in OLD database:')
        try {
            const counts = await client.query(`
                SELECT year, COUNT(*) as count 
                FROM "Chapter" 
                GROUP BY year 
                ORDER BY year
            `)
            counts.rows.forEach(c => console.log(`  Year ${c.year}: ${c.count} chapters`))
        } catch (e) {
            console.log('  Could not get year counts (table might not exist)')
        }

    } catch (error) {
        console.error('❌ Error connecting to OLD database:', error.message)
        console.log('\n💡 Make sure the OLD app is running and database is accessible.')
        console.log('💡 Check if the database exists: psql -U biblio_user -d biblio -h localhost')
    } finally {
        client.release()
        await oldPool.end()
    }
}

testOldDB()