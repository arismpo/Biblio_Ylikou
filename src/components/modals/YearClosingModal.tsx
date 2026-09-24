// C:\Biblio_Ylikou_NEW\src\components\modals\YearClosingModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface YearClosingModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
    selectedYear: number
    onMessage?: (type: 'success' | 'error' | 'warning', text: string) => void
}

const YearClosingModal: React.FC<YearClosingModalProps> = ({
    isOpen,
    onClose,
    darkMode,
    selectedYear,
    onMessage
}) => {
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

    // ✅ States for checking missing fields
    const [checkingMissing, setCheckingMissing] = useState(false)
    const [recordsWithMissing, setRecordsWithMissing] = useState<any[]>([])
    const [showMissingModal, setShowMissingModal] = useState(false)
    const [filterMissingChapter, setFilterMissingChapter] = useState('all')

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
        if (isOpen) {
            fetchLockStatus()
        }
    }, [isOpen, selectedYear])

    const fetchLockStatus = async () => {
        try {
            const response = await axios.get(`/api/year-lock-status/${selectedYear}`)
            setLockStatus(response.data)
        } catch (error) {
            console.error('Error fetching lock status:', error)
        }
    }

    // ✅ Function to check records without attachments
    const checkRecordsWithoutAttachments = async () => {
        setCheckingAttachments(true)
        setRecordsWithoutAttachments([])

        try {
            const response = await axios.get(`/api/records-without-attachments/${selectedYear}`)
            setRecordsWithoutAttachments(response.data)
            setShowMissingAttachments(true)

            if (response.data.length === 0) {
                if (onMessage) onMessage('success', '✅ Όλες οι εγγραφές έχουν συνημμένα αρχεία!')
            } else {
                if (onMessage) onMessage('warning', `⚠️ Βρέθηκαν ${response.data.length} εγγραφές χωρίς συνημμένα αρχεία!`)
            }
        } catch (err: any) {
            if (onMessage) onMessage('error', err.response?.data?.error || 'Σφάλμα κατά τον έλεγχο')
        } finally {
            setCheckingAttachments(false)
        }
    }

    // ✅ Function to check records with missing fields
    const checkRecordsWithMissingFields = async () => {
        setCheckingMissing(true)
        setRecordsWithMissing([])

        try {
            const response = await axios.get(`/api/records-with-missing-fields/${selectedYear}`)
            setRecordsWithMissing(response.data.records || [])
            setShowMissingModal(true)

            if (response.data.missing === 0) {
                if (onMessage) onMessage('success', '✅ Όλες οι εγγραφές είναι πλήρεις!')
            } else {
                if (onMessage) onMessage('warning', `⚠️ Βρέθηκαν ${response.data.missing} εγγραφές με ελλιπή πεδία!`)
            }
        } catch (err: any) {
            if (onMessage) onMessage('error', err.response?.data?.error || 'Σφάλμα κατά τον έλεγχο')
        } finally {
            setCheckingMissing(false)
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
            if (onMessage) onMessage('success', 'Το Excel εξήχθη επιτυχώς!')
        } catch (error) {
            if (onMessage) onMessage('error', 'Σφάλμα κατά την εξαγωγή')
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
            if (onMessage) onMessage('success', 'Το Πρωτόκολλο εξήχθη επιτυχώς!')
        } catch (error) {
            if (onMessage) onMessage('error', 'Σφάλμα κατά την εξαγωγή')
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
            if (onMessage) onMessage('success', 'Η πλήρης εξαγωγή ολοκληρώθηκε!')
        } catch (error) {
            if (onMessage) onMessage('error', 'Σφάλμα κατά την πλήρη εξαγωγή')
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
            if (onMessage) onMessage('success', response.data.message)
            setLockStatus({ locked: true })
            setShowLockModal(false)
            setPassword('')
        } catch (error: any) {
            if (onMessage) onMessage('error', error.response?.data?.error || 'Σφάλμα κατά το κλείδωμα')
        }
    }

    const handleUnlock = async () => {
        try {
            const response = await axios.post('/api/unlock-year', {
                year: selectedYear,
                password
            })
            if (onMessage) onMessage('success', response.data.message)
            setLockStatus({ locked: false })
            setShowUnlockModal(false)
            setPassword('')
        } catch (error: any) {
            if (onMessage) onMessage('error', error.response?.data?.error || 'Σφάλμα κατά το ξεκλείδωμα')
        }
    }

    // Get unique chapters for filter
    const uniqueChapters = [...new Map(recordsWithoutAttachments.map(r => [r.chapterName, r.chapterName])).values()]
    const filteredRecords = filterChapter === 'all'
        ? recordsWithoutAttachments
        : recordsWithoutAttachments.filter(r => r.chapterName === filterChapter)

    // Get unique chapters for missing fields filter
    const uniqueMissingChapters = [...new Map(recordsWithMissing.map(r => [r.chapterName, r.chapterName])).values()]
    const filteredMissingRecords = filterMissingChapter === 'all'
        ? recordsWithMissing
        : recordsWithMissing.filter(r => r.chapterName === filterMissingChapter)

    if (!isOpen) return null

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
                <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    {/* Header */}
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                        <div>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                🔒 Κλείσιμο Έτους {selectedYear}
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Κλείδωμα, εξαγωγές και έλεγχοι
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6 space-y-4">
                        {/* Lock Status */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🔐</span>
                                    <div>
                                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Κατάσταση Κλειδώματος
                                        </div>
                                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Το έτος είναι {lockStatus.locked ? 'κλειδωμένο' : 'ξεκλειδωτό'}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${lockStatus.locked
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    }`}>
                                    {lockStatus.locked ? '🔒 Κλειδωμένο' : '🔓 Ξεκλειδωτό'}
                                </div>
                            </div>
                            <div className="mt-3 flex gap-3">
                                {!lockStatus.locked ? (
                                    <button
                                        onClick={() => setShowLockModal(true)}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        🔒 Κλείδωμα
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowUnlockModal(true)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        🔓 Ξεκλείδωμα
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Check Attachments */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        📎 Έλεγχος Συνημμένων
                                    </div>
                                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Εύρεση εγγραφών χωρίς συνημμένα αρχεία
                                    </div>
                                </div>
                                <button
                                    onClick={checkRecordsWithoutAttachments}
                                    disabled={checkingAttachments}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${checkingAttachments
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : darkMode
                                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        }`}
                                >
                                    {checkingAttachments ? '🔍 Ελέγχοντας...' : '🔍 Έλεγχος'}
                                </button>
                            </div>
                        </div>

                        {/* ✅ Check Missing Fields */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        📝 Έλεγχος Ελλιπών Πεδίων
                                    </div>
                                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Εύρεση εγγραφών με κενά πεδία (Μήνας, Ημέρα, Περιγραφή, κινήσεις)
                                    </div>
                                </div>
                                <button
                                    onClick={checkRecordsWithMissingFields}
                                    disabled={checkingMissing}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${checkingMissing
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : darkMode
                                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                        }`}
                                >
                                    {checkingMissing ? '🔍 Ελέγχοντας...' : '🔍 Έλεγχος Ελλιπών'}
                                </button>
                            </div>
                        </div>

                        {/* Export Buttons */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                📊 Εξαγωγές
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    onClick={handleExportMain}
                                    disabled={exportingMain || lockStatus.locked}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${exportingMain || lockStatus.locked
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : darkMode
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                        }`}
                                    title={lockStatus.locked ? 'Ξεκλειδώστε πρώτα το έτος' : ''}
                                >
                                    {exportingMain ? '⏳...' : '📘 Βιβλίο Υλικού'}
                                </button>
                                <button
                                    onClick={handleExportProtocol}
                                    disabled={exportingProtocol || lockStatus.locked}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${exportingProtocol || lockStatus.locked
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : darkMode
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                                        }`}
                                    title={lockStatus.locked ? 'Ξεκλειδώστε πρώτα το έτος' : ''}
                                >
                                    {exportingProtocol ? '⏳...' : '📋 Πρωτόκολλο'}
                                </button>
                                <button
                                    onClick={handleExportFull}
                                    disabled={exportingFull || lockStatus.locked}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${exportingFull || lockStatus.locked
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : darkMode
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                        }`}
                                    title={lockStatus.locked ? 'Ξεκλειδώστε πρώτα το έτος' : ''}
                                >
                                    {exportingFull ? '⏳...' : '📑 Πλήρης'}
                                </button>
                            </div>
                            {lockStatus.locked && (
                                <p className="text-xs text-yellow-500 mt-2">
                                    ⚠️ Το έτος είναι κλειδωμένο. Ξεκλειδώστε το για να κάνετε εξαγωγές.
                                </p>
                            )}
                        </div>

                        {/* Info */}
                        <div className={`p-3 rounded-lg text-xs ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                            <p className={darkMode ? 'text-blue-300' : 'text-blue-700'}>
                                💡 <strong>Κλείδωμα:</strong> Προστατεύει το έτος από τυχαίες αλλαγές.
                                Ο προεπιλεγμένος κωδικός είναι <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">admin123</code>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end flex-shrink-0`}>
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                        >
                            Κλείσιμο
                        </button>
                    </div>
                </div>
            </div>

            {/* Missing Attachments Modal */}
            {showMissingAttachments && recordsWithoutAttachments.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
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
                            <div className="space-y-2">
                                {filteredRecords.map((record, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-200 text-yellow-700'
                                                    }`}>
                                                    #{idx + 1}
                                                </span>
                                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {record.chapterName}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                                    ΑΑ: {record.aa}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {record.month} {record.day}
                                                </span>
                                                <span className="text-red-500 text-lg">❌</span>
                                            </div>
                                        </div>
                                        <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {record.description || 'Χωρίς περιγραφή'}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

            {/* ✅ Missing Fields Modal */}
            {showMissingModal && recordsWithMissing.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
                    <div className={`w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-lg shadow-xl flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                ⚠️ Εγγραφές με Ελλιπή Πεδία
                            </h2>
                            <button
                                onClick={() => setShowMissingModal(false)}
                                className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                            <div>
                                <span className={`font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {recordsWithMissing.length}
                                </span>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    {' '} εγγραφές με ελλιπή πεδία
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={filterMissingChapter}
                                    onChange={(e) => setFilterMissingChapter(e.target.value)}
                                    className={`text-sm border rounded px-2 py-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <option value="all">Όλα τα κεφάλαια</option>
                                    {uniqueMissingChapters.map(ch => (
                                        <option key={ch} value={ch}>{ch}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-2">
                                {filteredMissingRecords.map((record, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-200 text-orange-700'
                                                        }`}>
                                                        ΑΑ: {record.aa}
                                                    </span>
                                                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {record.chapterName}
                                                    </span>
                                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {record.month || '?'} {record.day || '?'}
                                                    </span>
                                                </div>
                                                <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {record.description || 'Χωρίς περιγραφή'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 ml-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {record.missingFields && record.missingFields.map((field: string, fi: number) => (
                                                        <span
                                                            key={fi}
                                                            className={`text-[10px] px-1.5 py-0.5 rounded ${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                                                                }`}
                                                        >
                                                            {field}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {record.entryCount || 0} κινήσεις
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between flex-shrink-0`}>
                            <div className="text-sm text-gray-500">
                                {filteredMissingRecords.length} εγγραφές εμφανίζονται
                            </div>
                            <button
                                onClick={() => setShowMissingModal(false)}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]">
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
        </>
    )
}

export default YearClosingModal