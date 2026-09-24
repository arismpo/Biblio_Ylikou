// C:\Biblio_Ylikou_NEW\src\app\api\records-without-attachments\[year]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

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

        const schemaName = getSchemaName(year)

        // Get all records for the year with their attachment count
        const records = await prisma.$queryRawUnsafe(`
            SELECT 
                r.id,
                r.aa,
                r.month,
                r.day,
                r.description,
                r."chapterId",
                c.name as "chapterName",
                (
                    SELECT COUNT(*) 
                    FROM ${schemaName}."Attachment" a 
                    WHERE a."recordId" = r.id
                ) as attachment_count
            FROM ${schemaName}."Record" r
            JOIN ${schemaName}."Chapter" c ON c.id = r."chapterId"
            WHERE r.year = ${year}
            ORDER BY c.position, r.aa
        `) as any[]

        // Filter records without attachments
        const recordsWithoutAttachments = records
            .filter(r => parseInt(r.attachment_count) === 0)
            .map(r => ({
                id: r.id,
                aa: r.aa,
                month: r.month,
                day: r.day,
                description: r.description,
                chapterId: r.chapterId,
                chapterName: r.chapterName,
                attachmentCount: parseInt(r.attachment_count)
            }))

        return NextResponse.json(recordsWithoutAttachments)
    } catch (error) {
        console.error('Error fetching records without attachments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch records without attachments' },
            { status: 500 }
        )
    }
}