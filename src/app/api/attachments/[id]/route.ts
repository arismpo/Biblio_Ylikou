// C:\Biblio_Ylikou_NEW\src\app\api\attachments\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

// GET: Fetch a single attachment (for preview/download)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid attachment ID' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)
        console.log(`📂 Getting attachment from schema: ${schemaName}, id: ${id}`)

        // ✅ Get attachment from the correct schema
        const result = await prisma.$queryRawUnsafe(`
            SELECT * FROM ${schemaName}."Attachment" WHERE id = $1
        `, id) as any[]

        if (!result || result.length === 0) {
            console.log(`❌ Attachment ${id} not found in schema ${schemaName}`)
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            )
        }

        const attachment = result[0]
        console.log(`✅ Found attachment: ${attachment.filename} (${attachment.size} bytes)`)

        const headers = new Headers()
        headers.set('Content-Type', attachment.mimeType || 'application/octet-stream')
        headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.filename)}"`)
        headers.set('Content-Length', attachment.size.toString())
        headers.set('Access-Control-Allow-Origin', '*')
        headers.set('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
        headers.set('Access-Control-Allow-Headers', 'Content-Type')

        return new NextResponse(attachment.data, {
            status: 200,
            headers: headers
        })

    } catch (error) {
        console.error('Error fetching attachment:', error)
        return NextResponse.json(
            { error: 'Failed to fetch attachment: ' + (error as Error).message },
            { status: 500 }
        )
    }
}

// DELETE: Delete an attachment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid attachment ID' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)
        console.log(`📂 Deleting attachment from schema: ${schemaName}, id: ${id}`)

        // Check if attachment exists
        const result = await prisma.$queryRawUnsafe(`
            SELECT id FROM ${schemaName}."Attachment" WHERE id = $1
        `, id) as any[]

        if (!result || result.length === 0) {
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            )
        }

        // ✅ Delete attachment from the correct schema
        await prisma.$executeRawUnsafe(
            `DELETE FROM ${schemaName}."Attachment" WHERE id = $1`,
            id
        )

        return NextResponse.json({
            success: true,
            message: 'Attachment deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting attachment:', error)
        return NextResponse.json(
            { error: 'Failed to delete attachment: ' + (error as Error).message },
            { status: 500 }
        )
    }
}

// OPTIONS: Handle CORS preflight
export async function OPTIONS() {
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return new NextResponse(null, {
        status: 200,
        headers: headers
    })
}