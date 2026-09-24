import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
    try {
        console.log('📤 Uploading material code file...')

        const formData = await request.formData()
        const file = formData.get('excelFile') as File

        if (!file) {
            console.error('❌ No file uploaded')
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            )
        }

        console.log(`📁 File: ${file.name}, Size: ${file.size} bytes`)

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/octet-stream'
        ]

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
                { status: 400 }
            )
        }

        // Create uploads directory
        const uploadDir = path.join(process.cwd(), 'uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // Save file
        const timestamp = Date.now()
        const filename = `material_code_${timestamp}.xlsx`
        const filePath = path.join(uploadDir, filename)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        fs.writeFileSync(filePath, buffer)
        console.log(`✅ File saved: ${filePath}`)

        // Parse Excel file
        console.log('📊 Parsing Excel file...')
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const firstSheetName = workbook.SheetNames[0]
        const firstSheet = workbook.Sheets[firstSheetName]
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        console.log(`📊 Found ${data.length} rows`)

        if (data.length === 0) {
            return NextResponse.json(
                { error: 'Το αρχείο Excel είναι κενό' },
                { status: 400 }
            )
        }

        // Process data
        const materialsByChapter: Record<string, any[]> = {}
        const chapters: any[] = []
        let currentChapter: string | null = null
        let currentDescription: string | null = null

        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            const colA = row[0]?.toString().trim() || ''
            const colB = row[1]?.toString().trim() || ''
            const colC = row[2]?.toString().trim() || ''

            // Skip completely empty rows
            if (!colA && !colB && !colC) continue

            // 🔥 Check if column A has a chapter (with or without description)
            if (colA && !colB && !colC) {
                // This is a chapter row (only column A has data)
                let chapterCode = colA
                let description = null

                // Check if it contains " - " (chapter with description)
                if (colA.includes(' - ')) {
                    const parts = colA.split(' - ')
                    chapterCode = parts[0].trim()
                    description = parts.slice(1).join(' - ').trim()
                }

                currentChapter = chapterCode
                currentDescription = description

                if (!materialsByChapter[currentChapter]) {
                    materialsByChapter[currentChapter] = []
                    chapters.push({
                        chapterCode: currentChapter,
                        chapterName: currentChapter,
                        description: currentDescription,
                        materialCount: 0
                    })
                }

                console.log(`📚 Found chapter: ${currentChapter} ${description ? `- ${description}` : ''}`)
                continue
            }

            // If we have a chapter and column B has data (onomastiko number) and column C has name
            if (currentChapter && colB && colC) {
                // This is an onomastiko entry
                const code = colB.toString().trim()
                const name = colC.toString().trim()

                // Skip if code or name is empty
                if (!code || !name) continue

                materialsByChapter[currentChapter].push({
                    code: code,
                    name: name,
                    infos: null
                })

                console.log(`📝 Found material: ${code} - ${name}`)
            }
        }

        // Update material counts
        for (const chapter of chapters) {
            chapter.materialCount = materialsByChapter[chapter.chapterCode]?.length || 0
        }

        console.log(`📊 Found ${chapters.length} chapters with ${Object.values(materialsByChapter).reduce((sum, arr) => sum + arr.length, 0)} materials`)

        // Save parsed data
        const dataPath = path.join(uploadDir, `material_data_${timestamp}.json`)
        fs.writeFileSync(dataPath, JSON.stringify({
            filePath,
            chapters,
            materialsByChapter,
            timestamp
        }, null, 2))

        const totalMaterials = Object.values(materialsByChapter).reduce(
            (sum: number, arr: any[]) => sum + arr.length,
            0
        )

        return NextResponse.json({
            success: true,
            filePath,
            chapters,
            totalMaterials,
            totalChapters: chapters.length,
            message: `Φορτώθηκαν ${totalMaterials} υλικά σε ${chapters.length} κεφάλαια`
        })

    } catch (error) {
        console.error('❌ Error uploading material code:', error)
        return NextResponse.json(
            { error: 'Failed to upload file: ' + (error as Error).message },
            { status: 500 }
        )
    }
}