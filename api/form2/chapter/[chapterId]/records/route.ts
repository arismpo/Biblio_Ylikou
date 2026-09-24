import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  const chapterId = parseInt(params.chapterId)
  const searchParams = request.nextUrl.searchParams
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const body = await request.json()
  const { records } = body

  console.log(`💾 Saving ${records.length} records for chapter ${chapterId}, year ${year}`)

  try {
    // Get all onomastika for this chapter
    const allOnomastika = await prisma.onomastiko.findMany({
      where: { chapterId },
      select: { id: true }
    })
    const validOnomastikoIds = new Set(allOnomastika.map(o => o.id))

    const existingRecords = await prisma.record.findMany({
      where: { chapterId, year },
      select: { id: true }
    })
    const existingRecordIds = new Set(existingRecords.map(r => r.id))
    const newRecordIds = new Set(records.filter(r => r.id).map(r => r.id))

    for (const rec of records) {
      if (!rec.month || !rec.day || !rec.description) continue

      const entriesToSave = (rec.cells || [])
        .filter(cell => cell.onomastikoId && validOnomastikoIds.has(cell.onomastikoId))
        .filter(cell => cell.debit || cell.credit)
        .map(cell => ({
          debit: cell.debit ? parseFloat(cell.debit) : null,
          credit: cell.credit ? parseFloat(cell.credit) : null,
          onomastikoId: cell.onomastikoId
        }))

      if (rec.id && existingRecordIds.has(rec.id)) {
        await prisma.record.update({
          where: { id: rec.id },
          data: {
            aa: rec.aa ? parseInt(rec.aa) : null,
            month: rec.month,
            day: parseInt(rec.day),
            description: rec.description,
            document: rec.document || null,
          }
        })

        await prisma.entry.deleteMany({ where: { recordId: rec.id } })

        if (entriesToSave.length > 0) {
          await prisma.entry.createMany({
            data: entriesToSave.map(e => ({ ...e, recordId: rec.id }))
          })
        }
      } else {
        const newRecord = await prisma.record.create({
          data: {
            aa: rec.aa ? parseInt(rec.aa) : null,
            month: rec.month,
            day: parseInt(rec.day),
            description: rec.description,
            document: rec.document || null,
            year,
            chapterId,
          }
        })

        if (entriesToSave.length > 0) {
          await prisma.entry.createMany({
            data: entriesToSave.map(e => ({ ...e, recordId: newRecord.id }))
          })
        }
      }
    }

    const recordsToDelete = [...existingRecordIds].filter(id => !newRecordIds.has(id))
    for (const recordId of recordsToDelete) {
      await prisma.entry.deleteMany({ where: { recordId } })
      await prisma.record.delete({ where: { id: recordId } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Save error:', error)
    return NextResponse.json(
      { error: 'Failed to save records' },
      { status: 500 }
    )
  }
}