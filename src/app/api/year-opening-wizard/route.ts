// C:\Biblio_Ylikou_NEW\src\app\api\year-opening-wizard\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName, schemaExists, createSchema, createTables } from '@/utils/schemaManager'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { sourceYear, targetYear, chapterOrder } = body

        console.log(`📅 Opening year ${targetYear} from ${sourceYear}`)

        // 1. Έλεγχος αν το έτος-στόχος υπάρχει ήδη
        const exists = await schemaExists(targetYear)
        if (exists) {
            return NextResponse.json(
                { error: `Το έτος ${targetYear} υπάρχει ήδη` },
                { status: 400 }
            )
        }

        // 2. Δημιουργία schema και πινάκων για το νέο έτος
        await createSchema(targetYear)
        await createTables(targetYear)

        const sourceSchema = getSchemaName(sourceYear)
        const targetSchema = getSchemaName(targetYear)

        // 3. Λήψη των κεφαλαίων από το source schema
        const sourceChapters = await prisma.$queryRawUnsafe(`
            SELECT 
                c.id,
                c.name,
                c.description,
                c.page,
                c.year,
                c.position,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', o.id,
                            'name', o.name,
                            'number', o.number,
                            'position', o.position,
                            'page', o.page,
                            'infos', o.infos,
                            'highlighted', o.highlighted
                        ) ORDER BY o.position
                    ) FILTER (WHERE o.id IS NOT NULL),
                    '[]'::json
                ) as onomastika
            FROM ${sourceSchema}."Chapter" c
            LEFT JOIN ${sourceSchema}."Onomastiko" o ON o."chapterId" = c.id
            WHERE c.year = ${sourceYear}
            GROUP BY c.id
            ORDER BY c.position
        `) as any[]

        if (!sourceChapters || sourceChapters.length === 0) {
            return NextResponse.json(
                { error: `Δεν υπάρχουν κεφάλαια για το έτος ${sourceYear}` },
                { status: 400 }
            )
        }

        // 4. Λήψη των yearly totals από το source year
        let sourceYearlyTotals: any[] = []
        try {
            sourceYearlyTotals = await prisma.$queryRawUnsafe(`
                SELECT 
                    yt.*,
                    o.name as onomastiko_name,
                    o."chapterId" as onomastiko_chapterId,
                    c.name as chapter_name
                FROM ${sourceSchema}.yearly_totals yt
                JOIN ${sourceSchema}."Onomastiko" o ON o.id = yt."onomastikoId"
                JOIN ${sourceSchema}."Chapter" c ON c.id = o."chapterId"
                WHERE yt.year = ${sourceYear}
            `) as any[]
            console.log(`📊 Found ${sourceYearlyTotals.length} yearly totals in source year`)
        } catch (error) {
            console.log('⚠️ No yearly totals found in source year')
        }

        // 5. Δημιουργία chapter order map
        const orderMap: Record<number, number> = {}
        if (chapterOrder && chapterOrder.length > 0) {
            chapterOrder.forEach((ch: any) => {
                orderMap[ch.id] = ch.position
            })
        }

        const sortedChapters = sourceChapters.sort((a, b) => {
            const posA = orderMap[a.id] || 999
            const posB = orderMap[b.id] || 999
            return posA - posB
        })

        let chaptersCreated = 0
        let onomastikaCreated = 0
        let totalsCopied = 0
        const chapterMap = new Map<number, number>()

        // 6. Δημιουργία κεφαλαίων και ονομαστικών στο target schema
        for (const sourceChapter of sortedChapters) {
            const newChapterResult = await prisma.$queryRawUnsafe(
                `INSERT INTO ${targetSchema}."Chapter" (
                    name, description, page, year, position, "createdAt", "updatedAt"
                ) VALUES (
                    $1, $2, $3, $4, $5, NOW(), NOW()
                ) RETURNING id`,
                sourceChapter.name,
                sourceChapter.description || null,
                sourceChapter.page || null,
                targetYear,
                orderMap[sourceChapter.id] || 0
            ) as any[]

            const newChapterId = newChapterResult[0]?.id
            if (!newChapterId) continue

            chapterMap.set(sourceChapter.id, newChapterId)
            chaptersCreated++

            const onomastika = sourceChapter.onomastika || []
            for (const onom of onomastika) {
                await prisma.$queryRawUnsafe(
                    `INSERT INTO ${targetSchema}."Onomastiko" (
                        name, number, position, page, infos, highlighted, "chapterId", "createdAt", "updatedAt"
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
                    )`,
                    onom.name,
                    onom.number || null,
                    onom.position || 0,
                    onom.page || null,
                    onom.infos || null,
                    onom.highlighted || false,
                    newChapterId
                )
                onomastikaCreated++
            }
        }

        // 7. Δημιουργία map για target onomastika
        const chapterIds = [...chapterMap.values()]
        if (chapterIds.length > 0 && sourceYearlyTotals.length > 0) {
            const targetOnomastika = await prisma.$queryRawUnsafe(`
                SELECT 
                    o.id,
                    o.name,
                    o."chapterId",
                    c.name as chapter_name
                FROM ${targetSchema}."Onomastiko" o
                JOIN ${targetSchema}."Chapter" c ON c.id = o."chapterId"
                WHERE o."chapterId" = ANY($1)
            `, chapterIds) as any[]

            const targetMap = new Map<string, { id: number; chapterId: number }>()
            for (const targetOnom of targetOnomastika) {
                const key = `${targetOnom.chapter_name}_${targetOnom.name}`
                targetMap.set(key, { id: targetOnom.id, chapterId: targetOnom.chapterId })
            }

            // ✅ 8. Αντιγραφή yearly totals
            for (const sourceTotal of sourceYearlyTotals) {
                const key = `${sourceTotal.chapter_name}_${sourceTotal.onomastiko_name}`
                const targetOnom = targetMap.get(key)

                if (targetOnom) {
                    await prisma.$queryRawUnsafe(
                        `INSERT INTO ${targetSchema}.yearly_totals (
                            year, "chapterId", "onomastikoId", "totalDebit", "totalCredit", balance, "createdAt", "updatedAt"
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, NOW(), NOW()
                        )`,
                        targetYear,
                        targetOnom.chapterId,
                        targetOnom.id,
                        0,
                        0,
                        sourceTotal.balance || 0
                    )
                    totalsCopied++
                }
            }
            console.log(`✅ Copied ${totalsCopied} yearly totals`)
        }

        console.log(`✅ Created ${chaptersCreated} chapters, ${onomastikaCreated} onomastika`)

        return NextResponse.json({
            success: true,
            message: `Το έτος ${targetYear} ανοίχθηκε επιτυχώς! ${chaptersCreated} κεφάλαια, ${onomastikaCreated} ονομαστικά, ${totalsCopied} υπόλοιπα.`,
            chaptersCreated,
            onomastikaCreated,
            totalsCopied
        })

    } catch (error) {
        console.error('Error in year opening wizard:', error)
        return NextResponse.json(
            { error: (error as Error).message || 'Σφάλμα κατά το άνοιγμα του έτους' },
            { status: 500 }
        )
    }
}