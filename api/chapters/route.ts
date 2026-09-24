// C:\Biblio_Ylikou_NEW\api\chapters\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Λήψη όλων των κεφαλαίων
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const schemaName = `year_${year}`

    try {
        const chapters = await prisma.$queryRaw`
      SELECT id, name, description, page, year, position, "createdAt", "updatedAt"
      FROM ${prisma.raw(schemaName)}."Chapter"
      WHERE year = ${year}
      ORDER BY name ASC
    `
        return NextResponse.json(chapters || [])
    } catch (error) {
        console.error('Error fetching chapters:', error)
        return NextResponse.json([])
    }
}

// POST - Δημιουργία νέου κεφαλαίου
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, description, page, year } = body

        if (!name || !year) {
            return NextResponse.json(
                { error: 'Missing required fields: name, year' },
                { status: 400 }
            )
        }

        const schemaName = `year_${year}`

        // Έλεγχος αν υπάρχει ήδη κεφάλαιο με το ίδιο όνομα
        const existing = await prisma.$queryRaw`
      SELECT id FROM ${prisma.raw(schemaName)}."Chapter"
      WHERE name = ${name} AND year = ${year}
    `

        if ((existing as any[]).length > 0) {
            return NextResponse.json(
                { error: 'Chapter already exists' },
                { status: 400 }
            )
        }

        // Δημιουργία νέου κεφαλαίου
        const result = await prisma.$queryRaw`
      INSERT INTO ${prisma.raw(schemaName)}."Chapter" 
      (name, description, page, year, position, "createdAt", "updatedAt")
      VALUES (${name}, ${description || null}, ${page || null}, ${year}, 0, NOW(), NOW())
      RETURNING id, name, description, page, year, position, "createdAt", "updatedAt"
    `

        return NextResponse.json((result as any[])[0] || {})
    } catch (error) {
        console.error('Error creating chapter:', error)
        return NextResponse.json(
            { error: 'Failed to create chapter: ' + error.message },
            { status: 500 }
        )
    }
}