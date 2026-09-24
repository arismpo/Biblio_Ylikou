// C:\Biblio_Ylikou_NEW\src\app\api\check-existing-materials\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'
import { convertLatinToGreek, convertGreekToLatin } from '@/lib/greekConverter'

export async function POST(request: NextRequest) {
    try {
        console.log('🔍🔍🔍 CHECK-EXISTING-MATERIALS API CALLED 🔍🔍🔍')

        const body = await request.json()
        const { materials, chapterName, year } = body

        if (!materials || !Array.isArray(materials) || !chapterName) {
            console.log('❌ Invalid request')
            return NextResponse.json(
                { error: 'Materials and chapter name are required' },
                { status: 400 }
            )
        }

        // ✅ ΠΑΡΕ ΤΟ ΣΩΣΤΟ SCHEMA
        const currentYear = parseInt(year) || new Date().getFullYear()
        const schemaName = getSchemaName(currentYear)
        console.log(`📌 Using schema: ${schemaName}`)

        // 🔥 LOWERCASE LOGS - ΕΜΦΑΝΙΣΗ ΚΑΙ ΤΩΝ ΔΥΟ ΕΚΔΟΣΕΩΝ
        const excelGreek = chapterName.toLowerCase()
        const excelLatin = convertGreekToLatin(chapterName).toLowerCase()

        console.log(`📌 CHAPTER FROM EXCEL (Greek): "${excelGreek}"`)
        console.log(`📌 CHAPTER FROM EXCEL (Latin): "${excelLatin}"`)

        // 🔥 1. ΠΑΡΕ ΟΛΑ ΤΑ ΚΕΦΑΛΑΙΑ ΓΙΑ ΤΟ ΕΤΟΣ ΑΠΟ ΤΟ ΣΩΣΤΟ SCHEMA
        const allChapters = await prisma.$queryRawUnsafe(`
            SELECT id, name 
            FROM ${schemaName}."Chapter" 
            WHERE year = ${currentYear}
        `) as any[]

        console.log(`📊 Available chapters in schema ${schemaName} (${allChapters.length}):`)
        if (allChapters.length === 0) {
            console.log('   ⚠️ No chapters found for year', currentYear)
        } else {
            allChapters.forEach((c: any) => {
                const dbLatin = c.name.toLowerCase()
                const dbGreek = convertLatinToGreek(c.name).toLowerCase()
                console.log(`   - DB: "${c.name}" | Latin: "${dbLatin}" | Greek: "${dbGreek}"`)
            })
        }

        // 🔥 2. ΒΡΕΣ ΤΟ ΚΕΦΑΛΑΙΟ - ΔΟΚΙΜΑΣΕ ΟΛΕΣ ΤΙΣ ΕΚΔΟΣΕΙΣ
        let chapter = null
        const searchVersions = [
            excelGreek,           // "α.α.α."
            excelLatin,           // "a.a.a."
            excelGreek.replace(/\./g, '').replace(/\s/g, ''),  // "ααα"
            excelLatin.replace(/\./g, '').replace(/\s/g, ''),  // "aaa"
        ]

        const uniqueSearchVersions = [...new Set(searchVersions)]

        console.log('🔍 Searching with versions:')
        uniqueSearchVersions.forEach(v => {
            console.log(`   - "${v}"`)
        })

        for (const searchName of uniqueSearchVersions) {
            if (chapter) break

            chapter = allChapters.find((c: any) => c.name.toLowerCase() === searchName)
            if (chapter) {
                console.log(`✅ Found by exact match: "${searchName}" -> "${chapter.name}"`)
                break
            }

            const searchNormalized = searchName.replace(/\./g, '').replace(/\s/g, '')
            chapter = allChapters.find((c: any) => {
                const cNormalized = c.name.toLowerCase().replace(/\./g, '').replace(/\s/g, '')
                return cNormalized === searchNormalized
            })
            if (chapter) {
                console.log(`✅ Found by normalized match: "${searchName}" -> "${chapter.name}"`)
                break
            }
        }

        if (!chapter) {
            console.log(`❌❌❌ CHAPTER NOT FOUND ❌❌❌`)
            console.log(`📌 Searched for (Greek): "${excelGreek}"`)
            console.log(`📌 Searched for (Latin): "${excelLatin}"`)
            console.log(`📌 Available chapters: ${allChapters.map((c: any) => `"${c.name.toLowerCase()}"`).join(', ')}`)

            return NextResponse.json({
                success: true,
                materials: materials.map((m: any) => ({
                    ...m,
                    exists: false,
                    existingOnomastikoName: null
                }))
            })
        }

        console.log(`✅✅✅ FOUND CHAPTER: "${chapter.name}" (ID: ${chapter.id}) ✅✅✅`)

        // 🔥 3. ΠΑΡΕ ΟΛΑ ΤΑ ΟΝΟΜΑΣΤΙΚΑ ΤΟΥ ΚΕΦΑΛΑΙΟΥ ΑΠΟ ΤΟ ΣΩΣΤΟ SCHEMA
        const onomastika = await prisma.$queryRawUnsafe(`
            SELECT id, name, number 
            FROM ${schemaName}."Onomastiko" 
            WHERE "chapterId" = ${chapter.id}
            ORDER BY position
        `) as any[]

        console.log(`📊 Found ${onomastika.length} onomastika in chapter "${chapter.name}"`)

        // 🔥 4. ΔΗΜΙΟΥΡΓΗΣΕ MAP ΜΕ ΒΑΣΗ ΤΟΝ ΑΡΙΘΜΟ
        const onomastikaMap = new Map()
        onomastika.forEach((o: any) => {
            onomastikaMap.set(String(o.number), o.name)
        })

        const numbers = Array.from(onomastikaMap.keys())
        console.log(`📊 Onomastika numbers: ${numbers.length > 0 ? numbers.join(', ') : 'NONE'}`)

        // 🔥 5. ΕΛΕΓΞΕ ΚΑΘΕ ΥΛΙΚΟ
        const updatedMaterials = materials.map((m: any, index: number) => {
            const code = String(m.code).trim()
            const existingName = onomastikaMap.get(code)
            const exists = !!existingName

            if (index < 10 || exists) {
                console.log(`${exists ? '✅' : '❌'} Code: "${code}" -> ${exists ? `EXISTS: "${existingName}"` : 'NEW'}`)
            } else if (index === 10) {
                console.log(`... και ${materials.length - 10} ακόμα υλικά`)
            }

            return {
                ...m,
                exists: exists,
                existingOnomastikoName: existingName || null
            }
        })

        const existingCount = updatedMaterials.filter((m: any) => m.exists).length
        const newCount = updatedMaterials.filter((m: any) => !m.exists).length
        console.log(`📊 Results: ${existingCount} existing, ${newCount} new`)

        return NextResponse.json({
            success: true,
            materials: updatedMaterials
        })

    } catch (error) {
        console.error('❌ Error in check-existing-materials:', error)
        return NextResponse.json(
            { error: 'Failed to check existing materials: ' + (error as Error).message },
            { status: 500 }
        )
    }
}