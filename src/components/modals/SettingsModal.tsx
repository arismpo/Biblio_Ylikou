// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import SettingsTabAppearance from './SettingsTabAppearance'
import SettingsTabBackup from './SettingsTabBackup'
import SettingsTabManagement from './SettingsTabManagement/index'
import SettingsTabUserSettings from './SettingsTabUserSettings'
import SettingsTabMaintenance from './SettingsTabMaintenance'
import axios from 'axios'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
    setDarkMode: (value: boolean) => void
    frozenHeader: boolean
    setFrozenHeader: (value: boolean) => void
    frozenFooter: boolean
    setFrozenFooter: (value: boolean) => void
    frozenColumns: boolean
    setFrozenColumns: (value: boolean) => void
    sidebarOpen: boolean
    setSidebarOpen: (value: boolean) => void
    backupPath: string
    setBackupPath: (value: string) => void
    selectedYear: number
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    darkMode,
    setDarkMode,
    frozenHeader,
    setFrozenHeader,
    frozenFooter,
    setFrozenFooter,
    frozenColumns,
    setFrozenColumns,
    sidebarOpen,
    setSidebarOpen,
    backupPath,
    setBackupPath,
    selectedYear
}) => {
    const [activeTab, setActiveTab] = useState<'appearance' | 'backup' | 'management' | 'userSettings'>('appearance')  // ✅ ΝΕΟ
    const [localBackupPath, setLocalBackupPath] = useState('C:\\Backup_Biblio')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    // Φόρτωση backup path από το config file όταν ανοίγει το modal
    useEffect(() => {
        if (isOpen) {
            loadBackupPath()
        }
    }, [isOpen])

    // Ενημέρωση localBackupPath όταν αλλάζει το backupPath από το parent
    useEffect(() => {
        if (backupPath && backupPath !== 'C:\\Backup_Biblio') {
            setLocalBackupPath(backupPath)
        }
    }, [backupPath])

    const loadBackupPath = async () => {
        try {
            const res = await axios.get('/api/backup/get-path')
            console.log('📁 Loaded backup path from API:', res.data.backupPath)

            if (res.data.backupPath) {
                const path = res.data.backupPath
                setLocalBackupPath(path)
                if (typeof setBackupPath === 'function') {
                    setBackupPath(path)
                }
                localStorage.setItem('app_settings_backupPath', path)
            } else {
                const saved = localStorage.getItem('app_settings_backupPath')
                if (saved) {
                    setLocalBackupPath(saved)
                    if (typeof setBackupPath === 'function') {
                        setBackupPath(saved)
                    }
                }
            }
        } catch (error) {
            console.error('Error loading backup path:', error)
            const saved = localStorage.getItem('app_settings_backupPath')
            if (saved) {
                setLocalBackupPath(saved)
                if (typeof setBackupPath === 'function') {
                    setBackupPath(saved)
                }
            }
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-5xl overflow-hidden flex flex-col`}
                style={{
                    height: '92vh',
                    maxHeight: '92vh',
                    minHeight: '92vh'
                }}
            >

                {/* Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ⚙️ Ρυθμίσεις
                    </h2>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                    >
                        ✕
                    </button>
                </div>

                {/* Status messages */}
                {message && (
                    <div className={`mx-4 mt-2 p-3 rounded-lg ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0 overflow-x-auto`}>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'appearance'
                            ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                            : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                            }`}
                    >
                        🎨 Εμφάνιση
                    </button>
                    <button
                        onClick={() => setActiveTab('backup')}
                        className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'backup'
                            ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                            : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                            }`}
                    >
                        💾 Backup
                    </button>
                    <button
                        onClick={() => setActiveTab('management')}
                        className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'management'
                            ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                            : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                            }`}
                    >
                        📋 Διαχείριση
                    </button>
                    <button
                        onClick={() => setActiveTab('userSettings')}
                        className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'userSettings'
                            ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                            : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                            }`}
                    >
                        👤 Ρυθμίσεις Χρήστη
                    </button>
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'maintenance'
                                ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                                : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                            }`}
                    >
                        🛠️ Συντήρηση
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'appearance' && (
                        <SettingsTabAppearance
                            darkMode={darkMode}
                            setDarkMode={setDarkMode}
                            frozenHeader={frozenHeader}
                            setFrozenHeader={setFrozenHeader}
                            frozenFooter={frozenFooter}
                            setFrozenFooter={setFrozenFooter}
                            frozenColumns={frozenColumns}
                            setFrozenColumns={setFrozenColumns}
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
                    )}

                    {activeTab === 'backup' && (
                        <SettingsTabBackup
                            darkMode={darkMode}
                            backupPath={localBackupPath}
                            setBackupPath={(path: string) => {
                                setLocalBackupPath(path)
                                if (typeof setBackupPath === 'function') {
                                    setBackupPath(path)
                                }
                                localStorage.setItem('app_settings_backupPath', path)
                            }}
                            selectedYear={selectedYear}
                        />
                    )}

                    {activeTab === 'management' && (
                        <SettingsTabManagement
                            darkMode={darkMode}
                            selectedYear={selectedYear}
                        />
                    )}

                    {activeTab === 'userSettings' && (
                        <SettingsTabUserSettings
                            darkMode={darkMode}
                            onMessage={showMessage}
                        />
                    )}

                    {activeTab === 'maintenance' && (
                        <SettingsTabMaintenance
                            darkMode={darkMode}
                            selectedYear={selectedYear}
                            onMessage={showMessage}
                        />
                    )}

                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3 flex-shrink-0`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} transition-colors`}
                    >
                        Κλείσιμο
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsModal