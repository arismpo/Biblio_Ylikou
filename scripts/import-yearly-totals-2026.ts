// scripts/import-yearly-totals-2026.ts
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

async function importYearlyTotals2026() {
    const client = await pool.connect()

    try {
        const filePath = 'C:\\Biblio_Ylikou_NEW\\Excel Files\\Βιβλίο Υλικού 2026.xlsx'
        const targetYear = 2026

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

        // ✅ STEP 1: TRUNCATE the yearly_totals table for year 2026
        console.log('='.repeat(80))
        console.log('🗑️ STEP 1: Erasing existing yearly_totals for year 2026')
        console.log('='.repeat(80))
        console.log('')

        const deleteResult = await client.query(`
            DELETE FROM "year_2026".yearly_totals
            WHERE year = $1
        `, [targetYear])

        console.log(`✅ Deleted ${deleteResult.rowCount} existing entries from yearly_totals for year ${targetYear}`)
        console.log('')

        // ✅ STEP 2: Import new data
        console.log('='.repeat(80))
        console.log('📥 STEP 2: Importing new data from Excel')
        console.log('='.repeat(80))
        console.log('')
        console.log('📄 SKIPPING pages 1 and 2')
        console.log(`📄 Processing pages 3-${workbook.SheetNames.length} (${workbook.SheetNames.length - 2} sheets)`)
        console.log('')

        // Get sheets from index 2 onwards (skip first 2)
        const sheetsToProcess = workbook.SheetNames.slice(2)

        if (sheetsToProcess.length === 0) {
            console.log('⚠️ No sheets found to process')
            return
        }

        console.log(`📋 Processing ${sheetsToProcess.length} sheets`)
        console.log('')

        let totalChaptersProcessed = 0
        let totalOnomastikaInserted = 0
        let totalChaptersNotFound = 0
        let totalOnomastikaNotFound = 0
        let totalErrors = 0

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

        for (const sheetName of sheetsToProcess) {
            console.log('='.repeat(80))
            console.log(`📄 SHEET: ${sheetName}`)
            console.log('='.repeat(80))
            console.log('')

            const worksheet = workbook.Sheets[sheetName]

            // Get chapter name from cell D10
            const chapterNameRaw = getCellValueByLetter(worksheet, 10, 'D')
            const chapterName = String(chapterNameRaw || '').trim()
            const cleanedName = cleanChapterName(chapterName)
            const normalizedName = normalizeText(cleanedName)

            console.log(`📌 Chapter Name: "${chapterName}"`)

            if (!chapterName) {
                console.log(`⚠️ No chapter name found, skipping sheet`)
                console.log('')
                continue
            }

            // Find chapter in database
            let chapterId = null
            let chapterDbName = null

            // Try direct match
            if (dbChapterMap.has(cleanedName)) {
                chapterId = dbChapterMap.get(cleanedName)
                chapterDbName = cleanedName
            } else if (dbChapterNormalizedMap.has(normalizedName)) {
                const found = dbChapters.rows.find(ch => normalizeText(ch.name) === normalizedName)
                if (found) {
                    chapterId = found.id
                    chapterDbName = found.name
                }
            } else {
                // Try partial match
                for (const dbChapter of dbChapters.rows) {
                    const dbNorm = normalizeText(dbChapter.name)
                    if (dbNorm.includes(normalizedName) || normalizedName.includes(dbNorm)) {
                        chapterId = dbChapter.id
                        chapterDbName = dbChapter.name
                        break
                    }
                }
            }

            if (!chapterId) {
                console.log(`❌ Chapter NOT FOUND: "${cleanedName}"`)
                totalChaptersNotFound++
                totalErrors++
                console.log('')
                continue
            }

            console.log(`✅ Chapter found: "${chapterDbName}" (ID: ${chapterId})`)
            totalChaptersProcessed++
            console.log('')

            // Get all onomastika from year_2026 for this chapter
            const onomastikaResult = await client.query(`
                SELECT id, name, number FROM "year_2026"."Onomastiko" 
                WHERE "chapterId" = $1
                ORDER BY position, id
            `, [chapterId])

            console.log(`📋 Found ${onomastikaResult.rows.length} onomastika in year_2026 for this chapter`)
            console.log('')

            // Build map of database onomastika by number
            const dbByNumber = new Map()
            const dbByName = new Map()

            onomastikaResult.rows.forEach(o => {
                if (o.number) {
                    const normalizedNumber = String(o.number).replace(/^0+/, '').trim()
                    dbByNumber.set(normalizedNumber, o)
                }
                dbByName.set(normalizeText(o.name), o)
            })

            // Get onomastiko data from Excel (row 8 = number, row 13 = values)
            const startCol = 10 // K
            const endCol = 42   // AQ
            const dataRow = 13

            let sheetInserted = 0
            let sheetNotFound = 0
            let sheetNoNumber = 0

            // Process each pair of columns (debit/credit)
            for (let col = startCol; col <= endCol; col += 2) {
                const colLetter = getColumnLetter(col)

                // Get onomastiko number from row 8
                const onomNumberRaw = getCellValue(worksheet, 8, col)
                const onomNumber = String(onomNumberRaw || '').trim()

                // Get onomastiko name from row 8 (for reference)
                const onomNameRaw = getCellValue(worksheet, 8, col + 1)
                const onomName = String(onomNameRaw || '').trim()

                // Skip if no number
                if (!onomNumber) {
                    sheetNoNumber++
                    continue
                }

                // Clean the number (remove leading zeros, spaces)
                const cleanNumber = onomNumber.replace(/^0+/, '').trim()

                // Find matching onomastiko in database by number
                let dbMatch = dbByNumber.get(cleanNumber)

                // If not found by number, try by name
                if (!dbMatch && onomName) {
                    const normalizedName = normalizeText(onomName)
                    dbMatch = dbByName.get(normalizedName)
                }

                if (!dbMatch) {
                    console.log(`⚠️ Onomastiko not found: Number "${onomNumber}", Name "${onomName}"`)
                    sheetNotFound++
                    totalOnomastikaNotFound++
                    continue
                }

                // Get debit and credit from row 13
                const debitValue = parseFloat(getCellValue(worksheet, dataRow, col)) || 0
                const creditValue = parseFloat(getCellValue(worksheet, dataRow, col + 1)) || 0

                // Skip if both are zero
                if (debitValue === 0 && creditValue === 0) {
                    continue
                }

                // Insert new yearly total
                const balance = debitValue - creditValue

                await client.query(`
                    INSERT INTO "year_2026".yearly_totals (
                        year, "chapterId", "onomastikoId", "totalDebit", "totalCredit", balance, "createdAt", "updatedAt"
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                `, [targetYear, chapterId, dbMatch.id, debitValue, creditValue, balance])

                sheetInserted++
                console.log(`   ✅ Inserted: ${dbMatch.name} (${dbMatch.number}) - Debit: ${debitValue}, Credit: ${creditValue}`)
            }

            console.log('')
            console.log(`📊 Summary for "${chapterDbName}":`)
            console.log(`   ✅ Inserted: ${sheetInserted} onomastika`)
            console.log(`   ❌ Not Found: ${sheetNotFound} onomastika`)
            console.log(`   📭 No Number: ${sheetNoNumber} entries`)
            console.log('')

            totalOnomastikaInserted += sheetInserted
        }

        console.log('='.repeat(80))
        console.log('📊 FINAL SUMMARY')
        console.log('='.repeat(80))
        console.log('')
        console.log(`🗑️ Deleted: ${deleteResult.rowCount} existing entries from yearly_totals`)
        console.log('')
        console.log(`📋 Chapters Processed:   ${totalChaptersProcessed}`)
        console.log(`📋 Chapters NOT Found:   ${totalChaptersNotFound}`)
        console.log(`📋 Onomastika Inserted:  ${totalOnomastikaInserted}`)
        console.log(`📋 Onomastika NOT Found: ${totalOnomastikaNotFound}`)
        console.log('')

        // Verify the import
        console.log('📊 Verifying database entries:')
        const verifyResult = await client.query(`
            SELECT 
                COUNT(*) as total,
                SUM("totalDebit") as totalDebit,
                SUM("totalCredit") as totalCredit
            FROM "year_2026".yearly_totals
            WHERE year = $1
        `, [targetYear])

        console.log(`   Total entries: ${verifyResult.rows[0].total}`)
        console.log(`   Total Debit: ${verifyResult.rows[0].totalDebit || 0}`)
        console.log(`   Total Credit: ${verifyResult.rows[0].totalCredit || 0}`)
        console.log(`   Net Balance: ${(verifyResult.rows[0].totalDebit || 0) - (verifyResult.rows[0].totalCredit || 0)}`)
        console.log('')

        if (totalChaptersNotFound === 0 && totalOnomastikaNotFound === 0) {
            console.log('✅ IMPORT COMPLETED SUCCESSFULLY!')
        } else {
            console.log('⚠️ IMPORT COMPLETED WITH ISSUES:')
            if (totalChaptersNotFound > 0) {
                console.log(`   - ${totalChaptersNotFound} chapters not found in database`)
            }
            if (totalOnomastikaNotFound > 0) {
                console.log(`   - ${totalOnomastikaNotFound} onomastika not found in database`)
            }
            console.log('')
            console.log('💡 These entries were skipped. Please add them to the database and try again.')
        }

    } catch (error) {
        console.error('❌ Error during import:', error)
    } finally {
        client.release()
        await pool.end()
    }
}

// Run the import
importYearlyTotals2026().catch(console.error)