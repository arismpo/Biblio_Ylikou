// C:\Biblio_Ylikou_NEW\src\lib\backupUtils.ts
import fs from 'fs'
import path from 'path'

export interface BackupConfig {
    backupPath: string
    enabled: boolean
    schedule: string
    retention: number
}

const CONFIG_FILE = path.join(process.cwd(), 'backup-config.json')

export function getDefaultConfig(): BackupConfig {
    return {
        backupPath: 'C:\\Backup_Biblio',
        enabled: false,
        schedule: 'daily',
        retention: 30
    }
}

export function getBackupConfig(): BackupConfig {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
            const config = JSON.parse(data)
            return {
                ...getDefaultConfig(),
                ...config
            }
        }
    } catch (error) {
        console.error('Error reading backup config:', error)
    }
    return getDefaultConfig()
}

export function saveBackupConfig(config: BackupConfig): void {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
        console.log(`✅ Backup config saved: ${CONFIG_FILE}`)
    } catch (error) {
        console.error('Error saving backup config:', error)
        throw error
    }
}

export function getBackupDir(): string {
    const config = getBackupConfig()
    return config.backupPath
}