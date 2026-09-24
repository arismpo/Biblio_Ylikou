// C:\Biblio_Ylikou_NEW\src\app\api\pg-backup\list\route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getBackupDir } from '@/lib/backupUtils'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = searchParams.get('year')

        const BACKUP_DIR = getBackupDir()

        console.log(`📁 Listing backups from: ${BACKUP_DIR}`)

        if (!fs.existsSync(BACKUP_DIR)) {
            console.log(`📁 Backup directory does not exist, creating...`)
            fs.mkdirSync(BACKUP_DIR, { recursive: true })
            return NextResponse.json([])
        }

        let files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.dump'))
            .map(f => {
                const filePath = path.join(BACKUP_DIR, f)
                const stats = fs.statSync(filePath)

                // Extract year from filename (biblio_backup_2025_timestamp.dump)
                const yearMatch = f.match(/biblio_backup_(\d+)_/)
                const fileYear = yearMatch ? parseInt(yearMatch[1]) : null

                return {
                    filename: f,
                    size: stats.size,
                    created: stats.mtime.toISOString(),
                    path: filePath,
                    year: fileYear
                }
            })
            .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

        // Filter by year if provided
        if (year) {
            const yearNum = parseInt(year)
            files = files.filter(f => f.year === yearNum)
            console.log(`📁 Filtered to ${files.length} backups for year ${year}`)
        }

        console.log(`📁 Found ${files.length} backup files`)

        return NextResponse.json(files)
    } catch (error) {
        console.error('Error listing backups:', error)
        return NextResponse.json(
            { error: 'Failed to list backups: ' + (error as Error).message },
            { status: 500 }
        )
    }
}