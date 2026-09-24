// C:\Biblio_Ylikou_NEW\src\app\api\onomastika\reorder\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const body = await request.json()
        const { items, chapterId } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'No items to reorder' },
                { status: 400 }
            )
        }

        if (!chapterId) {
            return NextResponse.json(
                { error: 'chapterId is required' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)

        // Update each onomastiko's position
        for (const item of items) {
            await prisma.$executeRawUnsafe(`
                UPDATE ${schemaName}."Onomastiko"
                SET position = $1, "updatedAt" = NOW()
                WHERE id = $2 AND "chapterId" = $3
            `, item.position, item.id, chapterId)
        }

        return NextResponse.json({
            success: true,
            message: 'Onomastika reordered successfully'
        })
    } catch (error) {
        console.error('Error reordering onomastika:', error)
        return NextResponse.json(
            { error: 'Failed to reorder onomastika: ' + (error as Error).message },
            { status: 500 }
        )
    }
}