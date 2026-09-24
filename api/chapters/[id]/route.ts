// C:\Biblio_Ylikou_NEW\api\chapters\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const chapterId = parseInt(params.id)
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const schemaName = `year_${year}`

    try {
        // Get chapter with raw SQL
        const chapterResult = await prisma.$queryRaw`
      SELECT * FROM ${prisma.raw(schemaName)}."Chapter"
      WHERE id = ${chapterId}
    `

        if (!chapterResult || (chapterResult as any[]).length === 0) {
            return NextResponse.json(
                { error: 'Chapter not found' },
                { status: 404 }
            )
        }

        const chapter = (chapterResult as any[])[0]

        // Get onomastika
        const onomastika = await prisma.$queryRaw`
      SELECT * FROM ${prisma.raw(schemaName)}."Onomastiko"
      WHERE "chapterId" = ${chapterId}
      ORDER BY position ASC
    `

        // Get records
        const records = await prisma.$queryRaw`
      SELECT * FROM ${prisma.raw(schemaName)}."Record"
      WHERE "chapterId" = ${chapterId} AND year = ${year}
      ORDER BY aa ASC
    `

        // Get entries for each record (simplified - you might need to do this differently)
        // For now, return records without entries
        const result = {
            ...chapter,
            onomastika: onomastika || [],
            records: records || []
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching chapter:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chapter' },
            { status: 500 }
        )
    }
}