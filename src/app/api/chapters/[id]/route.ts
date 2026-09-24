// C:\Biblio_Ylikou_NEW\src\app\api\chapters\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

// GET: Get a single chapter with its onomastika and records
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const schemaName = getSchemaName(year)

        // Get chapter
        const chapterResult = await prisma.$queryRawUnsafe(`
            SELECT * FROM ${schemaName}."Chapter" WHERE id = $1
        `, id) as any[]

        if (!chapterResult || chapterResult.length === 0) {
            return NextResponse.json(
                { error: 'Chapter not found' },
                { status: 404 }
            )
        }

        const chapter = chapterResult[0]

        // Get onomastika
        const onomastika = await prisma.$queryRawUnsafe(`
            SELECT * FROM ${schemaName}."Onomastiko"
            WHERE "chapterId" = $1
            ORDER BY position ASC
        `, id)

        // Get records with entries
        const recordsResult = await prisma.$queryRawUnsafe(`
            SELECT 
                r.*,
                e.id as entry_id,
                e.debit,
                e.credit,
                e."onomastikoId"
            FROM ${schemaName}."Record" r
            LEFT JOIN ${schemaName}."Entry" e ON e."recordId" = r.id
            WHERE r."chapterId" = $1 AND r.year = $2
            ORDER BY r.aa ASC
        `, id, year) as any[]

        // Group entries by record
        const recordsMap = new Map()
        recordsResult.forEach((row: any) => {
            if (!recordsMap.has(row.id)) {
                recordsMap.set(row.id, {
                    id: row.id,
                    aa: row.aa,
                    month: row.month,
                    day: row.day,
                    description: row.description,
                    document: row.document,
                    year: row.year,
                    chapterId: row.chapterId,
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt,
                    entries: []
                })
            }
            if (row.entry_id) {
                recordsMap.get(row.id).entries.push({
                    id: row.entry_id,
                    debit: row.debit,
                    credit: row.credit,
                    onomastikoId: row.onomastikoId
                })
            }
        })

        const records = Array.from(recordsMap.values())

        return NextResponse.json({
            ...chapter,
            onomastika: onomastika || [],
            records: records || []
        })
    } catch (error) {
        console.error('Error fetching chapter:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chapter' },
            { status: 500 }
        )
    }
}

// PUT: Update a chapter
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const body = await request.json()

        const { name, description, page, position, pageProcessingType } = body

        const schemaName = getSchemaName(year)

        const result = await prisma.$queryRawUnsafe(`
            UPDATE ${schemaName}."Chapter"
            SET 
                name = $1,
                description = $2,
                page = $3,
                position = $4,
                "updatedAt" = NOW()
            WHERE id = $5 AND year = $6
            RETURNING *
        `, name, description || null, page || null, position || 0, id, year)

        const updatedChapter = (result as any[])[0]

        if (!updatedChapter) {
            return NextResponse.json(
                { error: 'Chapter not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(updatedChapter)
    } catch (error) {
        console.error('Error updating chapter:', error)
        return NextResponse.json(
            { error: 'Failed to update chapter: ' + (error as Error).message },
            { status: 500 }
        )
    }
}

// DELETE: Delete a chapter
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const schemaName = getSchemaName(year)

        // Check if chapter exists
        const checkResult = await prisma.$queryRawUnsafe(`
            SELECT id FROM ${schemaName}."Chapter" WHERE id = $1 AND year = $2
        `, id, year) as any[]

        if (!checkResult || checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Chapter not found' },
                { status: 404 }
            )
        }

        // Delete chapter (cascade will delete onomastika and records)
        await prisma.$executeRawUnsafe(
            `DELETE FROM ${schemaName}."Chapter" WHERE id = $1`,
            id
        )

        return NextResponse.json({
            success: true,
            message: 'Chapter deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting chapter:', error)
        return NextResponse.json(
            { error: 'Failed to delete chapter: ' + (error as Error).message },
            { status: 500 }
        )
    }
}