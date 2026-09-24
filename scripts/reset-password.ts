// C:\Biblio_Ylikou_NEW\scripts\reset-password.ts
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

async function resetPassword() {
    let client
    try {
        console.log('🔍 Connecting to database...')
        client = await pool.connect()

        // Check if user exists
        console.log('🔍 Checking for user admin...')
        const result = await client.query(
            `SELECT * FROM "User" WHERE username = 'admin'`
        )

        const newPassword = 'admin123'
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        if (result.rows.length > 0) {
            // Update existing user
            console.log(`📝 Updating password for user: admin`)
            await client.query(
                `UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE username = 'admin'`,
                [hashedPassword]
            )
            console.log(`✅ Password reset successfully for admin`)
        } else {
            // Create new user
            console.log(`📝 Creating user: admin`)
            await client.query(
                `INSERT INTO "User" (username, password, role, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, NOW(), NOW())`,
                ['admin', hashedPassword, 'admin']
            )
            console.log(`✅ User created successfully: admin`)
        }

        console.log(`   Username: admin`)
        console.log(`   Password: ${newPassword}`)
        console.log(`   Role: admin`)

    } catch (error: any) {
        if (error.message.includes('relation "User" does not exist')) {
            console.log('❌ User table does not exist!')
            console.log('📝 First run: npx tsx scripts/create-user-table.ts')
        } else {
            console.error('❌ Error:', error)
        }
    } finally {
        if (client) client.release()
        await pool.end()
    }
}

resetPassword()