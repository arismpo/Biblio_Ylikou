// C:\Biblio_Ylikou_NEW\src\app\api\chapters\[id]\reorder-aa\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }  // ✅ ΑΛΛΑΞΕ από chapterId σε id
) {
    try {
        // ✅ Πάρε το id από τα params (όχι chapterId)
        const chapterId = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const schemaName = getSchemaName(year)

        console.log(`🔄 Reordering AA for chapter ${chapterId}, year ${year}, schema ${schemaName}`)

        // ✅ Get all records for this chapter, ordered by aa
        const records = await prisma.$queryRawUnsafe(`
            SELECT id, aa 
            FROM ${schemaName}."Record" 
            WHERE "chapterId" = ${chapterId} 
            AND year = ${year}
            ORDER BY aa
        `) as any[]

        console.log(`📊 Found ${records.length} records`)

        if (records.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No records to reorder',
                updated: 0
            })
        }

        let updated = 0
        for (let i = 0; i < records.length; i++) {
            const newAA = i + 1
            if (records[i].aa !== newAA) {
                await prisma.$executeRawUnsafe(`
                    UPDATE ${schemaName}."Record" 
                    SET aa = ${newAA} 
                    WHERE id = ${records[i].id}
                `)
                updated++
            }
        }

        console.log(`✅ Reordered AA for chapter ${chapterId}: ${updated} records updated`)

        return NextResponse.json({
            success: true,
            message: `Αναδιατάχθηκαν ${updated} εγγραφές`,
            updated: updated
        })

    } catch (error) {
        console.error('❌ Error reordering AA:', error)
        return NextResponse.json(
            { error: 'Failed to reorder AA: ' + (error as Error).message },
            { status: 500 }
        )
    }
}