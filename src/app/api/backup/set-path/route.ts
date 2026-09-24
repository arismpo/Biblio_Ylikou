import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { getBackupConfig, saveBackupConfig } from '@/lib/backupUtils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { backupPath } = body

        console.log(`📁 Received backup path: ${backupPath}`)

        if (!backupPath) {
            return NextResponse.json(
                { error: 'Backup path is required' },
                { status: 400 }
            )
        }

        // Read existing config
        const config = getBackupConfig()

        // Update backup path
        config.backupPath = backupPath

        // Save config
        saveBackupConfig(config)

        // Ensure the directory exists
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true })
            console.log(`📁 Created backup directory: ${backupPath}`)
        }

        console.log(`✅ Backup path saved and verified: ${backupPath}`)

        return NextResponse.json({
            success: true,
            message: 'Backup path saved successfully',
            backupPath: backupPath
        })
    } catch (error) {
        console.error('Error saving backup path:', error)
        return NextResponse.json(
            { error: 'Failed to save backup path: ' + (error as Error).message },
            { status: 500 }
        )
    }
}