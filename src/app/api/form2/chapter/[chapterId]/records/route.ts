// C:\Biblio_Ylikou_NEW\src\app\api\form2\chapter\[chapterId]\records\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function POST(
    request: NextRequest,
    { params }: { params: { chapterId: string } }
) {
    try {
        const chapterId = parseInt(params.chapterId)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        const body = await request.json()
        const { records } = body

        if (!records || !Array.isArray(records) || records.length === 0) {
            return NextResponse.json(
                { error: 'No records to save' },
                { status: 400 }
            )
        }

        console.log(`📝 Saving ${records.length} records for chapter ${chapterId}, year ${year}`)

        const schemaName = getSchemaName(year)
        console.log(`📂 Using schema: ${schemaName}`)

        const results = []

        for (const recordData of records) {
            let recordId = recordData.id

            if (recordId && recordId > 0) {
                // ✅ UPDATE existing record

                // 1. Delete existing entries
                await prisma.$executeRawUnsafe(
                    `DELETE FROM ${schemaName}."Entry" WHERE "recordId" = $1`,
                    recordId
                )

                // 2. Update record
                await prisma.$executeRawUnsafe(
                    `UPDATE ${schemaName}."Record" SET 
                        aa = $1, 
                        month = $2, 
                        day = $3, 
                        description = $4, 
                        year = $5,
                        "updatedAt" = NOW()
                    WHERE id = $6`,
                    recordData.aa || 0,
                    recordData.month || '',
                    recordData.day || 1,
                    recordData.description || '',
                    year,
                    recordId
                )

                // 3. Create new entries
                for (const cell of recordData.cells) {
                    if (cell.onomastikoId && (cell.debit || cell.credit)) {
                        await prisma.$executeRawUnsafe(
                            `INSERT INTO ${schemaName}."Entry" (
                                "recordId", "onomastikoId", debit, credit, "createdAt", "updatedAt"
                            ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                            recordId,
                            cell.onomastikoId,
                            cell.debit ? parseFloat(cell.debit) : null,
                            cell.credit ? parseFloat(cell.credit) : null
                        )
                    }
                }

                results.push({ id: recordId, ...recordData })
                console.log(`✅ Updated record ${recordId}`)

            } else {
                // ✅ CREATE new record

                // 1. Insert record
                const newRecordResult = await prisma.$queryRawUnsafe(
                    `INSERT INTO ${schemaName}."Record" (
                        aa, month, day, description, year, "chapterId", "createdAt", "updatedAt"
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
                    recordData.aa || 0,
                    recordData.month || '',
                    recordData.day || 1,
                    recordData.description || '',
                    year,
                    chapterId
                ) as any[]

                const newRecordId = newRecordResult[0]?.id
                if (!newRecordId) {
                    console.error('Failed to create record')
                    continue
                }

                // 2. Create entries
                for (const cell of recordData.cells) {
                    if (cell.onomastikoId && (cell.debit || cell.credit)) {
                        await prisma.$executeRawUnsafe(
                            `INSERT INTO ${schemaName}."Entry" (
                                "recordId", "onomastikoId", debit, credit, "createdAt", "updatedAt"
                            ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                            newRecordId,
                            cell.onomastikoId,
                            cell.debit ? parseFloat(cell.debit) : null,
                            cell.credit ? parseFloat(cell.credit) : null
                        )
                    }
                }

                results.push({ id: newRecordId, ...recordData })
                console.log(`✅ Created new record ${newRecordId}`)
            }
        }

        // Update YearlyTotals
        await updateYearlyTotals(chapterId, year, schemaName)

        return NextResponse.json({
            success: true,
            message: `Saved ${results.length} records`,
            records: results
        })

    } catch (error) {
        console.error('Error saving records:', error)
        return NextResponse.json(
            { error: 'Failed to save records: ' + (error as Error).message },
            { status: 500 }
        )
    }
}

// Helper function to update yearly totals
async function updateYearlyTotals(chapterId: number, year: number, schemaName: string) {
    try {
        // Get all onomastika for this chapter
        const onomastika = await prisma.$queryRawUnsafe(`
            SELECT id FROM ${schemaName}."Onomastiko" WHERE "chapterId" = ${chapterId}
        `) as any[]

        // Delete existing yearly totals
        await prisma.$executeRawUnsafe(
            `DELETE FROM ${schemaName}.yearly_totals WHERE "chapterId" = $1 AND year = $2`,
            chapterId,
            year
        )

        // Calculate totals for each onomastiko
        for (const onom of onomastika) {
            const entries = await prisma.$queryRawUnsafe(`
                SELECT COALESCE(SUM(debit), 0) as totalDebit, COALESCE(SUM(credit), 0) as totalCredit
                FROM ${schemaName}."Entry" e
                JOIN ${schemaName}."Record" r ON r.id = e."recordId"
                WHERE e."onomastikoId" = ${onom.id}
                AND r."chapterId" = ${chapterId}
                AND r.year = ${year}
            `) as any[]

            const totalDebit = parseFloat(entries[0]?.totaldebit || 0)
            const totalCredit = parseFloat(entries[0]?.totalcredit || 0)

            await prisma.$executeRawUnsafe(
                `INSERT INTO ${schemaName}.yearly_totals (
                    year, "chapterId", "onomastikoId", "totalDebit", "totalCredit", balance, "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                year,
                chapterId,
                onom.id,
                totalDebit,
                totalCredit,
                totalDebit - totalCredit
            )
        }

        console.log(`✅ Updated yearly totals for chapter ${chapterId}, year ${year}`)
    } catch (error) {
        console.error('Error updating yearly totals:', error)
        throw error
    }
}