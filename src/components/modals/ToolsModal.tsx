// C:\Biblio_Ylikou_NEW\src\components\modals\ToolsModal.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface ToolsModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
    onPrint: () => void  // ✅ Η συνάρτηση που ανοίγει το PrintPreview
    onReorderAA: () => void
    selectedYear: number
    selectedChapterId?: number | null
    chapterName?: string
    isYearLocked?: boolean
    isSaving?: boolean
    onMessage?: (type: 'success' | 'error' | 'warning', text: string) => void
}

const ToolsModal: React.FC<ToolsModalProps> = ({
    isOpen,
    onClose,
    darkMode,
    onPrint,
    onReorderAA,
    selectedYear,
    selectedChapterId,
    chapterName,
    isYearLocked = false,
    isSaving = false,
    onMessage
}) => {
    const router = useRouter()
    const [checkingAttachments, setCheckingAttachments] = useState(false)
    const [checkingMissing, setCheckingMissing] = useState(false)
    const [showResults, setShowResults] = useState<{
        type: 'attachments' | 'missing'
        records: any[]
        count: number
    } | null>(null)

    if (!isOpen) return null

    const handleProtocol = () => {
        router.push(`/protocol?year=${selectedYear}`)
        onClose()
    }

    // ✅ Έλεγχος Συνημμένων
    const handleCheckAttachments = async () => {
        setCheckingAttachments(true)
        try {
            const response = await axios.get(`/api/records-without-attachments/${selectedYear}`)
            const records = response.data || []
            setShowResults({
                type: 'attachments',
                records: records,
                count: records.length
            })
            if (records.length === 0) {
                if (onMessage) onMessage('success', '✅ Όλες οι εγγραφές έχουν συνημμένα αρχεία!')
            } else {
                if (onMessage) onMessage('warning', `⚠️ Βρέθηκαν ${records.length} εγγραφές χωρίς συνημμένα!`)
            }
        } catch (error: any) {
            if (onMessage) onMessage('error', error.response?.data?.error || 'Σφάλμα κατά τον έλεγχο')
        } finally {
            setCheckingAttachments(false)
        }
    }

    // ✅ Έλεγχος Ελλιπών Πεδίων
    const handleCheckMissingFields = async () => {
        setCheckingMissing(true)
        try {
            const response = await axios.get(`/api/records-with-missing-fields/${selectedYear}`)
            const records = response.data.records || []
            setShowResults({
                type: 'missing',
                records: records,
                count: response.data.missing || 0
            })
            if (response.data.missing === 0) {
                if (onMessage) onMessage('success', '✅ Όλες οι εγγραφές είναι πλήρεις!')
            } else {
                if (onMessage) onMessage('warning', `⚠️ Βρέθηκαν ${response.data.missing} εγγραφές με ελλιπή πεδία!`)
            }
        } catch (error: any) {
            if (onMessage) onMessage('error', error.response?.data?.error || 'Σφάλμα κατά τον έλεγχο')
        } finally {
            setCheckingMissing(false)
        }
    }

    const closeResults = () => {
        setShowResults(null)
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className={`w-full max-w-md rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        🛠️ Εργαλεία
                    </h2>
                    <button
                        onClick={onClose}
                        className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {/* 🖨️ Εκτύπωση */}
                    <button
                        onClick={() => {
                            onPrint()
                            onClose()
                        }}
                        className={`w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${darkMode
                                ? 'border-gray-600 hover:border-green-500 hover:bg-green-900/20'
                                : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
                            }`}
                    >
                        <span className="text-3xl">🖨️</span>
                        <div className="flex-1 text-left">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Εκτύπωση
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Εκτύπωση του τρέχοντος πίνακα
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                            }`}>
                            Ctrl+P
                        </span>
                    </button>

                    {/* 🔄 Αναδιάταξη ΑΑ */}
                    <button
                        onClick={() => {
                            onReorderAA()
                            onClose()
                        }}
                        disabled={isYearLocked || isSaving || !selectedChapterId}
                        className={`w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${isYearLocked || isSaving || !selectedChapterId
                                ? 'opacity-50 cursor-not-allowed'
                                : darkMode
                                    ? 'border-gray-600 hover:border-yellow-500 hover:bg-yellow-900/20'
                                    : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                            }`}
                    >
                        <span className="text-3xl">🔄</span>
                        <div className="flex-1 text-left">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Αναδιάταξη ΑΑ
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {isYearLocked
                                    ? '🔒 Το έτος είναι κλειδωμένο'
                                    : !selectedChapterId
                                        ? 'Επιλέξτε κεφάλαιο πρώτα'
                                        : 'Αναδιάταξη των αύξοντων αριθμών'
                                }
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {chapterName || '---'}
                        </span>
                    </button>

                    {/* ✅ Έλεγχος Συνημμένων */}
                    <button
                        onClick={handleCheckAttachments}
                        disabled={checkingAttachments}
                        className={`w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${checkingAttachments
                                ? 'opacity-50 cursor-not-allowed'
                                : darkMode
                                    ? 'border-gray-600 hover:border-yellow-500 hover:bg-yellow-900/20'
                                    : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                            }`}
                    >
                        <span className="text-3xl">📎</span>
                        <div className="flex-1 text-left">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Έλεγχος Συνημμένων
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {checkingAttachments ? '🔍 Ελέγχοντας...' : 'Εύρεση εγγραφών χωρίς συνημμένα'}
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {selectedYear}
                        </span>
                    </button>

                    {/* ✅ Έλεγχος Ελλιπών Πεδίων */}
                    <button
                        onClick={handleCheckMissingFields}
                        disabled={checkingMissing}
                        className={`w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${checkingMissing
                                ? 'opacity-50 cursor-not-allowed'
                                : darkMode
                                    ? 'border-gray-600 hover:border-orange-500 hover:bg-orange-900/20'
                                    : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                    >
                        <span className="text-3xl">📝</span>
                        <div className="flex-1 text-left">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Έλεγχος Ελλιπών Πεδίων
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {checkingMissing ? '🔍 Ελέγχοντας...' : 'Εύρεση εγγραφών με κενά πεδία'}
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {selectedYear}
                        </span>
                    </button>

                    {/* 📋 Πρωτόκολλο Εισαγωγών - Εξαγωγών */}
                    <button
                        onClick={handleProtocol}
                        className={`w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${darkMode
                                ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-900/20'
                                : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                            }`}
                    >
                        <span className="text-3xl">📋</span>
                        <div className="flex-1 text-left">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Πρωτόκολλο Εισαγωγών - Εξαγωγών
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Διαχείριση πρωτοκόλλου για το έτος {selectedYear}
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                            }`}>
                            Νέο
                        </span>
                    </button>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                            } transition-colors`}
                    >
                        Κλείσιμο
                    </button>
                </div>
            </div>

            {/* ✅ Results Modal */}
            {showResults && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
                    <div className={`w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-lg shadow-xl flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {showResults.type === 'attachments' ? '📎 Εγγραφές χωρίς Συνημμένα' : '📝 Εγγραφές με Ελλιπή Πεδία'}
                            </h2>
                            <button
                                onClick={closeResults}
                                className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                            <div>
                                <span className={`font-bold ${showResults.type === 'attachments' ? 'text-yellow-400' : 'text-orange-400'}`}>
                                    {showResults.count}
                                </span>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    {' '} εγγραφές βρέθηκαν
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {showResults.records.length === 0 ? (
                                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    ✅ Δεν βρέθηκαν εγγραφές
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {showResults.records.map((record, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
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
                                                    {showResults.type === 'missing' && record.missingFields && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {record.missingFields.map((field: string, fi: number) => (
                                                                <span
                                                                    key={fi}
                                                                    className={`text-[10px] px-1.5 py-0.5 rounded ${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                                                                        }`}
                                                                >
                                                                    {field}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {showResults.type === 'attachments' && (
                                                    <span className="text-red-500 text-lg ml-4">❌</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end flex-shrink-0`}>
                            <button
                                onClick={closeResults}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Κλείσιμο
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ToolsModal