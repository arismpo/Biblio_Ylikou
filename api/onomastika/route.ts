// C:\Biblio_Ylikou_NEW\api\onomastika\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const chapterId = parseInt(searchParams.get('chapterId') || '0')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const schemaName = `year_${year}`

    if (!chapterId) {
        return NextResponse.json([])
    }

    try {
        const onomastika = await prisma.$queryRaw`
      SELECT * FROM ${prisma.raw(schemaName)}."Onomastiko"
      WHERE "chapterId" = ${chapterId}
      ORDER BY position ASC
    `
        return NextResponse.json(onomastika || [])
    } catch (error) {
        console.error('Error fetching onomastika:', error)
        return NextResponse.json([])
    }
}