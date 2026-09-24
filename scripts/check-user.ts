// C:\Biblio_Ylikou_NEW\scripts\check-user.ts
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

async function checkUser() {
    let client
    try {
        console.log('🔍 Connecting to database...')
        client = await pool.connect()

        // Check users in public schema
        console.log('🔍 Checking users in public schema...')
        const result = await client.query(
            `SELECT id, username, role, "createdAt" FROM "User"`
        )

        if (result.rows.length === 0) {
            console.log('❌ No users found in public schema!')
            return
        }

        console.log('📋 Users found:')
        result.rows.forEach((user, index) => {
            console.log(`  ${index + 1}. Username: ${user.username}, Role: ${user.role}, Created: ${user.createdAt}`)
        })

    } catch (error: any) {
        if (error.message.includes('relation "User" does not exist')) {
            console.log('❌ User table does not exist in public schema!')
            console.log('📝 Run: npx tsx scripts/create-user-table.ts')
        } else {
            console.error('❌ Error:', error)
        }
    } finally {
        if (client) client.release()
        await pool.end()
    }
}

checkUser()