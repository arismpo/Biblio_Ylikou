// C:\Biblio_Ylikou_NEW\src\app\api\pg-backup\download\[filename]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getBackupDir } from '@/lib/backupUtils'

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename
        const BACKUP_DIR = getBackupDir()
        const filepath = path.join(BACKUP_DIR, filename)

        console.log(`📥 Downloading backup: ${filename}`)
        console.log(`📁 From: ${filepath}`)

        if (!fs.existsSync(filepath)) {
            return NextResponse.json(
                { error: 'Backup file not found' },
                { status: 404 }
            )
        }

        const fileBuffer = fs.readFileSync(filepath)
        const stats = fs.statSync(filepath)

        const headers = new Headers()
        headers.set('Content-Type', 'application/octet-stream')
        headers.set('Content-Disposition', `attachment; filename="${filename}"`)
        headers.set('Content-Length', stats.size.toString())

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: headers
        })
    } catch (error) {
        console.error('Error downloading backup:', error)
        return NextResponse.json(
            { error: 'Failed to download backup: ' + (error as Error).message },
            { status: 500 }
        )
    }
}