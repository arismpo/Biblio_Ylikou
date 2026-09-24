// C:\Biblio_Ylikou_NEW\src\app\api\pg-backup\delete\[filename]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getBackupDir } from '@/lib/backupUtils'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename
        const BACKUP_DIR = getBackupDir()
        const filepath = path.join(BACKUP_DIR, filename)

        console.log(`🗑️ Deleting backup: ${filename}`)
        console.log(`📁 From: ${filepath}`)

        if (!fs.existsSync(filepath)) {
            return NextResponse.json(
                { error: 'Backup file not found' },
                { status: 404 }
            )
        }

        fs.unlinkSync(filepath)

        console.log(`✅ Backup deleted: ${filename}`)

        return NextResponse.json({
            success: true,
            message: `Το backup ${filename} διαγράφηκε επιτυχώς!`
        })
    } catch (error) {
        console.error('Error deleting backup:', error)
        return NextResponse.json(
            { error: 'Failed to delete backup: ' + (error as Error).message },
            { status: 500 }
        )
    }
}