// C:\Biblio_Ylikou_NEW\src\app\api\lock-year\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const LOCK_PASSWORD = process.env.LOCK_YEAR_PASSWORD || 'admin123'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { year, password } = body

        if (!year) {
            return NextResponse.json(
                { error: 'Year is required' },
                { status: 400 }
            )
        }

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            )
        }

        if (password !== LOCK_PASSWORD) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            )
        }

        // Lock the year
        await prisma.yearLock.upsert({
            where: { year },
            update: {
                locked: true,
                lockedAt: new Date(),
                lockedBy: 'system'
            },
            create: {
                year,
                locked: true,
                lockedAt: new Date(),
                lockedBy: 'system'
            }
        })

        return NextResponse.json({
            success: true,
            message: `Το έτος ${year} κλειδώθηκε επιτυχώς!`
        })
    } catch (error) {
        console.error('Error locking year:', error)
        return NextResponse.json(
            { error: 'Failed to lock year' },
            { status: 500 }
        )
    }
}