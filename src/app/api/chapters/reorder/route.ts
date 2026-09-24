// C:\Biblio_Ylikou_NEW\src\app\api\chapters\reorder\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { chapters, year } = body

        if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
            return NextResponse.json(
                { error: 'No chapters to reorder' },
                { status: 400 }
            )
        }

        if (!year) {
            return NextResponse.json(
                { error: 'Year is required' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)

        // Update each chapter's position
        for (const chapter of chapters) {
            await prisma.$executeRawUnsafe(`
                UPDATE ${schemaName}."Chapter"
                SET position = $1, "updatedAt" = NOW()
                WHERE id = $2 AND year = $3
            `, chapter.order || chapter.position, chapter.id, year)
        }

        return NextResponse.json({
            success: true,
            message: 'Chapters reordered successfully'
        })
    } catch (error) {
        console.error('Error reordering chapters:', error)
        return NextResponse.json(
            { error: 'Failed to reorder chapters: ' + (error as Error).message },
            { status: 500 }
        )
    }
}