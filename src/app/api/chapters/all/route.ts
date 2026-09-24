import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const chapters = await prisma.chapter.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(chapters)
    } catch (error) {
        console.error('Error fetching all chapters:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chapters' },
            { status: 500 }
        )
    }
}