// C:\Biblio_Ylikou_NEW\src\app\api\year-lock-status\[year]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { year: string } }
) {
    try {
        const year = parseInt(params.year)

        if (isNaN(year)) {
            return NextResponse.json(
                { error: 'Invalid year' },
                { status: 400 }
            )
        }

        // Check if YearLock exists for this year
        const yearLock = await prisma.yearLock.findUnique({
            where: { year }
        })

        return NextResponse.json({
            locked: yearLock?.locked || false,
            lockedAt: yearLock?.lockedAt || null,
            lockedBy: yearLock?.lockedBy || null
        })
    } catch (error) {
        console.error('Error fetching year lock status:', error)
        return NextResponse.json(
            { error: 'Failed to fetch year lock status' },
            { status: 500 }
        )
    }
}