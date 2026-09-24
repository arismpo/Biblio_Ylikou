// C:\Biblio_Ylikou_NEW\src\app\api\onomastika\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

// PUT: Update an onomastiko
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const body = await request.json()

        const { name, number, position, page, infos, highlighted, chapterId } = body

        const schemaName = getSchemaName(year)

        const result = await prisma.$queryRawUnsafe(`
            UPDATE ${schemaName}."Onomastiko"
            SET 
                name = $1,
                number = $2,
                position = $3,
                page = $4,
                infos = $5,
                highlighted = $6,
                "chapterId" = $7,
                "updatedAt" = NOW()
            WHERE id = $8
            RETURNING *
        `, name, number || null, position || 0, page || null, infos || null, highlighted || false, chapterId, id)

        const updatedOnomastiko = (result as any[])[0]

        if (!updatedOnomastiko) {
            return NextResponse.json(
                { error: 'Onomastiko not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(updatedOnomastiko)
    } catch (error) {
        console.error('Error updating onomastiko:', error)
        return NextResponse.json(
            { error: 'Failed to update onomastiko: ' + (error as Error).message },
            { status: 500 }
        )
    }
}

// DELETE: Delete an onomastiko
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const schemaName = getSchemaName(year)

        // Check if onomastiko exists
        const checkResult = await prisma.$queryRawUnsafe(`
            SELECT id FROM ${schemaName}."Onomastiko" WHERE id = $1
        `, id) as any[]

        if (!checkResult || checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Onomastiko not found' },
                { status: 404 }
            )
        }

        // Delete onomastiko (cascade will delete entries)
        await prisma.$executeRawUnsafe(
            `DELETE FROM ${schemaName}."Onomastiko" WHERE id = $1`,
            id
        )

        return NextResponse.json({
            success: true,
            message: 'Onomastiko deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting onomastiko:', error)
        return NextResponse.json(
            { error: 'Failed to delete onomastiko: ' + (error as Error).message },
            { status: 500 }
        )
    }
}