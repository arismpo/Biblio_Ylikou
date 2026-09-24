// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabManagement\YearClosingTab.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface YearClosingTabProps {
    darkMode: boolean
    selectedYear: number
    onMessage: (type: 'success' | 'error' | 'warning', text: string) => void
}

const YearClosingTab: React.FC<YearClosingTabProps> = ({
    darkMode,
    selectedYear,
    onMessage
}) => {
    const router = useRouter()
    const [availableYears, setAvailableYears] = useState<number[]>([])
    const [lockStatus, setLockStatus] = useState({ locked: false })
    const [exportingMain, setExportingMain] = useState(false)
    const [exportingProtocol, setExportingProtocol] = useState(false)
    const [exportingFull, setExportingFull] = useState(false)
    const [showLockModal, setShowLockModal] = useState(false)
    const [showUnlockModal, setShowUnlockModal] = useState(false)
    const [password, setPassword] = useState('')

    // States for checking attachments
    const [checkingAttachments, setCheckingAttachments] = useState(false)
    const [recordsWithoutAttachments, setRecordsWithoutAttachments] = useState<any[]>([])
    const [showMissingAttachments, setShowMissingAttachments] = useState(false)
    const [filterChapter, setFilterChapter] = useState('all')

    const [signatureConfig, setSignatureConfig] = useState(() => {
        const saved = localStorage.getItem('signatureConfig')
        if (saved) {
            return JSON.parse(saved)
        }
        return {
            administrator: {
                rank: 'Πύραρχος',
                am: '10064',
                fullName: 'Κόλλας Νικόλαος',
                fatherName: 'Γεωργίου'
            },
            president: {
                rank: 'Πύραρχος',
                am: '10064',
                fullName: 'Κόλλας Νικόλαος',
                fatherName: 'Γεωργίου'
            },
            manager: {
                rank: 'Υποπυραγός',
                am: '13783',
                fullName: 'Μπόγδος Νεκτάριος',
                fatherName: 'Κωνσταντίνου'
            },
            sameAsAdministrator: true
        }
    })

    useEffect(() => {
        fetchAvailableYears()
        fetchLockStatus()
    }, [selectedYear])

    const fetchAvailableYears = async () => {
        try {
            const response = await axios.get('/api/years')
            setAvailableYears(response.data)
        } catch (error) {
            console.error('Error fetching years:', error)
        }
    }

    const fetchLockStatus = async () => {
        try {
            const response = await axios.get(`/api/year-lock-status/${selectedYear}`)
            setLockStatus(response.data)
        } catch (error) {
            console.error('Error fetching lock status:', error)
        }
    }

    // Function to check records without attachments
    const checkRecordsWithoutAttachments = async () => {
        setCheckingAttachments(true)
        setRecordsWithoutAttachments([])

        try {
            const response = await axios.get(`/api/records-without-attachments/${selectedYear}`)
            setRecordsWithoutAttachments(response.data)
            setShowMissingAttachments(true)

            if (response.data.length === 0) {
                onMessage('success', '✅ Όλες οι εγγραφές έχουν συνημμένα αρχεία!')
            } else {
                onMessage('warning', `⚠️ Βρέθηκαν ${response.data.length} εγγραφές χωρίς συνημμένα αρχεία!`)
            }
        } catch (err: any) {
            onMessage('error', err.response?.data?.error || 'Σφάλμα κατά τον έλεγχο')
        } finally {
            setCheckingAttachments(false)
        }
    }

    const handleExportMain = async () => {
        setExportingMain(true)
        try {
            const response = await fetch('/api/export-to-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: selectedYear,
                    signatures: signatureConfig
                })
            })
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Βιβλίο_Υλικού_${selectedYear}.xlsx`
            a.click()
            window.URL.revokeObjectURL(url)
            onMessage('success', 'Το Excel εξήχθη επιτυχώς!')
        } catch (error) {
            onMessage('error', 'Σφάλμα κατά την εξαγωγή')
        } finally {
            setExportingMain(false)
        }
    }

    const handleExportProtocol = async () => {
        setExportingProtocol(true)
        try {
            const response = await fetch('/api/export-protocol', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: selectedYear,
                    signatures: signatureConfig
                })
            })
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Πρωτόκολλο_${selectedYear}.xlsx`
            a.click()
            window.URL.revokeObjectURL(url)
            onMessage('success', 'Το Πρωτόκολλο εξήχθη επιτυχώς!')
        } catch (error) {
            onMessage('error', 'Σφάλμα κατά την εξαγωγή')
        } finally {
            setExportingProtocol(false)
        }
    }

    const handleExportFull = async () => {
        setExportingFull(true)
        try {
            const response = await fetch('/api/export-full', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: selectedYear,
                    signatures: signatureConfig
                })
            })
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Πλήρης_Εξαγωγή_${selectedYear}.xlsx`
            a.click()
            window.URL.revokeObjectURL(url)
            onMessage('success', 'Η πλήρης εξαγωγή ολοκληρώθηκε!')
        } catch (error) {
            onMessage('error', 'Σφάλμα κατά την πλήρη εξαγωγή')
        } finally {
            setExportingFull(false)
        }
    }

    const handleLock = async () => {
        try {
            const response = await axios.post('/api/lock-year', {
                year: selectedYear,
                password
            })
            onMessage('success', response.data.message)
            setLockStatus({ locked: true })
            setShowLockModal(false)
            setPassword('')
        } catch (error: any) {
            onMessage('error', error.response?.data?.error || 'Σφάλμα κατά το κλείδωμα')
        }
    }

    const handleUnlock = async () => {
        try {
            const response = await axios.post('/api/unlock-year', {
                year: selectedYear,
                password
            })
            onMessage('success', response.data.message)
            setLockStatus({ locked: false })
            setShowUnlockModal(false)
            setPassword('')
        } catch (error: any) {
            onMessage('error', error.response?.data?.error || 'Σφάλμα κατά το ξεκλείδωμα')
        }
    }

    // Get unique chapters for filter
    const uniqueChapters = [...new Map(recordsWithoutAttachments.map(r => [r.chapterName, r.chapterName])).values()]
    const filteredRecords = filterChapter === 'all'
        ? recordsWithoutAttachments
        : recordsWithoutAttachments.filter(r => r.chapterName === filterChapter)

    return (
        <div className="space-y-4">
            {/* Check Attachments Section */}
            <div className={`rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-6`}>
                <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    📎 Έλεγχος Συνημμένων
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ελέγχει ποιες εγγραφές δεν έχουν συνημμένα αρχεία. Αυτό είναι χρήσιμο πριν το κλείσιμο του έτους.
                </p>
                <button
                    onClick={checkRecordsWithoutAttachments}
                    disabled={checkingAttachments}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${checkingAttachments
                            ? 'bg-gray-400 cursor-not-allowed'
                            : darkMode
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }`}
                >
                    {checkingAttachments ? '🔍 Ελέγχοντας...' : '🔍 Έλεγχος Εγγραφών χωρίς Συνημμένα'}
                </button>
            </div>

            {/* Export Buttons Section */}
            <div className={`rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-6`}>
                <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    📊 Εξαγωγές
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={handleExportMain}
                        disabled={exportingMain}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${exportingMain
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        {exportingMain ? 'Εξαγωγή...' : '📘 Βιβλίο Υλικού'}
                    </button>
                    <button
                        onClick={handleExportProtocol}
                        disabled={exportingProtocol}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${exportingProtocol
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                    >
                        {exportingProtocol ? 'Εξαγωγή...' : '📋 Πρωτόκολλο'}
                    </button>
                    <button
                        onClick={handleExportFull}
                        disabled={exportingFull}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${exportingFull
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                            }`}
                    >
                        {exportingFull ? 'Εξαγωγή...' : '📑 Πλήρης Εξαγωγή'}
                    </button>
                </div>
            </div>

            {/* Lock/Unlock Section */}
            <div className={`rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-6`}>
                <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    🔒 Κλείδωμα / Ξεκλείδωμα
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Το κλείδωμα προστατεύει το έτος από τυχαίες αλλαγές. Για να κάνετε αλλαγές, πρέπει να το ξεκλειδώσετε με κωδικό.
                </p>
                <div className="flex gap-4">
                    {!lockStatus.locked ? (
                        <button
                            onClick={() => setShowLockModal(true)}
                            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                        >
                            🔒 Κλείδωμα Έτους
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowUnlockModal(true)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                            🔓 Ξεκλείδωμα Έτους
                        </button>
                    )}
                    <div className={`px-3 py-2 rounded-full text-sm font-medium ${lockStatus.locked
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                        {lockStatus.locked ? '🔒 Κλειδωμένο' : '🔓 Ξεκλειδωτό'}
                    </div>
                </div>
                {lockStatus.locked && (
                    <p className="text-xs text-yellow-500 mt-2">
                        ⚠️ Το έτος είναι κλειδωμένο. Για να κάνετε εξαγωγές, πρέπει να το ξεκλειδώσετε.
                    </p>
                )}
            </div>

            {/* Missing Attachments Modal */}
            {showMissingAttachments && recordsWithoutAttachments.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-lg shadow-xl flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                ⚠️ Εγγραφές χωρίς Συνημμένα Αρχεία
                            </h2>
                            <button
                                onClick={() => setShowMissingAttachments(false)}
                                className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                            <div>
                                <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                    {recordsWithoutAttachments.length}
                                </span>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    {' '} εγγραφές χωρίς συνημμένα
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={filterChapter}
                                    onChange={(e) => setFilterChapter(e.target.value)}
                                    className={`text-sm border rounded px-2 py-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <option value="all">Όλα τα κεφάλαια</option>
                                    {uniqueChapters.map(ch => (
                                        <option key={ch} value={ch}>{ch}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            <table className="w-full text-sm">
                                <thead className={`sticky top-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        <th className="p-2 text-left">Κεφάλαιο</th>
                                        <th className="p-2 text-left">ΑΑ</th>
                                        <th className="p-2 text-left">Ημερομηνία</th>
                                        <th className="p-2 text-left">Περιγραφή</th>
                                        <th className="p-2 text-center">Συνημμένα</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record, idx) => (
                                        <tr key={idx} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <td className="p-2 font-medium">{record.chapterName}</td>
                                            <td className="p-2 font-mono">{record.aa}</td>
                                            <td className="p-2">{record.month} {record.day}</td>
                                            <td className="p-2 max-w-md truncate" title={record.description}>
                                                {record.description}
                                            </td>
                                            <td className="p-2 text-center">
                                                <span className="text-red-500">❌</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between flex-shrink-0`}>
                            <div className="text-sm text-gray-500">
                                {filteredRecords.length} εγγραφές εμφανίζονται
                            </div>
                            <button
                                onClick={() => setShowMissingAttachments(false)}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Κλείσιμο
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lock Modal */}
            {showLockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md w-full`}>
                        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Κλείδωμα Έτους {selectedYear}
                        </h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Εισάγετε τον κωδικό για να κλειδώσετε το έτος.
                        </p>
                        <input
                            type="password"
                            className={`w-full border rounded-md px-3 py-2 mb-4 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Κωδικός"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLock()}
                            autoFocus
                        />
                        <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Ο προεπιλεγμένος κωδικός είναι: <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">admin123</code>
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowLockModal(false); setPassword(''); }}
                                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                            >
                                Ακύρωση
                            </button>
                            <button
                                onClick={handleLock}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                            >
                                Κλείδωμα
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unlock Modal */}
            {showUnlockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md w-full`}>
                        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Ξεκλείδωμα Έτους {selectedYear}
                        </h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Εισάγετε τον κωδικό για να ξεκλειδώσετε το έτος.
                        </p>
                        <input
                            type="password"
                            className={`w-full border rounded-md px-3 py-2 mb-4 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Κωδικός"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                            autoFocus
                        />
                        <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Ο προεπιλεγμένος κωδικός είναι: <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">admin123</code>
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowUnlockModal(false); setPassword(''); }}
                                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                            >
                                Ακύρωση
                            </button>
                            <button
                                onClick={handleUnlock}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                                Ξεκλείδωμα
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default YearClosingTab