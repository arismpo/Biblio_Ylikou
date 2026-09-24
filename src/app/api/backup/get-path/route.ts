import { NextResponse } from 'next/server'
import { getBackupDir } from '@/lib/backupUtils'

export async function GET() {
    try {
        const backupPath = getBackupDir()
        console.log(`📁 Returning backup path: ${backupPath}`)
        return NextResponse.json({ backupPath })
    } catch (error) {
        console.error('Error getting backup path:', error)
        return NextResponse.json(
            { error: 'Failed to get backup path' },
            { status: 500 }
        )
    }
}