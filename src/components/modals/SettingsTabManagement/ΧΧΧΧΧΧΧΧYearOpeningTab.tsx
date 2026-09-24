// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabManagement\YearOpeningTab.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface YearOpeningTabProps {
    darkMode: boolean
    selectedYear: number
}

const YearOpeningTab: React.FC<YearOpeningTabProps> = ({ darkMode, selectedYear }) => {
    const router = useRouter()
    const [sourceYear, setSourceYear] = useState('')
    const [targetYear, setTargetYear] = useState(selectedYear || new Date().getFullYear())
    const [availableYears, setAvailableYears] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ message: string } | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAvailableYears()
    }, [])

    const fetchAvailableYears = async () => {
        try {
            const response = await axios.get('/api/available-years')
            setAvailableYears(response.data)
            if (response.data.length > 0) {
                setSourceYear(response.data[response.data.length - 1])
            }
        } catch (error) {
            console.error('Error fetching years:', error)
        }
    }

    const handleOpenWizard = () => {
        // Κλείσε το modal και πήγαινε στη νέα σελίδα
        router.push('/year-opening-wizard')
    }

    return (
        <div className="space-y-4">
            <div className={`rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-6`}>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">📅</span>
                    <div>
                        <h4 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                            Άνοιγμα Νέου Έτους
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Μεταβείτε στον οδηγό για άνοιγμα νέου έτους με επιλογή σειράς κεφαλαίων
                        </p>
                    </div>
                </div>

                <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        📌 Ο οδηγός ανοίγματος έτους σας επιτρέπει να:
                    </p>
                    <ul className={`text-sm list-disc list-inside mt-2 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>Δείτε όλα τα κεφάλαια με δυνατότητα αλλαγής σειράς (drag & drop)</li>
                        <li>Δείτε τα ονομαστικά κάθε κεφαλαίου με τα υπόλοιπα από το προηγούμενο έτος</li>
                        <li>Επιλέξετε έτος-πηγή και έτος-στόχο</li>
                    </ul>
                </div>

                {error && (
                    <div className="p-3 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm">
                        ❌ {error}
                    </div>
                )}

                {result && (
                    <div className="p-3 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm">
                        ✅ {result.message}
                    </div>
                )}

                <button
                    onClick={handleOpenWizard}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                    🚀 Άνοιγμα Έτους (Οδηγός)
                </button>

                <div className={`mt-4 p-4 rounded-lg text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-gray-600'}`}>
                    <p className="font-medium mb-2">ℹ️ Πληροφορίες</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>📅 Από Προηγούμενο Έτος:</strong> Αντιγράφει μόνο τη δομή (κεφάλαια και ονομαστικά).</li>
                        <li><strong>📋 Οι εγγραφές ΔΕΝ μεταφέρονται</strong> - μόνο η δομή των κεφαλαίων.</li>
                        <li><strong>✅ Μπορείτε να αλλάξετε τη σειρά</strong> των κεφαλαίων πριν τη δημιουργία.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default YearOpeningTab