import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { filePath, searchTerm, chapterCode, page = 1, limit = 50 } = body

        if (!filePath || !searchTerm) {
            return NextResponse.json(
                { error: 'File path and search term are required' },
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

        const searchTermLower = searchTerm.toLowerCase()
        let allMaterials: any[] = []

        if (chapterCode) {
            // Search only in specific chapter
            allMaterials = data.materialsByChapter?.[chapterCode] || []
        } else {
            // Search in all chapters
            for (const [code, materials] of Object.entries(data.materialsByChapter || {})) {
                allMaterials = [...allMaterials, ...(materials as any[])]
            }
        }

        // Filter by search term
        const filtered = allMaterials.filter((m: any) => {
            const nameMatch = m.name?.toLowerCase().includes(searchTermLower)
            const codeMatch = m.code?.toLowerCase().includes(searchTermLower)
            const infosMatch = m.infos?.toLowerCase().includes(searchTermLower)
            return nameMatch || codeMatch || infosMatch
        })

        const total = filtered.length

        // Pagination
        const startIndex = (page - 1) * limit
        const endIndex = Math.min(startIndex + limit, total)
        const paginatedMaterials = filtered.slice(startIndex, endIndex)

        return NextResponse.json({
            success: true,
            materials: paginatedMaterials,
            total,
            hasMore: endIndex < total,
            page,
            limit
        })

    } catch (error) {
        console.error('Error searching materials:', error)
        return NextResponse.json(
            { error: 'Failed to search materials: ' + (error as Error).message },
            { status: 500 }
        )
    }
}