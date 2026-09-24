// C:\Biblio_Ylikou_NEW\src\app\api\change-password\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

export async function POST(request: NextRequest) {
    let client
    try {
        const body = await request.json()
        const { currentPassword, newPassword } = body

        // Validation
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Όλα τα πεδία είναι υποχρεωτικά' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες' },
                { status: 400 }
            )
        }

        client = await pool.connect()

        // Get user from public schema
        const userResult = await client.query(
            `SELECT * FROM "User" WHERE username = 'admin'`
        )

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Δεν βρέθηκε χρήστης' },
                { status: 404 }
            )
        }

        const user = userResult.rows[0]

        // Check current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Ο τρέχων κωδικός δεν είναι σωστός' },
                { status: 401 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password
        await client.query(
            `UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE id = $2`,
            [hashedPassword, user.id]
        )

        return NextResponse.json({
            success: true,
            message: 'Ο κωδικός άλλαξε επιτυχώς!'
        })

    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json(
            { error: 'Σφάλμα κατά την αλλαγή κωδικού' },
            { status: 500 }
        )
    } finally {
        if (client) client.release()
    }
}