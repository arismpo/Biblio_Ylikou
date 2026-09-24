// C:\Biblio_Ylikou_NEW\src\app\api\records\[id]\attachments\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

// GET: Get all attachments for a record
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const recordId = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        if (isNaN(recordId)) {
            return NextResponse.json(
                { error: 'Invalid record ID' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)
        console.log(`📂 Getting attachments from schema: ${schemaName}`)

        // ✅ Get attachments from the correct schema
        const attachments = await prisma.$queryRawUnsafe(`
            SELECT id, filename, "mimeType", size, "recordId", "createdAt", "updatedAt"
            FROM ${schemaName}."Attachment"
            WHERE "recordId" = $1
            ORDER BY "createdAt" DESC
        `, recordId)

        return NextResponse.json(attachments)
    } catch (error) {
        console.error('Error fetching attachments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch attachments' },
            { status: 500 }
        )
    }
}

// POST: Upload an attachment
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const recordId = parseInt(params.id)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        if (isNaN(recordId)) {
            return NextResponse.json(
                { error: 'Invalid record ID' },
                { status: 400 }
            )
        }

        const schemaName = getSchemaName(year)
        console.log(`📂 Saving attachment to schema: ${schemaName}`)

        // Check if record exists in the correct schema
        const recordResult = await prisma.$queryRawUnsafe(
            `SELECT id FROM ${schemaName}."Record" WHERE id = $1`,
            recordId
        ) as any[]

        if (!recordResult || recordResult.length === 0) {
            return NextResponse.json(
                { error: 'Record not found in this year' },
                { status: 404 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 50MB' },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'File type not allowed' },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // ✅ Insert attachment into the correct schema
        const result = await prisma.$queryRawUnsafe(`
            INSERT INTO ${schemaName}."Attachment" (
                filename, "mimeType", size, data, "recordId", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING id, filename, "mimeType", size
        `, file.name, file.type, file.size, buffer, recordId) as any[]

        const attachment = result[0]

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            attachment: {
                id: attachment.id,
                filename: attachment.filename,
                mimeType: attachment.mimeType,
                size: attachment.size
            }
        })
    } catch (error) {
        console.error('Error uploading attachment:', error)
        return NextResponse.json(
            { error: 'Failed to upload file: ' + (error as Error).message },
            { status: 500 }
        )
    }
}