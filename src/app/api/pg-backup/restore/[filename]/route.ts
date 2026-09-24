// C:\Biblio_Ylikou_NEW\src\app\api\pg-backup\restore\[filename]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { getBackupDir } from '@/lib/backupUtils'

const execAsync = promisify(exec)

export async function POST(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename
        const BACKUP_DIR = getBackupDir()
        const filepath = path.join(BACKUP_DIR, filename)

        console.log(`🔄 Restoring backup: ${filename}`)
        console.log(`📁 From: ${filepath}`)

        if (!fs.existsSync(filepath)) {
            return NextResponse.json(
                { error: 'Backup file not found' },
                { status: 404 }
            )
        }

        // Get database credentials from .env
        const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'

        // ✅ Extract password from connection string
        const passwordMatch = databaseUrl.match(/:\/\/[^:]+:([^@]+)@/)
        const password = passwordMatch ? passwordMatch[1] : 'mpo13783'

        // ✅ Build restore command with PGPASSWORD
        const restoreCommand = `pg_restore -U postgres -d biblio_ylikou --clean --if-exists --no-owner --no-privileges "${filepath}"`

        console.log(`🔄 Executing: ${restoreCommand}`)

        // ✅ Execute restore with PGPASSWORD in environment
        await execAsync(restoreCommand, {
            shell: 'cmd.exe',
            maxBuffer: 100 * 1024 * 1024,
            timeout: 300000,
            env: { ...process.env, PGPASSWORD: password }
        })

        console.log(`✅ Backup restored: ${filename}`)

        return NextResponse.json({
            success: true,
            message: `Το backup ${filename} επαναφέρθηκε επιτυχώς!`
        })
    } catch (error) {
        console.error('Error restoring backup:', error)
        return NextResponse.json(
            { error: 'Failed to restore backup: ' + (error as Error).message },
            { status: 500 }
        )
    }
}