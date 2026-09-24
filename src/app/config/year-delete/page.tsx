// C:\Biblio_Ylikou_NEW\src\app\config\year-delete\page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function YearDeletePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [availableYears, setAvailableYears] = useState<number[]>([])

    useEffect(() => {
        fetchAvailableYears()
    }, [])

    const fetchAvailableYears = async () => {
        try {
            const res = await fetch('/api/years')
            const data = await res.json()
            setAvailableYears(data)
        } catch (error) {
            console.error('Error fetching years:', error)
        }
    }

    const handleDelete = async () => {
        if (!password) {
            setMessage({ type: 'error', text: 'Παρακαλώ εισάγετε τον κωδικό' })
            return
        }

        if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε ΟΛΟΚΛΗΡΟ το έτος ${year}; Αυτή η ενέργεια είναι ΜΗ ΑΝΑΣΤΡΕΨΙΜΗ!`)) {
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch(`/api/delete-year/${year}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: `✅ Το έτος ${year} διαγράφηκε επιτυχώς!` })
                setTimeout(() => {
                    router.push('/dashboard')
                }, 2000)
            } else {
                setMessage({ type: 'error', text: data.error || 'Σφάλμα κατά τη διαγραφή' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Σφάλμα κατά τη διαγραφή' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`min-h-screen p-6 ${'bg-gray-50 dark:bg-gray-900'}`}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold text-red-600 dark:text-red-400`}>
                        🗑️ Διαγραφή Έτους
                    </h1>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg"
                    >
                        ← Επιστροφή
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg ${message.type === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Warning Card */}
                <div className={`bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-lg p-6 mb-6`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">⚠️</span>
                        <div>
                            <h2 className={`text-xl font-bold text-red-700 dark:text-red-400`}>
                                ΠΡΟΣΟΧΗ! ΜΗ ΑΝΑΣΤΡΕΨΙΜΗ ΕΝΕΡΓΕΙΑ
                            </h2>
                            <p className={`text-sm text-red-600 dark:text-red-300`}>
                                Η διαγραφή ενός έτους θα αφαιρέσει ΟΛΑ τα δεδομένα του
                            </p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg bg-white/50 dark:bg-black/20`}>
                        <p className={`text-sm font-medium ${'text-red-700 dark:text-red-300'}`}>
                            Θα διαγραφούν:
                        </p>
                        <ul className={`text-sm list-disc list-inside mt-2 space-y-1 ${'text-red-600 dark:text-red-400'}`}>
                            <li>Όλα τα κεφάλαια</li>
                            <li>Όλα τα ονομαστικά</li>
                            <li>Όλες οι εγγραφές (records)</li>
                            <li>Όλες οι κινήσεις (entries)</li>
                            <li>Όλα τα συνημμένα αρχεία</li>
                            <li>Όλα τα υπόλοιπα (yearly_totals)</li>
                        </ul>
                    </div>
                </div>

                {/* Delete Form */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6`}>
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${'text-gray-700 dark:text-gray-300'}`}>
                                Έτος προς διαγραφή
                            </label>
                            <div className={`text-lg font-bold ${'text-red-600 dark:text-red-400'}`}>
                                {year}
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${'text-gray-700 dark:text-gray-300'}`}>
                                Κωδικός Διαγραφής *
                            </label>
                            <input
                                type="password"
                                className={`w-full border rounded-lg px-4 py-2 ${'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Εισάγετε τον κωδικό διαγραφής"
                                onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
                            />
                            <p className={`text-xs mt-1 ${'text-gray-500 dark:text-gray-400'}`}>
                                Ο προεπιλεγμένος κωδικός είναι: <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">admin123</code>
                            </p>
                        </div>

                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className={`w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? '⏳ Διαγραφή...' : '🗑️ Οριστική Διαγραφή'}
                        </button>
                    </div>
                </div>

                {/* Available Years */}
                <div className={`mt-6 p-4 rounded-lg ${'bg-gray-100 dark:bg-gray-800'}`}>
                    <p className={`text-sm ${'text-gray-600 dark:text-gray-400'}`}>
                        Διαθέσιμα έτη: {availableYears.join(', ')}
                    </p>
                </div>
            </div>
        </div>
    )
}