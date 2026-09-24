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

  try {
    // Get all onomastika for this chapter
    const allOnomastika = await prisma.onomastiko.findMany({
      where: { chapterId },
      select: { id: true }
    })

    // Get yearly totals for previous year
    const yearlyTotals = await prisma.yearlyTotal.findMany({
      where: {
        year: previousYear,
        chapterId
      },
      select: {
        onomastikoId: true,
        totalDebit: true,
        totalCredit: true
      }
    })

    const previousDebits: number[] = []
    const previousCredits: number[] = []

    allOnomastika.forEach((onom, idx) => {
      const total = yearlyTotals.find(t => t.onomastikoId === onom.id)
      previousDebits[idx] = total?.totalDebit || 0
      previousCredits[idx] = total?.totalCredit || 0
    })

    return NextResponse.json({
      previousDebits,
      previousCredits
    })
  } catch (error) {
    console.error('Error fetching previous year balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    )
  }
}