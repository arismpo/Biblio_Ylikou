// src/app/api/chapters/with-records/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

export async function GET(request: NextRequest) {
    let client
    try {
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        if (isNaN(year)) {
            return NextResponse.json(
                { error: 'Invalid year parameter' },
                { status: 400 }
            )
        }

        const schemaName = `year_${year}`

        client = await pool.connect()

        // Check if schema exists
        const schemaCheck = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = $1
        `, [schemaName])

        if (schemaCheck.rows.length === 0) {
            // Schema doesn't exist, return empty array
            return NextResponse.json([])
        }

        // Query to get chapters with their record counts
        const result = await client.query(`
            SELECT 
                c.id,
                c.name,
                c.description,
                c.year,
                COUNT(r.id) as "recordsCount",
                CASE 
                    WHEN COUNT(r.id) > 0 THEN true 
                    ELSE false 
                END as "hasRecords"
            FROM "${schemaName}"."Chapter" c
            LEFT JOIN "${schemaName}"."Record" r ON r."chapterId" = c.id AND r.year = $1
            WHERE c.year = $1
            GROUP BY c.id, c.name, c.description, c.year
            ORDER BY c.position ASC, c.name ASC
        `, [year])

        // Format the response to match what the sidebar expects
        const results = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            year: row.year,
            hasRecords: row.hasRecords,
            recordsCount: parseInt(row.recordsCount)
        }))

        return NextResponse.json(results)

    } catch (error) {
        console.error('Error fetching chapters with records:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chapters' },
            { status: 500 }
        )
    } finally {
        if (client) {
            client.release()
        }
        // Don't end the pool here - it should be managed globally
    }
}