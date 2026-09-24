// C:\Biblio_Ylikou_NEW\src\app\api\debug\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || 2025)
    const schemaName = `year_${year}`

    try {
        // 1. Έλεγχος σύνδεσης
        const dbTime = await prisma.$queryRaw`SELECT NOW() as time`

        // 2. Έλεγχος ύπαρξης schema
        const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'year_%'
      ORDER BY schema_name
    `

        // 3. Έλεγχος ύπαρξης πίνακα Chapter
        let tableExists = false
        let chapters = []
        try {
            const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ${schemaName} 
        AND table_name = 'Chapter'
      `
            tableExists = (tableCheck as any[]).length > 0

            if (tableExists) {
                chapters = await prisma.$queryRaw`
          SELECT * FROM "${schemaName}"."Chapter"
          LIMIT 5
        `
            }
        } catch (e) {
            console.error('Error checking table:', e)
        }

        return NextResponse.json({
            success: true,
            year,
            schemaName,
            dbTime,
            schemas,
            tableExists,
            chapters
        })
    } catch (error) {
        console.error('Debug error:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}