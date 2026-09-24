// C:\Biblio_Ylikou_NEW\src\app\api\form2\chapter\[chapterId]\previous-year-balance\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function GET(
    request: NextRequest,
    { params }: { params: { chapterId: string } }
) {
    try {
        const chapterId = parseInt(params.chapterId)
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const previousYear = year - 1
        const schemaName = getSchemaName(year)
        const prevSchemaName = getSchemaName(previousYear)

        console.log(`📊 Fetching previous year balances for chapter ${chapterId}, year ${year}, previous ${previousYear}`)

        // ✅ 1. Get onomastika for this chapter from the NEW schema
        const onomastika = await prisma.$queryRawUnsafe(`
            SELECT id, name, number 
            FROM ${schemaName}."Onomastiko" 
            WHERE "chapterId" = ${chapterId}
            ORDER BY position
        `) as any[]

        if (onomastika.length === 0) {
            return NextResponse.json({
                previousDebits: [],
                previousCredits: [],
                previousYear: previousYear
            })
        }

        // ✅ 2. Get yearly totals from PREVIOUS year
        let previousTotals: any[] = []
        try {
            previousTotals = await prisma.$queryRawUnsafe(`
                SELECT 
                    yt.balance,
                    o.name as onomastiko_name
                FROM ${prevSchemaName}.yearly_totals yt
                JOIN ${prevSchemaName}."Onomastiko" o ON o.id = yt."onomastikoId"
                WHERE yt.year = ${previousYear}
                AND o."chapterId" = ${chapterId}
            `) as any[]
        } catch (error) {
            console.log(`⚠️ No yearly_totals table found in ${prevSchemaName}`)
        }

        // ✅ 3. Create a map of balances by onomastiko name
        const balanceMap = new Map()
        for (const total of previousTotals) {
            const key = total.onomastiko_name
            const balance = total.balance || 0
            balanceMap.set(key, balance)
        }

        // ✅ 4. Build arrays: if balance > 0 → debit, if balance < 0 → credit (as positive)
        const previousDebits: number[] = []
        const previousCredits: number[] = []

        for (const onom of onomastika) {
            const balance = balanceMap.get(onom.name) || 0

            if (balance > 0) {
                // ✅ Θετικό υπόλοιπο → Χρέωση
                previousDebits.push(balance)
                previousCredits.push(0)
            } else if (balance < 0) {
                // ✅ Αρνητικό υπόλοιπο → Πίστωση (ως θετικός αριθμός)
                previousDebits.push(0)
                previousCredits.push(Math.abs(balance))
            } else {
                previousDebits.push(0)
                previousCredits.push(0)
            }
        }

        console.log(`📊 Found ${previousTotals.length} previous year balances`)

        return NextResponse.json({
            previousDebits,
            previousCredits,
            previousYear: previousYear
        })

    } catch (error) {
        console.error('Error fetching previous year balances:', error)
        return NextResponse.json(
            { error: 'Failed to fetch previous year balances: ' + (error as Error).message },
            { status: 500 }
        )
    }
}