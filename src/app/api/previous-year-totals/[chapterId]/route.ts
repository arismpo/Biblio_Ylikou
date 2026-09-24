// C:\Biblio_Ylikou_NEW\src\app\api\previous-year-totals\[chapterId]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { chapterId: string } }
) {
    const { chapterId } = await params
    const chapterIdNum = parseInt(chapterId)
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const previousYear = year - 1
    const schemaName = `year_${year}`

    try {
        // Get onomastika
        const onomastikaQuery = `
      SELECT id, name FROM "${schemaName}"."Onomastiko"
      WHERE "chapterId" = ${chapterIdNum}
      ORDER BY position ASC
    `
        const onomastika = await prisma.$queryRawUnsafe(onomastikaQuery)

        // Get yearly totals for previous year
        let yearlyTotals: any[] = []
        try {
            const yearlyTotalsQuery = `
        SELECT * FROM "${schemaName}"."YearlyTotal"
        WHERE year = ${previousYear} AND "chapterId" = ${chapterIdNum}
      `
            yearlyTotals = await prisma.$queryRawUnsafe(yearlyTotalsQuery) as any[]
        } catch (e) {
            // Table might not exist yet
        }

        const onomastikaList = onomastika as any[]
        const totalsList = yearlyTotals as any[]

        const previousDebits: number[] = []
        const previousCredits: number[] = []
        const balances: number[] = []
        const totals: any[] = []

        onomastikaList.forEach((onom: any) => {
            const total = totalsList.find((t: any) => t.onomastikoId === onom.id)
            const debit = total?.total_debit || 0
            const credit = total?.total_credit || 0
            const balance = debit - credit

            previousDebits.push(debit > 0 ? debit : 0)
            previousCredits.push(credit > 0 ? credit : 0)
            balances.push(balance)

            totals.push({
                onomastikoId: onom.id,
                name: onom.name,
                totalDebit: debit,
                totalCredit: credit,
                balance: balance,
                previousDebit: debit > 0 ? debit : 0,
                previousCredit: credit > 0 ? credit : 0
            })
        })

        return NextResponse.json({
            previousYear,
            hasData: balances.some(b => b !== 0),
            previousDebits,
            previousCredits,
            balances,
            totals
        })
    } catch (error) {
        console.error('Error fetching previous year balances:', error)
        return NextResponse.json({
            previousYear: year - 1,
            hasData: false,
            previousDebits: [],
            previousCredits: [],
            balances: [],
            totals: []
        })
    }
}