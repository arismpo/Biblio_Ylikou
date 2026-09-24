// C:\Biblio_Ylikou_NEW\api\previous-year-totals\[chapterId]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { chapterId: string } }
) {
    const chapterId = parseInt(params.chapterId)
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const previousYear = year - 1
    const schemaName = `year_${year}`

    try {
        // Get all onomastika for this chapter
        const onomastika = await prisma.$queryRaw`
      SELECT id FROM ${prisma.raw(schemaName)}."Onomastiko"
      WHERE "chapterId" = ${chapterId}
      ORDER BY position ASC
    `

        // Get yearly totals for previous year
        const yearlyTotals = await prisma.$queryRaw`
      SELECT * FROM ${prisma.raw(schemaName)}."YearlyTotal"
      WHERE year = ${previousYear} AND "chapterId" = ${chapterId}
    `

        const onomastikaList = onomastika as any[]
        const totalsList = yearlyTotals as any[]

        const previousDebits: number[] = []
        const previousCredits: number[] = []

        onomastikaList.forEach((onom: any) => {
            const total = totalsList.find((t: any) => t.onomastikoId === onom.id)
            previousDebits.push(total?.total_debit || 0)
            previousCredits.push(total?.total_credit || 0)
        })

        return NextResponse.json({
            previousDebits,
            previousCredits
        })
    } catch (error) {
        console.error('Error fetching previous year balances:', error)
        return NextResponse.json({
            previousDebits: [],
            previousCredits: []
        })
    }
}