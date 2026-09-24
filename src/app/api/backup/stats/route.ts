// C:\Biblio_Ylikou_NEW\src\app\api\backup\stats\route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getBackupDir, getBackupConfig } from '@/lib/backupUtils'

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = searchParams.get('year')

        const BACKUP_DIR = getBackupDir()

        console.log(`📁 Stats for: ${BACKUP_DIR}${year ? ` (year: ${year})` : ''}`)

        if (!fs.existsSync(BACKUP_DIR)) {
            return NextResponse.json({
                totalBackups: 0,
                totalSize: 0,
                totalSizeFormatted: '0 B',
                lastBackup: null,
                schedule: getBackupConfig()
            })
        }

        let files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.dump'))
            .map(f => {
                const filePath = path.join(BACKUP_DIR, f)
                const stats = fs.statSync(filePath)
                const yearMatch = f.match(/biblio_backup_(\d+)_/)
                return {
                    filename: f,
                    size: stats.size,
                    created: stats.mtime,
                    year: yearMatch ? parseInt(yearMatch[1]) : null
                }
            })
            .sort((a, b) => b.created.getTime() - a.created.getTime())

        // Filter by year if provided
        if (year) {
            const yearNum = parseInt(year)
            files = files.filter(f => f.year === yearNum)
        }

        const totalSize = files.reduce((sum, f) => sum + f.size, 0)
        const lastBackup = files.length > 0 ? files[0] : null

        // Group by year
        const byYear: Record<number, { count: number, size: number }> = {}
        files.forEach(f => {
            if (f.year) {
                if (!byYear[f.year]) {
                    byYear[f.year] = { count: 0, size: 0 }
                }
                byYear[f.year].count++
                byYear[f.year].size += f.size
            }
        })

        return NextResponse.json({
            totalBackups: files.length,
            totalSize: totalSize,
            totalSizeFormatted: formatBytes(totalSize),
            lastBackup: lastBackup ? {
                filename: lastBackup.filename,
                size: lastBackup.size,
                sizeFormatted: formatBytes(lastBackup.size),
                date: lastBackup.created,
                year: lastBackup.year
            } : null,
            byYear: byYear,
            schedule: getBackupConfig()
        })
    } catch (error) {
        console.error('Error getting backup stats:', error)
        return NextResponse.json(
            { error: 'Failed to get backup stats' },
            { status: 500 }
        )
    }
}