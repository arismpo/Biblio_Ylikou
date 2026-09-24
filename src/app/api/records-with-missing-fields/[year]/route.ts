// C:\Biblio_Ylikou_NEW\src\app\api\records-with-missing-fields\[year]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function GET(
    request: NextRequest,
    { params }: { params: { year: string } }
) {
    try {
        const year = parseInt(params.year)
        const searchParams = request.nextUrl.searchParams
        const chapterId = searchParams.get('chapterId') ? parseInt(searchParams.get('chapterId')!) : null

        if (isNaN(year)) {
            return NextResponse.json(
                { error: 'Invalid year' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)

        // Build the query
        let query = `
            SELECT 
                r.id,
                r.aa,
                r.month,
                r.day,
                r.description,
                r."chapterId",
                c.name as "chapterName",
                r.year,
                (
                    SELECT COUNT(*) 
                    FROM ${schemaName}."Entry" e 
                    WHERE e."recordId" = r.id
                ) as entry_count,
                (
                    SELECT COUNT(*) 
                    FROM ${schemaName}."Entry" e 
                    WHERE e."recordId" = r.id 
                    AND (e.debit IS NOT NULL AND e.debit != 0)
                ) as entries_with_debit,
                (
                    SELECT COUNT(*) 
                    FROM ${schemaName}."Entry" e 
                    WHERE e."recordId" = r.id 
                    AND (e.credit IS NOT NULL AND e.credit != 0)
                ) as entries_with_credit
            FROM ${schemaName}."Record" r
            JOIN ${schemaName}."Chapter" c ON c.id = r."chapterId"
            WHERE r.year = ${year}
        `

        if (chapterId) {
            query += ` AND r."chapterId" = ${chapterId}`
        }

        query += ` ORDER BY c.position, r.aa`

        const records = await prisma.$queryRawUnsafe(query) as any[]

        // Check each record for missing fields
        const results = records.map((record: any) => {
            const missingFields: string[] = []

            // Check basic fields
            if (!record.month || record.month.trim() === '') {
                missingFields.push('Μήνας')
            }
            if (!record.day || record.day === 0) {
                missingFields.push('Ημέρα')
            }
            if (!record.description || record.description.trim() === '') {
                missingFields.push('Περιγραφή')
            }

            // Check if entries exist
            const entryCount = parseInt(record.entry_count) || 0
            const hasDebit = parseInt(record.entries_with_debit) > 0
            const hasCredit = parseInt(record.entries_with_credit) > 0

            if (entryCount === 0) {
                missingFields.push('Χωρίς κινήσεις (Entry)')
            } else {
                // Check if all entries are zero
                if (!hasDebit && !hasCredit) {
                    missingFields.push('Όλες οι κινήσεις είναι μηδενικές')
                }
            }

            return {
                id: record.id,
                aa: record.aa,
                month: record.month,
                day: record.day,
                description: record.description,
                chapterId: record.chapterId,
                chapterName: record.chapterName,
                year: record.year,
                missingFields: missingFields,
                hasMissingFields: missingFields.length > 0,
                entryCount: entryCount,
                hasDebit: hasDebit,
                hasCredit: hasCredit
            }
        })

        // Filter only records with missing fields
        const recordsWithMissingFields = results.filter(r => r.hasMissingFields)

        console.log(`📊 Found ${recordsWithMissingFields.length} records with missing fields out of ${results.length}`)

        return NextResponse.json({
            success: true,
            total: results.length,
            missing: recordsWithMissingFields.length,
            records: recordsWithMissingFields
        })

    } catch (error) {
        console.error('Error checking records with missing fields:', error)
        return NextResponse.json(
            { error: 'Failed to check records with missing fields' },
            { status: 500 }
        )
    }
}