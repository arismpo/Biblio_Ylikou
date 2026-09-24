// C:\Biblio_Ylikou_NEW\src\app\api\chapters\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

// GET: List all chapters for a year
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        const schemaName = getSchemaName(year)

        const chapters = await prisma.$queryRawUnsafe(`
            SELECT * FROM ${schemaName}."Chapter"
            WHERE year = ${year}
            ORDER BY position ASC
        `)

        return NextResponse.json(chapters)
    } catch (error) {
        console.error('Error fetching chapters:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chapters' },
            { status: 500 }
        )
    }
}

// POST: Create a new chapter
export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const body = await request.json()

        const { name, description, page, position, pageProcessingType } = body

        const schemaName = getSchemaName(year)

        // Get max position
        const maxPositionResult = await prisma.$queryRawUnsafe(`
            SELECT COALESCE(MAX(position), -1) as maxPos FROM ${schemaName}."Chapter" WHERE year = ${year}
        `) as any[]
        const maxPosition = maxPositionResult[0]?.maxpos || -1

        const result = await prisma.$queryRawUnsafe(`
            INSERT INTO ${schemaName}."Chapter" (
                name, description, page, year, position, "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING *
        `, name, description || null, page || null, year, maxPosition + 1)

        const newChapter = (result as any[])[0]

        return NextResponse.json(newChapter, { status: 201 })
    } catch (error) {
        console.error('Error creating chapter:', error)
        return NextResponse.json(
            { error: 'Failed to create chapter: ' + (error as Error).message },
            { status: 500 }
        )
    }
}