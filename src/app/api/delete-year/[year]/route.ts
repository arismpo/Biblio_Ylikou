// C:\Biblio_Ylikou_NEW\src\app\api\delete-year\[year]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { deleteSchema, schemaExists } from '@/utils/schemaManager'

const DELETE_PASSWORD = process.env.DELETE_YEAR_PASSWORD || 'admin123'

export async function DELETE(
    req: NextRequest,
    { params }: { params: { year: string } }
) {
    try {
        const year = parseInt(params.year)

        // Έλεγχος αν το year είναι έγκυρος αριθμός
        if (isNaN(year)) {
            return NextResponse.json(
                { error: 'Μη έγκυρο έτος' },
                { status: 400 }
            )
        }

        // Λήψη του password από το body
        const body = await req.json()
        const { password } = body

        // Έλεγχος κωδικού
        if (!password) {
            return NextResponse.json(
                { error: 'Παρακαλώ εισάγετε τον κωδικό διαγραφής' },
                { status: 401 }
            )
        }

        if (password !== DELETE_PASSWORD) {
            return NextResponse.json(
                { error: 'Λάθος κωδικός διαγραφής' },
                { status: 401 }
            )
        }

        // Έλεγχος αν υπάρχει το schema
        const exists = await schemaExists(year)
        if (!exists) {
            return NextResponse.json(
                { error: `Το έτος ${year} δεν υπάρχει` },
                { status: 404 }
            )
        }

        // Διαγραφή του schema
        await deleteSchema(year)

        console.log(`🗑️ Έτος ${year} διαγράφηκε επιτυχώς`)

        return NextResponse.json({
            success: true,
            message: `Το έτος ${year} διαγράφηκε επιτυχώς`
        })

    } catch (error) {
        console.error('Error deleting year:', error)
        return NextResponse.json(
            { error: 'Σφάλμα κατά τη διαγραφή του έτους' },
            { status: 500 }
        )
    }
}