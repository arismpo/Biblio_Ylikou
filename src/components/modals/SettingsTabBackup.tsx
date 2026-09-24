// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabBackup.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface SettingsTabBackupProps {
    darkMode: boolean
    backupPath: string
    setBackupPath: (value: string) => void
    selectedYear: number  // ✅ ΝΕΟ: Το έτος από το parent
}

const SettingsTabBackup: React.FC<SettingsTabBackupProps> = ({
    darkMode,
    backupPath,
    setBackupPath,
    selectedYear  // ✅ ΝΕΟ
}) => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [backups, setBackups] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [localPath, setLocalPath] = useState(backupPath || 'C:\\Backup_Biblio')
    const [availableYears, setAvailableYears] = useState<number[]>([])
    const [backupYear, setBackupYear] = useState<number>(selectedYear || new Date().getFullYear())  // ✅ ΝΕΟ
    const [filterYear, setFilterYear] = useState<number | null>(selectedYear || null)  // ✅ ΝΕΟ

    // Φόρτωση backup path από localStorage αν είναι undefined
    useEffect(() => {
        console.log('📁 SettingsTabBackup - backupPath prop:', backupPath)

        let path = backupPath
        if (!path || path === 'undefined' || path === '') {
            const saved = localStorage.getItem('app_settings_backupPath')
            if (saved) {
                path = saved
                console.log('📁 Loaded from localStorage:', path)
                if (typeof setBackupPath === 'function') {
                    setBackupPath(path)
                }
            } else {
                path = 'C:\\Backup_Biblio'
            }
        }
        setLocalPath(path)
    }, [backupPath])

    // ✅ Φόρτωση διαθέσιμων ετών
    useEffect(() => {
        fetchAvailableYears()
    }, [])

    // ✅ Φόρτωση backups και stats όταν αλλάζει το φίλτρο έτους
    useEffect(() => {
        loadBackups()
        loadStats()
    }, [filterYear])

    const fetchAvailableYears = async () => {
        try {
            const res = await axios.get('/api/years')
            setAvailableYears(res.data)
        } catch (error) {
            console.error('Error fetching years:', error)
        }
    }

    const loadBackups = async () => {
        try {
            const url = filterYear ? `/api/pg-backup/list?year=${filterYear}` : '/api/pg-backup/list'
            const res = await axios.get(url)
            console.log('📁 Raw backup data:', res.data)
            setBackups(res.data)
        } catch (error) {
            console.error('Error loading backups:', error)
        }
    }

    const loadStats = async () => {
        try {
            const url = filterYear ? `/api/backup/stats?year=${filterYear}` : '/api/backup/stats'
            const res = await axios.get(url)
            setStats(res.data)
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    // Συνάρτηση για αποθήκευση backup path
    const saveBackupPath = async (path: string) => {
        try {
            localStorage.setItem('app_settings_backupPath', path)
            await axios.post('/api/backup/set-path', { backupPath: path })
            console.log(`✅ Backup path saved: ${path}`)
            setMessage({ type: 'success', text: `✅ Διαδρομή αποθηκεύτηκε: ${path}` })
            setTimeout(() => setMessage(null), 2000)
        } catch (error) {
            console.error('Error saving backup path:', error)
            setMessage({ type: 'error', text: '❌ Σφάλμα αποθήκευσης διαδρομής' })
            setTimeout(() => setMessage(null), 2000)
        }
    }

    // Όταν αλλάζει το input
    const handlePathChange = (value: string) => {
        setLocalPath(value)
        if (typeof setBackupPath === 'function') {
            setBackupPath(value)
        } else {
            console.warn('setBackupPath is not a function, using localStorage directly')
            localStorage.setItem('app_settings_backupPath', value)
        }

        clearTimeout((window as any)._pathTimeout)
            ; (window as any)._pathTimeout = setTimeout(() => {
                saveBackupPath(value)
            }, 500)
    }

    // Επιλογή φακέλου
    const handleSelectFolder = () => {
        if (typeof setBackupPath !== 'function') {
            console.warn('setBackupPath is not a function, using localStorage directly')
            const customPath = prompt('Εισάγετε τη διαδρομή για τα backups:', localPath)
            if (customPath) {
                localStorage.setItem('app_settings_backupPath', customPath)
                setLocalPath(customPath)
                saveBackupPath(customPath)
            }
            return
        }

        if ('showDirectoryPicker' in window) {
            // @ts-ignore
            window.showDirectoryPicker()
                .then(async (dirHandle: any) => {
                    const path = `C:\\${dirHandle.name}`
                    setLocalPath(path)
                    setBackupPath(path)
                    await saveBackupPath(path)
                })
                .catch((err: any) => {
                    console.error('Error selecting folder:', err)
                    const customPath = prompt('Εισάγετε τη διαδρομή για τα backups:', localPath)
                    if (customPath) {
                        setLocalPath(customPath)
                        setBackupPath(customPath)
                        saveBackupPath(customPath)
                    }
                })
        } else {
            const customPath = prompt('Εισάγετε τη διαδρομή για τα backups:', localPath)
            if (customPath) {
                setLocalPath(customPath)
                setBackupPath(customPath)
                saveBackupPath(customPath)
            }
        }
    }

    const handleManualBackup = async () => {
        setLoading(true)
        setMessage(null)
        try {
            // ✅ Send the selected year
            const res = await axios.post('/api/backup/run-now', { year: backupYear })
            console.log('Backup response:', res.data)
            setMessage({ type: 'success', text: `✅ Backup δημιουργήθηκε για το έτος ${backupYear}: ${res.data.filename}` })
            setTimeout(async () => {
                await loadBackups()
                await loadStats()
                console.log('📁 Reloaded backups after creation')
            }, 1000)
        } catch (error) {
            console.error('Backup error:', error)
            setMessage({ type: 'error', text: '❌ Σφάλμα κατά τη δημιουργία backup: ' + (error as any).response?.data?.error || '' })
        } finally {
            setLoading(false)
            setTimeout(() => setMessage(null), 3000)
        }
    }

    const handleDownload = async (filename: string) => {
        setDownloading(true)
        try {
            const response = await axios.get(`/api/pg-backup/download/${filename}`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            setMessage({ type: 'success', text: `📥 Λήψη του ${filename}` })
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Η λήψη απέτυχε' })
        } finally {
            setDownloading(false)
            setTimeout(() => setMessage(null), 3000)
        }
    }

    const handleDelete = async (filename: string) => {
        if (!window.confirm(`Θέλετε σίγουρα να διαγράψετε το backup ${filename};`)) return
        setDeleting(true)
        try {
            await axios.delete(`/api/pg-backup/delete/${filename}`)
            setMessage({ type: 'success', text: '🗑️ Το backup διαγράφηκε' })
            loadBackups()
            loadStats()
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Σφάλμα διαγραφής' })
        } finally {
            setDeleting(false)
            setTimeout(() => setMessage(null), 3000)
        }
    }

    const handleRestore = async (filename: string) => {
        if (!window.confirm(`ΠΡΟΣΟΧΗ! Αυτή η ενέργεια θα αντικαταστήσει ΟΛΑ τα τρέχοντα δεδομένα στο schema του έτους ${filterYear || backupYear} με το backup ${filename}. Συνεχίζετε;`)) return
        setLoading(true)
        setMessage(null)
        try {
            const res = await axios.post(`/api/pg-backup/restore/${filename}`)
            setMessage({ type: 'success', text: res.data.message })
            setTimeout(() => {
                window.location.href = '/'
            }, 2000)
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || '❌ Σφάλμα κατά την επαναφορά' })
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!importFile) {
            setMessage({ type: 'error', text: 'Παρακαλώ επιλέξτε ένα αρχείο backup πρώτα' })
            setTimeout(() => setMessage(null), 3000)
            return
        }
        if (!window.confirm('ΠΡΟΣΟΧΗ! Αυτό θα αντικαταστήσει ΟΛΑ τα υπάρχοντα δεδομένα. Συνεχίζετε;')) return
        setImporting(true)
        setMessage(null)
        try {
            const formData = new FormData()
            formData.append('backup', importFile)
            const res = await axios.post('/api/pg-backup/restore-from-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000
            })
            setMessage({ type: 'success', text: res.data.message })
            setImportFile(null)
            const fileInput = document.getElementById('import-file') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            setTimeout(() => {
                loadBackups()
                loadStats()
            }, 2000)
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || '❌ Σφάλμα κατά την επαναφορά' })
        } finally {
            setImporting(false)
            setTimeout(() => setMessage(null), 5000)
        }
    }

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B'
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Unknown'
        const date = new Date(dateStr)
        return date.toLocaleString('el-GR')
    }

    return (
        <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                💾 Ρυθμίσεις Backup
            </h3>

            {/* Status messages */}
            {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                        <div className="text-xl font-bold text-blue-600">{stats.totalBackups || 0}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Σύνολο</div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                        <div className="text-xl font-bold text-green-600">{stats.totalSizeFormatted || '0 B'}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Μέγεθος</div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                        <div className="text-xl font-bold text-purple-600">
                            {stats.schedule?.enabled ? '✅' : '⭕'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Αυτόματο</div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                        <div className="text-sm font-bold text-orange-600 truncate">
                            {stats.lastBackup ? formatDate(stats.lastBackup.date) : '—'}
                            {stats.lastBackup?.year && <span className="text-xs text-gray-500 block">Έτος: {stats.lastBackup.year}</span>}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Τελευταίο</div>
                    </div>
                </div>
            )}

            {/* Backup Path */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    📁 Τοποθεσία αποθήκευσης
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={localPath || 'C:\\Backup_Biblio'}
                        onChange={(e) => handlePathChange(e.target.value)}
                        className={`flex-1 border rounded-md px-3 py-2 text-sm ${darkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        placeholder="C:\Backup_Biblio"
                    />
                    <button
                        onClick={handleSelectFolder}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } transition-colors`}
                    >
                        📂 Επιλογή
                    </button>
                </div>
                <div className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    💡 Ο φάκελος όπου θα αποθηκεύονται τα backups (αποθηκεύεται αυτόματα)
                </div>
            </div>

            {/* ✅ YEAR SELECTION FOR BACKUP */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            📅 Έτος για Backup
                        </label>
                        <select
                            value={backupYear}
                            onChange={(e) => setBackupYear(parseInt(e.target.value))}
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Το έτος που θα συμπεριληφθεί στο backup
                        </p>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            🔍 Φίλτρο Εμφάνισης
                        </label>
                        <select
                            value={filterYear || ''}
                            onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : null)}
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        >
                            <option value="">Όλα τα έτη</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Φιλτράρισμα λίστας backups ανά έτος
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    onClick={handleManualBackup}
                    disabled={loading || !availableYears.includes(backupYear)}
                    className={`px-4 py-2 rounded-lg font-medium ${loading || !availableYears.includes(backupYear)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {loading ? '⏳...' : `💾 Backup ${backupYear}`}
                </button>
                <div className="flex gap-2">
                    <input
                        id="import-file"
                        type="file"
                        accept=".dump,.sql"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="hidden"
                    />
                    <label
                        htmlFor="import-file"
                        className={`flex-1 px-4 py-2 text-center ${darkMode
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            } rounded-lg cursor-pointer font-medium`}
                    >
                        📁 Επιλογή
                    </label>
                    <button
                        onClick={handleImport}
                        disabled={!importFile || importing}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                    >
                        {importing ? '⏳...' : '📥 Επαναφορά'}
                    </button>
                </div>
            </div>

            {/* Backups List */}
            <div>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    📋 Λίστα Backups ({backups.length})
                    {filterYear && <span className="text-sm font-normal text-gray-500 ml-2">(Έτος: {filterYear})</span>}
                </h4>
                {backups.length === 0 ? (
                    <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Δεν υπάρχουν backups {filterYear ? `για το έτος ${filterYear}` : ''}
                    </p>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {backups.map((backup) => (
                            <div
                                key={backup.filename}
                                className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {backup.filename}
                                    </div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatSize(backup.size)} • {formatDate(backup.created)}
                                        {backup.year && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-[10px]">Έτος {backup.year}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleDownload(backup.filename)}
                                        disabled={downloading}
                                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs"
                                        title="Λήψη"
                                    >
                                        ⬇️
                                    </button>
                                    <button
                                        onClick={() => handleRestore(backup.filename)}
                                        disabled={loading}
                                        className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-xs"
                                        title="Επαναφορά"
                                    >
                                        🔄
                                    </button>
                                    <button
                                        onClick={() => handleDelete(backup.filename)}
                                        disabled={deleting}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs"
                                        title="Διαγραφή"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} text-xs`}>
                <p className={darkMode ? 'text-blue-300' : 'text-blue-700'}>
                    ⚠️ Τα backups είναι ανά έτος (schema-specific). Η επαναφορά ενός backup θα αντικαταστήσει ΟΛΑ τα δεδομένα του συγκεκριμένου έτους.
                </p>
            </div>
        </div>
    )
}

export default SettingsTabBackup