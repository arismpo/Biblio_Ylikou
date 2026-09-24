import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

  try {
    const chapters = await prisma.chapter.findMany({
      where: { year },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            records: {
              where: { year }
            }
          }
        }
      }
    })

    const results = chapters.map(chapter => ({
      id: chapter.id,
      name: chapter.name,
      description: chapter.description,
      hasRecords: chapter._count.records > 0,
      recordsCount: chapter._count.records
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching chapters with records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    )
  }
}