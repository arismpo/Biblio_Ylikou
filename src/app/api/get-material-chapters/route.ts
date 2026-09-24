import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { filePath } = body

        if (!filePath) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            )
        }

        // Find the corresponding JSON data file
        const uploadDir = path.join(process.cwd(), 'uploads')
        const files = fs.readdirSync(uploadDir)
        const jsonFiles = files.filter(f => f.startsWith('material_data_') && f.endsWith('.json'))

        if (jsonFiles.length === 0) {
            return NextResponse.json(
                { error: 'No material data found' },
                { status: 404 }
            )
        }

        // Get the latest data file
        const latestFile = jsonFiles.sort().pop()
        const dataPath = path.join(uploadDir, latestFile!)
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

        return NextResponse.json({
            success: true,
            chapters: data.chapters || []
        })

    } catch (error) {
        console.error('Error getting material chapters:', error)
        return NextResponse.json(
            { error: 'Failed to get chapters: ' + (error as Error).message },
            { status: 500 }
        )
    }
}