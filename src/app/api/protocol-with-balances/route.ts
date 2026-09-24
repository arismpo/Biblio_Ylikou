// C:\Biblio_Ylikou_NEW\src\app\api\protocol-with-balances\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const previousYear = year - 1
        const schemaName = getSchemaName(year)
        const prevSchemaName = getSchemaName(previousYear)

        console.log(`📊 Protocol with balances - Year: ${year}, Schema: ${schemaName}`)

        // 1. Get previous year totals (opening balances)
        let previousBalanceMap = new Map()
        try {
            const previousTotals = await prisma.$queryRawUnsafe(`
                SELECT 
                    yt.*,
                    o.name as onomastiko_name,
                    o."chapterId" as onomastiko_chapterId,
                    c.name as chapter_name
                FROM ${prevSchemaName}.yearly_totals yt
                JOIN ${prevSchemaName}."Onomastiko" o ON o.id = yt."onomastikoId"
                JOIN ${prevSchemaName}."Chapter" c ON c.id = o."chapterId"
                WHERE yt.year = ${previousYear}
            `) as any[]

            for (const yt of previousTotals) {
                const key = `${yt.chapter_name}|${yt.onomastiko_name}`
                previousBalanceMap.set(key, yt.balance || 0)
            }
            console.log(`📊 Found ${previousTotals.length} previous year totals`)
        } catch (error) {
            console.log('⚠️ No previous year data found, using empty balances')
        }

        // 2. Get current year movements from records
        const currentMovementMap = new Map()
        try {
            const currentRecords = await prisma.$queryRawUnsafe(`
                SELECT 
                    r.id,
                    r.year,
                    e.debit,
                    e.credit,
                    o.name as onomastiko_name,
                    o."chapterId" as onomastiko_chapterId,
                    c.name as chapter_name
                FROM ${schemaName}."Record" r
                JOIN ${schemaName}."Entry" e ON e."recordId" = r.id
                JOIN ${schemaName}."Onomastiko" o ON o.id = e."onomastikoId"
                JOIN ${schemaName}."Chapter" c ON c.id = o."chapterId"
                WHERE r.year = ${year}
            `) as any[]

            for (const entry of currentRecords) {
                const key = `${entry.chapter_name}|${entry.onomastiko_name}`
                if (!currentMovementMap.has(key)) {
                    currentMovementMap.set(key, { debit: 0, credit: 0 })
                }
                const movement = currentMovementMap.get(key)
                movement.debit += entry.debit || 0
                movement.credit += entry.credit || 0
            }
            console.log(`📊 Found ${currentRecords.length} current year entries`)
        } catch (error) {
            console.log('⚠️ No current year records found')
        }

        // 3. Get chapters with ALL onomastika
        const chapters = await prisma.$queryRawUnsafe(`
            SELECT 
                c.id,
                c.name,
                c.page,
                c.year,
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
                ) as onomastika
            FROM ${schemaName}."Chapter" c
            LEFT JOIN ${schemaName}."Onomastiko" o ON o."chapterId" = c.id
            WHERE c.year = ${year}
            GROUP BY c.id
            ORDER BY c.position
        `) as any[]

        const result = {
            success: true,
            year: year,
            totalChapters: chapters.length,
            totalOnomastika: 0,
            chapters: []
        }

        for (const chapter of chapters) {
            const onomastikaList = []
            const onomastika = chapter.onomastika || []

            for (const onom of onomastika) {
                const key = `${chapter.name}|${onom.name}`
                const openingBalance = previousBalanceMap.get(key) || 0
                const movement = currentMovementMap.get(key) || { debit: 0, credit: 0 }
                const totalDebit = movement.debit
                const totalCredit = movement.credit
                const runningTotal = openingBalance + totalDebit
                const closingBalance = runningTotal - totalCredit

                onomastikaList.push({
                    id: onom.id,
                    name: onom.name,
                    number: onom.number || '',
                    page: onom.page || 1,
                    previousBalance: openingBalance,
                    totalDebit: totalDebit,
                    totalCredit: totalCredit,
                    runningTotal: runningTotal,
                    balance: closingBalance
                })
                result.totalOnomastika++
            }

            result.chapters.push({
                id: chapter.id,
                name: chapter.name,
                page: chapter.page,
                onomastika: onomastikaList,
                onomastikaCount: onomastikaList.length
            })
        }

        console.log(`✅ Sent ${result.totalOnomastika} onomastika from ${result.totalChapters} chapters`)

        return NextResponse.json(result)

    } catch (error) {
        console.error('Error in protocol-with-balances:', error)
        return NextResponse.json(
            { error: 'Failed to get protocol data: ' + (error as Error).message },
            { status: 500 }
        )
    }
}