// C:\Biblio_Ylikou_NEW\src\app\api\pg-backup\restore-from-upload\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { getBackupDir } from '@/lib/backupUtils'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
    try {
        const BACKUP_DIR = getBackupDir()

        // Ensure backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true })
        }

        const formData = await request.formData()
        const file = formData.get('backup') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No backup file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.name.endsWith('.dump') && !file.name.endsWith('.sql')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only .dump and .sql files are allowed' },
                { status: 400 }
            )
        }

        // Save uploaded file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `uploaded_backup_${timestamp}.dump`
        const filepath = path.join(BACKUP_DIR, filename)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        fs.writeFileSync(filepath, buffer)

        console.log(`📁 Uploaded backup saved: ${filename} (${buffer.length} bytes)`)

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

        console.log(`✅ Restore completed successfully from uploaded file`)

        // Optionally delete the temporary file after restore
        // fs.unlinkSync(filepath)

        return NextResponse.json({
            success: true,
            message: 'Το backup επαναφέρθηκε επιτυχώς!',
            filename: filename
        })
    } catch (error) {
        console.error('Error restoring from uploaded backup:', error)
        return NextResponse.json(
            { error: 'Failed to restore from uploaded backup: ' + (error as Error).message },
            { status: 500 }
        )
    }
}