// C:\Biblio_Ylikou_NEW\src\app\api\records\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

// DELETE: Delete a record
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid record ID' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)

        // Get record to find its chapterId
        const recordResult = await prisma.$queryRawUnsafe(
            `SELECT "chapterId", year FROM ${schemaName}."Record" WHERE id = $1`,
            id
        ) as any[]

        if (!recordResult || recordResult.length === 0) {
            return NextResponse.json(
                { error: 'Record not found' },
                { status: 404 }
            )
        }

        const record = recordResult[0]

        // Delete entries
        await prisma.$executeRawUnsafe(
            `DELETE FROM ${schemaName}."Entry" WHERE "recordId" = $1`,
            id
        )

        // Delete attachments (from public schema - they are stored in public)
        await prisma.attachment.deleteMany({
            where: { recordId: id }
        })

        // Delete the record
        await prisma.$executeRawUnsafe(
            `DELETE FROM ${schemaName}."Record" WHERE id = $1`,
            id
        )

        // Update yearly totals
        await updateYearlyTotals(record.chapterId, year, schemaName)

        return NextResponse.json({
            success: true,
            message: 'Record deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting record:', error)
        return NextResponse.json(
            { error: 'Failed to delete record: ' + (error as Error).message },
            { status: 500 }
        )
    }
}

// Helper: Update yearly totals
async function updateYearlyTotals(chapterId: number, year: number, schemaName: string) {
    try {
        const onomastika = await prisma.$queryRawUnsafe(`
            SELECT id FROM ${schemaName}."Onomastiko" WHERE "chapterId" = ${chapterId}
        `) as any[]

        await prisma.$executeRawUnsafe(
            `DELETE FROM ${schemaName}.yearly_totals WHERE "chapterId" = $1 AND year = $2`,
            chapterId,
            year
        )

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
    } catch (error) {
        console.error('Error updating yearly totals:', error)
        throw error
    }
}