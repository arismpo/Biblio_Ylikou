// C:\Biblio_Ylikou_NEW\src\app\api\onomastika\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

// GET: List onomastika for a chapter
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const chapterId = parseInt(searchParams.get('chapterId') || '0')
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        if (!chapterId) {
            return NextResponse.json(
                { error: 'chapterId is required' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)

        const onomastika = await prisma.$queryRawUnsafe(`
            SELECT * FROM ${schemaName}."Onomastiko"
            WHERE "chapterId" = $1
            ORDER BY position ASC
        `, chapterId)

        return NextResponse.json(onomastika)
    } catch (error) {
        console.error('Error fetching onomastika:', error)
        return NextResponse.json(
            { error: 'Failed to fetch onomastika' },
            { status: 500 }
        )
    }
}

// POST: Create a new onomastiko
export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const body = await request.json()

        const { name, number, position, page, infos, highlighted, chapterId } = body

        if (!name || !chapterId) {
            return NextResponse.json(
                { error: 'name and chapterId are required' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)

        // Get max position for this chapter
        const maxPositionResult = await prisma.$queryRawUnsafe(`
            SELECT COALESCE(MAX(position), -1) as maxPos FROM ${schemaName}."Onomastiko" WHERE "chapterId" = $1
        `, chapterId) as any[]
        const maxPosition = maxPositionResult[0]?.maxpos || -1

        const result = await prisma.$queryRawUnsafe(`
            INSERT INTO ${schemaName}."Onomastiko" (
                name, number, position, page, infos, highlighted, "chapterId", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *
        `, name, number || null, position !== undefined ? position : maxPosition + 1, page || null, infos || null, highlighted || false, chapterId)

        const newOnomastiko = (result as any[])[0]

        return NextResponse.json(newOnomastiko, { status: 201 })
    } catch (error) {
        console.error('Error creating onomastiko:', error)
        return NextResponse.json(
            { error: 'Failed to create onomastiko: ' + (error as Error).message },
            { status: 500 }
        )
    }
}