// C:\Biblio_Ylikou_NEW\src\app\api\years\route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const result = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'year_%'
      ORDER BY schema_name
    `
        const years = (result as any[])
            .map(r => {
                const match = r.schema_name.match(/year_(\d+)/)
                return match ? parseInt(match[1]) : null
            })
            .filter(year => year !== null)
            .sort((a, b) => a - b)

        return NextResponse.json(years.length > 0 ? years : [2025])
    } catch (error) {
        console.error('Error fetching years:', error)
        return NextResponse.json([2025])
    }
}