// C:\Biblio_Ylikou_NEW\scripts\create-default-user.ts
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

async function createDefaultUser() {
    let client
    try {
        console.log('🔍 Connecting to database...')
        client = await pool.connect()

        // Check if user exists in public schema
        console.log('🔍 Checking for existing users...')
        const result = await client.query(
            `SELECT * FROM "User" WHERE username = 'admin'`
        )

        if (result.rows.length > 0) {
            console.log('✅ User already exists:', result.rows[0].username)
            return
        }

        console.log('📝 Creating default user...')
        const hashedPassword = await bcrypt.hash('admin123', 10)

        await client.query(
            `INSERT INTO "User" (username, password, role, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, NOW(), NOW())`,
            ['admin', hashedPassword, 'admin']
        )

        console.log('✅ Default user created successfully!')
        console.log(`   Username: admin`)
        console.log(`   Password: admin123`)
        console.log(`   Role: admin`)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        if (client) client.release()
        await pool.end()
    }
}

createDefaultUser()