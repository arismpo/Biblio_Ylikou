// C:\Biblio_Ylikou_NEW\src\app\api\backup\run-now\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { getBackupDir } from '@/lib/backupUtils'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { year } = body

        if (!year) {
            return NextResponse.json(
                { error: 'Year is required for backup' },
                { status: 400 }
            )
        }

        const BACKUP_DIR = getBackupDir()
        const schemaName = `year_${year}`

        console.log(`📀 Creating backup for year: ${year} (schema: ${schemaName})`)
        console.log(`📁 Backup directory: ${BACKUP_DIR}`)

        // Ensure backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true })
            console.log(`📁 Created backup directory: ${BACKUP_DIR}`)
        }

        // Get database credentials from .env
        const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:mpo13783@localhost:5432/biblio_ylikou'

        // ✅ Extract password from connection string
        const passwordMatch = databaseUrl.match(/:\/\/[^:]+:([^@]+)@/)
        const password = passwordMatch ? passwordMatch[1] : 'mpo13783'

        // ✅ Set PGPASSWORD environment variable
        process.env.PGPASSWORD = password

        // Check if schema exists
        try {
            const checkSchemaResult = await execAsync(
                `psql -U postgres -d biblio_ylikou -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${schemaName}'"`,
                {
                    shell: 'cmd.exe',
                    env: { ...process.env, PGPASSWORD: password }
                }
            )

            if (!checkSchemaResult.stdout.includes(schemaName)) {
                return NextResponse.json(
                    { error: `Schema ${schemaName} does not exist` },
                    { status: 404 }
                )
            }
        } catch (error) {
            console.error('Error checking schema:', error)
            // Continue anyway - if schema doesn't exist, pg_dump will fail
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `biblio_backup_${year}_${timestamp}.dump`
        const backupFilePath = path.join(BACKUP_DIR, filename)

        // ✅ Build pg_dump command with PGPASSWORD
        const command = `pg_dump -U postgres -d biblio_ylikou -n ${schemaName} -Fc -f "${backupFilePath}"`

        console.log(`📀 Executing: ${command}`)

        // ✅ Execute pg_dump with PGPASSWORD in environment
        const { stdout, stderr } = await execAsync(command, {
            shell: 'cmd.exe',
            maxBuffer: 100 * 1024 * 1024,
            env: { ...process.env, PGPASSWORD: password }
        })

        if (stderr && !stderr.includes('warning') && !stderr.includes('password')) {
            console.error('pg_dump stderr:', stderr)
        }

        // Check if file was created
        if (!fs.existsSync(backupFilePath)) {
            throw new Error('Backup file was not created')
        }

        const stats = fs.statSync(backupFilePath)
        console.log(`✅ Backup created: ${filename} (${stats.size} bytes)`)
        console.log(`📁 Location: ${backupFilePath}`)

        // ✅ Clear PGPASSWORD after backup
        delete process.env.PGPASSWORD

        return NextResponse.json({
            success: true,
            filename: filename,
            size: stats.size,
            path: backupFilePath,
            year: year,
            schema: schemaName
        })
    } catch (error) {
        console.error('Error creating backup:', error)
        // ✅ Clear PGPASSWORD on error
        delete process.env.PGPASSWORD
        return NextResponse.json(
            { error: 'Failed to create backup: ' + (error as Error).message },
            { status: 500 }
        )
    }
}