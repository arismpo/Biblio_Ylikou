// scripts/test-excel-summary.ts
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import { Pool } from 'pg'

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'
})

// Helper functions
function normalizeText(text: string): string {
    if (!text) return ''
    return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
}

function cleanChapterName(name: string): string {
    if (!name) return ''
    return String(name)
        .replace(/['΄`´]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function getCellValue(worksheet: XLSX.WorkSheet, row: number, col: number): any {
    const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col })
    const cell = worksheet[cellRef]
    return cell ? cell.v : undefined
}

function getCellValueByLetter(worksheet: XLSX.WorkSheet, row: number, colLetter: string): any {
    const colIndex = XLSX.utils.decode_col(colLetter)
    return getCellValue(worksheet, row, colIndex)
}

function getColumnLetter(colIndex: number): string {
    let letter = ''
    let num = colIndex
    while (num >= 0) {
        letter = String.fromCharCode(65 + (num % 26)) + letter
        num = Math.floor(num / 26) - 1
    }
    return letter
}

async function testExcelSummary() {
    const client = await pool.connect()

    try {
        const filePath = 'C:\\Biblio_Ylikou_NEW\\Excel Files\\Βιβλίο Υλικού 2026.xlsx'

        console.log(`📂 Reading Excel file: ${filePath}`)
        console.log('')

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`)
            return
        }

        // Read the Excel file
        const workbook = XLSX.readFile(filePath)

        console.log(`📋 Found ${workbook.SheetNames.length} sheets total`)
        console.log('')
        console.log('📄 SKIPPING pages 1 and 2')
        console.log(`📄 Processing pages 3-${workbook.SheetNames.length} (${workbook.SheetNames.length - 2} sheets)`)
        console.log('')
        console.log('='.repeat(80))
        console.log('📊 CHECKING PAGES 3+ FOR YEAR 2026')
        console.log('='.repeat(80))
        console.log('')

        // Get all chapters from database for year 2026
        const dbChapters = await client.query(`
            SELECT id, name FROM "year_2026"."Chapter" 
            ORDER BY name
        `)

        console.log(`📋 Found ${dbChapters.rows.length} chapters in database (year 2026)`)
        console.log('')

        // Create maps for quick lookup
        const dbChapterMap = new Map()
        const dbChapterNormalizedMap = new Map()
        dbChapters.rows.forEach(ch => {
            dbChapterMap.set(ch.name, ch.id)
            dbChapterNormalizedMap.set(normalizeText(ch.name), ch.id)
        })

        // Store results
        const missingChapters: { excel: string; sheet: string; cleaned: string; normalized: string }[] = []
        const missingOnomastika: { chapter: string; sheet: string; number: string; name: string; col: string }[] = []

        let totalSheetsProcessed = 0
        let totalOnomastikaChecked = 0
        let totalOnomastikaMatched = 0
        let totalOnomastikaNotFound = 0
        let totalOnomastikaNoNumber = 0

        // Process sheets from index 2 onwards (skip first 2)
        for (let sheetIndex = 2; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
            const sheetName = workbook.SheetNames[sheetIndex]
            const worksheet = workbook.Sheets[sheetName]

            totalSheetsProcessed++

            // Get chapter name from cell D10
            const chapterNameRaw = getCellValueByLetter(worksheet, 10, 'D')
            const chapterName = String(chapterNameRaw || '').trim()
            const cleanedName = cleanChapterName(chapterName)
            const normalizedName = normalizeText(cleanedName)

            if (!chapterName) {
                console.log(`⚠️ Sheet ${sheetIndex + 1}: "${sheetName}" - No chapter name found`)
                continue
            }

            // Check if chapter exists in database
            let chapterId = null
            let chapterDbName = null
            let chapterMatchType = 'none'

            // Try direct match
            if (dbChapterMap.has(cleanedName)) {
                chapterId = dbChapterMap.get(cleanedName)
                chapterDbName = cleanedName
                chapterMatchType = 'exact'
            } else if (dbChapterNormalizedMap.has(normalizedName)) {
                const found = dbChapters.rows.find(ch => normalizeText(ch.name) === normalizedName)
                if (found) {
                    chapterId = found.id
                    chapterDbName = found.name
                    chapterMatchType = 'normalized'
                }
            } else {
                // Try partial match
                for (const dbChapter of dbChapters.rows) {
                    const dbNorm = normalizeText(dbChapter.name)
                    if (dbNorm.includes(normalizedName) || normalizedName.includes(dbNorm)) {
                        chapterId = dbChapter.id
                        chapterDbName = dbChapter.name
                        chapterMatchType = 'partial'
                        break
                    }
                }
            }

            if (!chapterId) {
                console.log(`❌ Sheet ${sheetIndex + 1}: "${sheetName}" - Chapter NOT FOUND: "${cleanedName}"`)
                missingChapters.push({
                    excel: chapterName,
                    sheet: sheetName,
                    cleaned: cleanedName,
                    normalized: normalizedName
                })
                continue
            }

            // Get onomastika from database for this chapter
            const onomastikaResult = await client.query(`
                SELECT id, name, number FROM "year_2026"."Onomastiko" 
                WHERE "chapterId" = $1
                ORDER BY position, id
            `, [chapterId])

            // Build map by number
            const dbByNumber = new Map()
            const dbByName = new Map()
            onomastikaResult.rows.forEach(o => {
                if (o.number) {
                    const normalizedNumber = String(o.number).replace(/^0+/, '').trim()
                    dbByNumber.set(normalizedNumber, o)
                }
                dbByName.set(normalizeText(o.name), o)
            })

            // Check onomastika from Excel
            const startCol = 10 // K
            const endCol = 42   // AQ

            let sheetMatched = 0
            let sheetNotFound = 0
            let sheetNoNumber = 0

            for (let col = startCol; col <= endCol; col += 2) {
                const colLetter = getColumnLetter(col)

                // Get onomastiko number from row 8
                const onomNumberRaw = getCellValue(worksheet, 8, col)
                const onomNumber = String(onomNumberRaw || '').trim()

                // Get onomastiko name from row 8
                const onomNameRaw = getCellValue(worksheet, 8, col + 1)
                const onomName = String(onomNameRaw || '').trim()

                // Skip if no number
                if (!onomNumber) {
                    sheetNoNumber++
                    continue
                }

                // Clean the number
                const cleanNumber = onomNumber.replace(/^0+/, '').trim()

                // Check if exists in database
                let dbMatch = dbByNumber.get(cleanNumber)
                let matched = false

                if (dbMatch) {
                    matched = true
                    sheetMatched++
                } else {
                    // Try by name
                    const normalizedName = normalizeText(onomName)
                    const nameMatch = dbByName.get(normalizedName)
                    if (nameMatch) {
                        matched = true
                        sheetMatched++
                    } else {
                        sheetNotFound++
                        missingOnomastika.push({
                            chapter: chapterDbName || cleanedName,
                            sheet: sheetName,
                            number: onomNumber,
                            name: onomName,
                            col: colLetter
                        })
                    }
                }
            }

            totalOnomastikaChecked += (sheetMatched + sheetNotFound + sheetNoNumber)
            totalOnomastikaMatched += sheetMatched
            totalOnomastikaNotFound += sheetNotFound
            totalOnomastikaNoNumber += sheetNoNumber

            // Show progress
            console.log(`📄 Sheet ${sheetIndex + 1}: "${sheetName}" -> ${chapterDbName || cleanedName} (${sheetMatched} matched, ${sheetNotFound} missing, ${sheetNoNumber} no number)`)
        }

        // Final Summary
        console.log('')
        console.log('='.repeat(80))
        console.log('📊 FINAL SUMMARY')
        console.log('='.repeat(80))
        console.log('')

        console.log(`📋 Sheets Processed: ${totalSheetsProcessed}`)
        console.log('')

        console.log('📋 CHAPTERS:')
        console.log(`   ✅ Found in database:   ${totalSheetsProcessed - missingChapters.length}`)
        console.log(`   ❌ NOT FOUND:           ${missingChapters.length}`)
        console.log('')

        if (missingChapters.length > 0) {
            console.log('❌ CHAPTERS NOT FOUND:')
            console.log('─'.repeat(80))
            missingChapters.forEach((r, i) => {
                console.log(`${String(i + 1).padStart(3)}. Sheet: "${r.sheet}"`)
                console.log(`   Excel Name:   "${r.excel}"`)
                console.log(`   Cleaned:      "${r.cleaned}"`)
                console.log('')
            })
        }

        console.log('📋 ONOMASTIKA:')
        console.log(`   ✅ Total Checked:       ${totalOnomastikaChecked}`)
        console.log(`   ✅ Matched:             ${totalOnomastikaMatched}`)
        console.log(`   ❌ NOT FOUND:           ${totalOnomastikaNotFound}`)
        console.log(`   📭 No Number:           ${totalOnomastikaNoNumber}`)
        console.log(`   📊 Match Rate:          ${totalOnomastikaChecked > 0 ? ((totalOnomastikaMatched / (totalOnomastikaChecked - totalOnomastikaNoNumber)) * 100).toFixed(1) : 0}% (excluding no number)`)
        console.log('')

        if (totalOnomastikaNotFound > 0) {
            console.log('❌ ONOMASTIKA NOT FOUND:')
            console.log('─'.repeat(80))
            console.log('   # | Sheet                     | Chapter                   | Number | Name')
            console.log('   ' + '─'.repeat(80))
            missingOnomastika.forEach((r, i) => {
                console.log(
                    `${String(i + 1).padStart(3)} | ${r.sheet.padEnd(25)} | ${r.chapter.padEnd(25)} | ${r.number.padStart(8)} | ${r.name}`
                )
            })
        }

        console.log('')
        console.log('='.repeat(80))
        console.log('📊 TOTAL SUMMARY')
        console.log('='.repeat(80))
        console.log('')
        console.log(`   📋 Total Chapters NOT FOUND:  ${missingChapters.length}`)
        console.log(`   📋 Total Onomastika NOT FOUND: ${totalOnomastikaNotFound}`)
        console.log(`   📋 Total Issues:               ${missingChapters.length + totalOnomastikaNotFound}`)
        console.log('')

        if (missingChapters.length === 0 && totalOnomastikaNotFound === 0) {
            console.log('✅ ALL DATA FOUND! Ready to import.')
        } else {
            console.log('⚠️ Issues found. Please fix before importing.')
            console.log('')
            console.log('💡 RECOMMENDATIONS:')
            if (missingChapters.length > 0) {
                console.log(`   1. Add ${missingChapters.length} missing chapters to year_2026 database`)
                console.log('      (Check the Excel sheet names and chapter names)')
            }
            if (totalOnomastikaNotFound > 0) {
                console.log(`   2. Add ${totalOnomastikaNotFound} missing onomastika to year_2026 database`)
                console.log('      (Check the numbers and names in the Excel file)')
                console.log('      The missing onomastika are listed above with their sheet and chapter.')
            }
        }

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        client.release()
        await pool.end()
    }
}

// Run the test
testExcelSummary().catch(console.error)