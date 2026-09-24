// C:\Biblio_Ylikou_NEW\src\components\modals\BatchEntryModal.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

interface BatchEntryModalProps {
    isOpen: boolean
    onClose: () => void
    year: number
    darkMode: boolean
    chapterId?: number | null
    onSuccess?: () => void
    onMessage?: (type: 'success' | 'error' | 'warning', text: string) => void
}

const months = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος']

const BatchEntryModal: React.FC<BatchEntryModalProps> = ({
    isOpen,
    onClose,
    year,
    darkMode,
    chapterId,
    onSuccess,
    onMessage
}) => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
    const [allChapters, setAllChapters] = useState<any[]>([])
    const [entries, setEntries] = useState<any[]>([])
    const [activeTabIndex, setActiveTabIndex] = useState(0)
    const [commonData, setCommonData] = useState({ month: '', day: '', description: '' })
    const [useCommon, setUseCommon] = useState(false)
    const [chapterData, setChapterData] = useState<Record<number, any[]>>({})

    // Fetch chapters when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchChapters()
        }
    }, [isOpen, year])

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEntries([])
            setActiveTabIndex(0)
            setCommonData({ month: '', day: '', description: '' })
            setUseCommon(false)
            setChapterData({})
            setMessage(null)
        }
    }, [isOpen])

    const fetchChapters = async () => {
        try {
            const response = await axios.get(`/api/chapters?year=${year}`)
            setAllChapters(response.data)
            if (response.data.length > 0 && entries.length === 0) {
                addEntry(response.data[0].id)
            }
        } catch (error) {
            console.error('Error fetching chapters:', error)
            showMessage('error', 'Σφάλμα φόρτωσης κεφαλαίων')
        }
    }

    const fetchOnomastikaForChapter = async (chapterId: number) => {
        if (chapterData[chapterId]) return chapterData[chapterId]

        try {
            const response = await axios.get(`/api/onomastika?chapterId=${chapterId}&year=${year}`)
            const sorted = response.data.sort((a: any, b: any) => a.position - b.position)
            setChapterData(prev => ({ ...prev, [chapterId]: sorted }))
            return sorted
        } catch (error) {
            console.error('Error fetching onomastika:', error)
            return []
        }
    }

    const addEntry = async (initialChapterId?: number) => {
        const targetChapterId = initialChapterId || (allChapters.length > 0 ? allChapters[0].id : null)
        if (!targetChapterId) return

        const onomastika = await fetchOnomastikaForChapter(targetChapterId)
        const initialCells = onomastika.map(() => ({ debit: '', credit: '' }))

        const newEntry = {
            id: Date.now(),
            chapterId: targetChapterId,
            month: useCommon ? commonData.month : '',
            day: useCommon ? commonData.day : '',
            description: useCommon ? commonData.description : '',
            cells: initialCells,
            attachments: []
        }

        setEntries(prev => [...prev, newEntry])
        setActiveTabIndex(entries.length)
    }

    const removeEntry = (index: number) => {
        if (entries.length <= 1) {
            showMessage('warning', 'Πρέπει να υπάρχει τουλάχιστον μία εγγραφή')
            return
        }
        setEntries(prev => prev.filter((_, i) => i !== index))
        if (activeTabIndex >= entries.length - 1) {
            setActiveTabIndex(Math.max(0, entries.length - 2))
        }
    }

    const updateEntry = (index: number, field: string, value: any) => {
        setEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e))
    }

    const updateEntryChapter = async (index: number, newChapterId: number) => {
        const onomastika = await fetchOnomastikaForChapter(newChapterId)
        const newCells = onomastika.map(() => ({ debit: '', credit: '' }))

        setEntries(prev => prev.map((e, i) =>
            i === index ? { ...e, chapterId: newChapterId, cells: newCells } : e
        ))
    }

    const updateCell = (entryIndex: number, onomIndex: number, field: string, value: string) => {
        setEntries(prev => prev.map((e, i) => {
            if (i === entryIndex) {
                const newCells = [...e.cells]
                if (newCells[onomIndex]) {
                    newCells[onomIndex] = { ...newCells[onomIndex], [field]: value }
                }
                return { ...e, cells: newCells }
            }
            return e
        }))
    }

    const updateCommonField = (field: string, value: string) => {
        setCommonData(prev => ({ ...prev, [field]: value }))
        if (useCommon) {
            setEntries(prev => prev.map(e => ({ ...e, [field]: value })))
        }
    }

    const toggleUseCommon = () => {
        setUseCommon(!useCommon)
        if (!useCommon) {
            setEntries(prev => prev.map(e => ({
                ...e,
                month: commonData.month,
                day: commonData.day,
                description: commonData.description
            })))
        }
    }

    const applyCommonToAll = () => {
        if (window.confirm('Θέλετε να εφαρμόσετε τις κοινές τιμές σε ΟΛΕΣ τις εγγραφές;')) {
            setEntries(prev => prev.map(e => ({
                ...e,
                month: commonData.month,
                day: commonData.day,
                description: commonData.description
            })))
            showMessage('success', 'Οι κοινές τιμές εφαρμόστηκαν σε όλες')
        }
    }

    const showMessage = (type: 'success' | 'error' | 'warning', text: string) => {
        setMessage({ type, text })
        if (onMessage) onMessage(type, text)
        setTimeout(() => setMessage(null), 3000)
    }




    // Αντικατάστησε το handleSubmit με αυτό:

    const handleSubmit = async () => {
        const validEntries = entries.filter(e => e.month && e.day && e.description && e.chapterId)
        if (validEntries.length === 0) {
            showMessage('error', 'Συμπληρώστε τουλάχιστον μία εγγραφή')
            return
        }

        // Check if year is locked
        try {
            const lockStatus = await axios.get(`/api/year-lock-status/${year}`)
            if (lockStatus.data.locked) {
                showMessage('error', '🔒 Το έτος είναι κλειδωμένο!')
                return
            }
        } catch (error) {
            console.error('Error checking lock status:', error)
        }

        setLoading(true)
        setMessage(null)

        try {
            // Group entries by chapterId
            const entriesByChapter: Record<number, any[]> = {}
            for (const entry of validEntries) {
                if (!entriesByChapter[entry.chapterId]) {
                    entriesByChapter[entry.chapterId] = []
                }
                entriesByChapter[entry.chapterId].push(entry)
            }

            let totalRecords = 0

            // Process each chapter separately
            for (const [chapterIdStr, chapterEntries] of Object.entries(entriesByChapter)) {
                const chapterId = parseInt(chapterIdStr)

                // ✅ Get existing records for this chapter
                const existingRes = await axios.get(`/api/chapters/${chapterId}?year=${year}`)
                const existingRecords = existingRes.data.records || []

                // ✅ Get onomastika for this chapter
                const onomastikaRes = await axios.get(`/api/onomastika?chapterId=${chapterId}&year=${year}`)
                const onomastika = onomastikaRes.data.sort((a: any, b: any) => a.position - b.position)

                // ✅ Calculate next AA numbers based on existing records
                let maxAA = 0
                for (const record of existingRecords) {
                    const aaNum = parseInt(record.aa)
                    if (!isNaN(aaNum) && aaNum > maxAA) {
                        maxAA = aaNum
                    }
                }
                let nextAA = maxAA + 1

                // ✅ Create ONLY new records (NOT existing ones)
                const newRecordsToAdd = []
                for (const entry of chapterEntries) {
                    const cells = onomastika.map((onom: any, cellIdx: number) => ({
                        onomastikoId: onom.id,
                        debit: entry.cells[cellIdx]?.debit ? parseFloat(entry.cells[cellIdx].debit) : null,
                        credit: entry.cells[cellIdx]?.credit ? parseFloat(entry.cells[cellIdx].credit) : null
                    }))

                    newRecordsToAdd.push({
                        aa: nextAA.toString(),
                        month: entry.month,
                        day: parseInt(entry.day),
                        description: entry.description,
                        cells: cells
                    })

                    nextAA++
                    totalRecords++
                }

                // ✅ If there are new records to add, save them
                if (newRecordsToAdd.length > 0) {
                    // ✅ IMPORTANT: We ONLY send the new records, NOT the existing ones
                    // The API will handle creating new records
                    await axios.post(`/api/form2/chapter/${chapterId}/records?year=${year}`, {
                        records: newRecordsToAdd  // ✅ ONLY new records
                    })
                }
            }

            showMessage('success', `✅ Δημιουργήθηκαν ${totalRecords} νέες εγγραφές`)

            // Clear everything
            setEntries([])
            if (allChapters.length > 0) {
                addEntry(allChapters[0].id)
            }

            setTimeout(() => {
                if (onSuccess) onSuccess()
                onClose()
            }, 1500)

        } catch (error: any) {
            console.error('Save error:', error)
            showMessage('error', error.response?.data?.error || 'Σφάλμα αποθήκευσης')
        } finally {
            setLoading(false)
        }
    }




    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                    <div>
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            📝 Μαζικές Καταχωρήσεις
                        </h2>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Δημιουργία πολλαπλών εγγραφών ταυτόχρονα
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                    >
                        ✕
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mx-4 mt-2 p-2.5 rounded-lg ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : message.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Left */}
                    <div className={`w-64 flex-shrink-0 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 overflow-y-auto`}>
                        <div className="space-y-4">
                            {/* Common Values */}
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <label className={`flex items-center gap-2 cursor-pointer mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <input type="checkbox" checked={useCommon} onChange={toggleUseCommon} />
                                    <span className="text-sm font-medium">Κοινές τιμές</span>
                                </label>

                                {useCommon && (
                                    <div className="space-y-2">
                                        <select
                                            value={commonData.month}
                                            onChange={(e) => updateCommonField('month', e.target.value)}
                                            className={`w-full p-1 text-sm border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                                        >
                                            <option value="">Μήνας</option>
                                            {months.map(m => <option key={m}>{m}</option>)}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Ημέρα"
                                            value={commonData.day}
                                            onChange={(e) => updateCommonField('day', e.target.value)}
                                            className={`w-full p-1 text-sm border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white'}`}
                                        />
                                        <textarea
                                            rows={2}
                                            placeholder="Περιγραφή"
                                            value={commonData.description}
                                            onChange={(e) => updateCommonField('description', e.target.value)}
                                            className={`w-full p-1 text-sm border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white'}`}
                                        />
                                        <button
                                            onClick={applyCommonToAll}
                                            className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Εφαρμογή σε όλες
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => addEntry()}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                                >
                                    + Νέα Εγγραφή
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Αποθήκευση...' : '💾 Αποθήκευση Όλων'}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                                >
                                    ✕ Ακύρωση
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Tabs */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Tabs Header */}
                        <div className={`flex overflow-x-auto border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                            {entries.map((entry, idx) => (
                                <button
                                    key={entry.id}
                                    onClick={() => setActiveTabIndex(idx)}
                                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTabIndex === idx
                                        ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                                        : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                                        }`}
                                >
                                    Εγγραφή {idx + 1}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {entries.length > 0 && entries[activeTabIndex] && (
                                <EntryTabContent
                                    entry={entries[activeTabIndex]}
                                    entryIndex={activeTabIndex}
                                    entriesCount={entries.length}
                                    allChapters={allChapters}
                                    chapterData={chapterData}
                                    darkMode={darkMode}
                                    months={months}
                                    year={year}
                                    onUpdateEntry={updateEntry}
                                    onUpdateChapter={updateEntryChapter}
                                    onUpdateCell={updateCell}
                                    onRemoveEntry={removeEntry}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ===== ENTRY TAB CONTENT =====
interface EntryTabContentProps {
    entry: any
    entryIndex: number
    entriesCount: number
    allChapters: any[]
    chapterData: Record<number, any[]>
    darkMode: boolean
    months: string[]
    year: number
    onUpdateEntry: (index: number, field: string, value: any) => void
    onUpdateChapter: (index: number, chapterId: number) => void
    onUpdateCell: (entryIndex: number, onomIndex: number, field: string, value: string) => void
    onRemoveEntry: (index: number) => void
}

function EntryTabContent({
    entry,
    entryIndex,
    entriesCount,
    allChapters,
    chapterData,
    darkMode,
    months,
    year,
    onUpdateEntry,
    onUpdateChapter,
    onUpdateCell,
    onRemoveEntry
}: EntryTabContentProps) {
    const currentOnomastika = chapterData[entry.chapterId] || []

    return (
        <div className="space-y-4">
            {/* Header with remove button */}
            <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Εγγραφή {entryIndex + 1}
                </h3>
                {entriesCount > 1 && (
                    <button
                        onClick={() => onRemoveEntry(entryIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                    >
                        🗑️ Διαγραφή
                    </button>
                )}
            </div>

            {/* Chapter Selection */}
            <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Κεφάλαιο
                </label>
                <select
                    value={entry.chapterId || ''}
                    onChange={(e) => onUpdateChapter(entryIndex, parseInt(e.target.value))}
                    className={`w-full border rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                    {allChapters.map((ch: any) => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                </select>
            </div>

            {/* Entry Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                    value={entry.month}
                    onChange={(e) => onUpdateEntry(entryIndex, 'month', e.target.value)}
                    className={`border rounded-md px-2 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                    <option value="">Μήνας</option>
                    {months.map(m => <option key={m}>{m}</option>)}
                </select>
                <input
                    type="number"
                    placeholder="Ημέρα"
                    value={entry.day}
                    onChange={(e) => onUpdateEntry(entryIndex, 'day', e.target.value)}
                    className={`border rounded-md px-2 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <textarea
                    rows={2}
                    placeholder="Περιγραφή"
                    value={entry.description}
                    onChange={(e) => onUpdateEntry(entryIndex, 'description', e.target.value)}
                    className={`border rounded-md px-2 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
            </div>

            {/* ✅ LIST VIEW - Onomastika as cards instead of table */}
            {currentOnomastika.length > 0 ? (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {currentOnomastika.length} ονομαστικά
                    </div>
                    {currentOnomastika.map((onom: any, onomIdx: number) => (
                        <div
                            key={onom.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${darkMode
                                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {/* Onomastiko Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {onom.name}
                                    </span>
                                    {onom.number && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                            #{onom.number}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Debit Input */}
                            <div className="flex items-center gap-1">
                                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Χρ:</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={entry.cells[onomIdx]?.debit || ''}
                                    onChange={(e) => onUpdateCell(entryIndex, onomIdx, 'debit', e.target.value)}
                                    className={`w-24 text-right border rounded px-2 py-1 text-sm ${darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>

                            {/* Credit Input */}
                            <div className="flex items-center gap-1">
                                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Πιστ:</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={entry.cells[onomIdx]?.credit || ''}
                                    onChange={(e) => onUpdateCell(entryIndex, onomIdx, 'credit', e.target.value)}
                                    className={`w-24 text-right border rounded px-2 py-1 text-sm ${darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Φόρτωση ονομαστικών...
                </div>
            )}
        </div>
    )
}

export default BatchEntryModal