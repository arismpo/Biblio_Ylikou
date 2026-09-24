// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabMaintenance.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface SettingsTabMaintenanceProps {
    darkMode: boolean
    selectedYear: number
    onMessage?: (type: 'success' | 'error' | 'warning', text: string) => void
}

const SettingsTabMaintenance: React.FC<SettingsTabMaintenanceProps> = ({
    darkMode,
    selectedYear,
    onMessage
}) => {
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [runningAction, setRunningAction] = useState<string | null>(null)

    useEffect(() => {
        loadStats()
    }, [selectedYear])

    const loadStats = async () => {
        try {
            const response = await axios.post('/api/maintenance', { action: 'stats' })
            if (response.data.success) {
                setStats(response.data.results.stats)
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    const runMaintenance = async (action: string) => {
        setRunningAction(action)
        setLoading(true)

        try {
            const response = await axios.post('/api/maintenance', {
                action,
                year: selectedYear
            })

            if (response.data.success) {
                if (onMessage) onMessage('success', `✅ ${action.toUpperCase()} completed successfully!`)
                await loadStats()
            } else {
                if (onMessage) onMessage('error', `❌ ${action.toUpperCase()} failed: ${response.data.results?.[action]?.error || 'Unknown error'}`)
            }
        } catch (error: any) {
            if (onMessage) onMessage('error', `❌ ${action.toUpperCase()} failed: ${error.response?.data?.error || error.message}`)
        } finally {
            setLoading(false)
            setRunningAction(null)
        }
    }

    const runFullMaintenance = async () => {
        setRunningAction('full')
        setLoading(true)

        try {
            const response = await axios.post('/api/maintenance', {
                action: 'full',
                year: selectedYear
            })

            if (response.data.success) {
                if (onMessage) onMessage('success', '✅ Full maintenance completed successfully!')
                await loadStats()
            } else {
                if (onMessage) onMessage('error', '❌ Full maintenance failed')
            }
        } catch (error: any) {
            if (onMessage) onMessage('error', `❌ Full maintenance failed: ${error.response?.data?.error || error.message}`)
        } finally {
            setLoading(false)
            setRunningAction(null)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🛠️ Συντήρηση Βάσης Δεδομένων
            </h3>

            {/* Database Stats */}
            {stats && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        📊 Στατιστικά Βάσης
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                            <div className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {stats.databaseSize || '0 B'}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Συνολικό Μέγεθος
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                            <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {stats.tableSizes?.length || 0}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Πίνακες
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                            <div className={`text-xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {stats.recordCounts?.length || 0}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Σχήματα
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                            <div className={`text-xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                {stats.attachmentSizes?.[0]?.size || '0 B'}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Συνημμένα
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Actions */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    ⚡ Εργασίες Συντήρησης
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => runMaintenance('vacuum')}
                        disabled={loading}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${loading && runningAction === 'vacuum'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        {runningAction === 'vacuum' ? '⏳...' : '🧹 VACUUM'}
                    </button>
                    <button
                        onClick={() => runMaintenance('analyze')}
                        disabled={loading}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${loading && runningAction === 'analyze'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                    >
                        {runningAction === 'analyze' ? '⏳...' : '📊 ANALYZE'}
                    </button>
                    <button
                        onClick={() => runMaintenance('reindex')}
                        disabled={loading}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${loading && runningAction === 'reindex'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                    >
                        {runningAction === 'reindex' ? '⏳...' : '🔄 REINDEX'}
                    </button>
                    <button
                        onClick={runFullMaintenance}
                        disabled={loading}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${loading && runningAction === 'full'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            }`}
                    >
                        {runningAction === 'full' ? '⏳...' : '⚡ Πλήρης Συντήρηση'}
                    </button>
                </div>

                <div className={`mt-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>• <strong>VACUUM:</strong> Απελευθερώνει χώρο που δεν χρησιμοποιείται</p>
                    <p>• <strong>ANALYZE:</strong> Ενημερώνει τα στατιστικά για βελτιστοποίηση queries</p>
                    <p>• <strong>REINDEX:</strong> Αναδημιουργεί τα indexes για καλύτερη απόδοση</p>
                    <p>• <strong>Πλήρης Συντήρηση:</strong> Εκτελεί όλες τις παραπάνω εργασίες</p>
                </div>
            </div>

            {/* Info */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} text-xs`}>
                <p className={darkMode ? 'text-blue-300' : 'text-blue-700'}>
                    💡 Οι εργασίες συντήρησης εκτελούνται στο schema του έτους {selectedYear}.
                    Για καλύτερη απόδοση, προτείνεται να εκτελούνται περιοδικά (π.χ. κάθε εβδομάδα ή μήνα).
                </p>
            </div>
        </div>
    )
}

export default SettingsTabMaintenance