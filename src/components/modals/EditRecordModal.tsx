// C:\Biblio_Ylikou_NEW\src\components\modals\EditRecordModal.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'

const months = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος']

interface Entry {
    onomastikoId: number
    name: string
    number: string
    debit: string
    credit: string
}

interface EditRecordModalProps {
    isOpen: boolean
    editingRecord: any
    editAa: string
    editMonth: string
    editDay: string
    editDescription: string
    editEntries: Entry[]
    allChapterOnomastika: any[]
    onClose: () => void
    onSave: (data: { aa: string; month: string; day: string; description: string; entries: Entry[] }) => void
    setEditAa: (value: string) => void
    setEditMonth: (value: string) => void
    setEditDay: (value: string) => void
    setEditDescription: (value: string) => void
    setEditEntries: (entries: Entry[]) => void
    darkMode: boolean
    isYearLocked?: boolean
}

// ✅ Helper: Check if value is a valid number (integer only for AA, Day)
const isValidInteger = (value: string): boolean => {
    if (value === '' || value === '-') return true
    return /^-?\d+$/.test(value)
}

// ✅ Helper: Check if value is a valid decimal (for Debit/Credit)
const isValidDecimal = (value: string): boolean => {
    if (value === '' || value === '-' || value === '.') return true
    return /^-?\d*\.?\d*$/.test(value)
}

// ✅ Helper: Format number on blur
const formatNumber = (value: string): string => {
    if (value === '' || value === '-' || value === '.') return '0'
    const num = parseFloat(value)
    if (isNaN(num)) return '0'
    return num.toString()
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
    isOpen,
    editingRecord,
    editAa,
    editMonth,
    editDay,
    editDescription,
    editEntries,
    allChapterOnomastika,
    onClose,
    onSave,
    setEditAa,
    setEditMonth,
    setEditDay,
    setEditDescription,
    setEditEntries,
    darkMode,
    isYearLocked = false
}) => {
    const [showPreview, setShowPreview] = useState(false)
    const [focusedRowId, setFocusedRowId] = useState<number | null>(null)
    const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set())
    const [showOnlyChecked, setShowOnlyChecked] = useState(false)
    const [showOnlyNonEmpty, setShowOnlyNonEmpty] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Use refs for form values
    const aaRef = useRef<HTMLInputElement>(null)
    const monthRef = useRef<HTMLSelectElement>(null)
    const dayRef = useRef<HTMLInputElement>(null)
    const descriptionRef = useRef<HTMLTextAreaElement>(null)

    const entryValuesRef = useRef<Record<string, string>>({})
    const [forceUpdate, setForceUpdate] = useState(0)

    useEffect(() => {
        if (isOpen && editingRecord) {
            entryValuesRef.current = {}
            editEntries.forEach(entry => {
                entryValuesRef.current[`${entry.onomastikoId}_debit`] = entry.debit || ''
                entryValuesRef.current[`${entry.onomastikoId}_credit`] = entry.credit || ''
            })
            setForceUpdate(prev => prev + 1)
        }
    }, [isOpen, editingRecord])

    // ✅ Reset modal when closed - COMPLETE RESET
    useEffect(() => {
        if (!isOpen) {
            // Reset all refs
            entryValuesRef.current = {}

            // Reset all states
            setCheckedRows(new Set())
            setShowOnlyChecked(false)
            setShowOnlyNonEmpty(false)
            setSearchTerm('')
            setFocusedRowId(null)
            setShowPreview(false)

            // ✅ Force re-render to clear all inputs
            setForceUpdate(prev => prev + 1)
        }
    }, [isOpen])


    const handleSave = () => {
        const aa = aaRef.current?.value || ''
        const month = monthRef.current?.value || ''
        const day = dayRef.current?.value || ''
        const description = descriptionRef.current?.value || ''

        const updatedEntries = allChapterOnomastika.map(onom => {
            const debit = entryValuesRef.current[`${onom.id}_debit`] ?? ''
            const credit = entryValuesRef.current[`${onom.id}_credit`] ?? ''

            return {
                onomastikoId: onom.id,
                name: onom.name,
                number: onom.number || '',
                debit: debit,
                credit: credit
            }
        })

        setEditAa(aa)
        setEditMonth(month)
        setEditDay(day)
        setEditDescription(description)
        setEditEntries(updatedEntries)

        onSave({
            aa,
            month,
            day,
            description,
            entries: updatedEntries
        })
    }

    if (!isOpen || !editingRecord) return null

    const calculatePreview = () => {
        let totalDebit = 0
        let totalCredit = 0
        let entriesWithValues = 0

        const entriesWithData = allChapterOnomastika.map(onom => {
            const debit = entryValuesRef.current[`${onom.id}_debit`] || ''
            const credit = entryValuesRef.current[`${onom.id}_credit`] || ''
            const hasDebit = debit !== '' && parseFloat(debit) !== 0
            const hasCredit = credit !== '' && parseFloat(credit) !== 0
            if (hasDebit || hasCredit) {
                entriesWithValues++
                if (hasDebit) totalDebit += parseFloat(debit)
                if (hasCredit) totalCredit += parseFloat(credit)
            }
            return { onom, debit, credit, hasDebit, hasCredit }
        })

        return {
            totalEntries: allChapterOnomastika.length,
            entriesWithValues,
            totalDebit,
            totalCredit,
            balance: totalDebit - totalCredit,
            entries: entriesWithData.filter(e => e.hasDebit || e.hasCredit)
        }
    }

    const preview = calculatePreview()

    const hasNonZeroValue = (onomastikoId: number) => {
        const debit = entryValuesRef.current[`${onomastikoId}_debit`] || ''
        const credit = entryValuesRef.current[`${onomastikoId}_credit`] || ''
        return (debit !== '' && parseFloat(debit) !== 0) || (credit !== '' && parseFloat(credit) !== 0)
    }

    const toggleRowCheck = (entryId: number) => {
        const newChecked = new Set(checkedRows)
        if (newChecked.has(entryId)) {
            newChecked.delete(entryId)
        } else {
            newChecked.add(entryId)
        }
        setCheckedRows(newChecked)
    }

    const toggleAllRows = () => {
        const visibleEntries = getVisibleEntries()
        const visibleIds = visibleEntries.map(onom => onom.id)

        if (checkedRows.size === visibleIds.length && visibleIds.length > 0) {
            setCheckedRows(new Set())
        } else {
            const newChecked = new Set(visibleIds)
            setCheckedRows(newChecked)
        }
    }

    const getVisibleEntries = () => {
        let filtered = allChapterOnomastika

        if (searchTerm.trim()) {
            filtered = filtered.filter(onom =>
                onom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (onom.number && onom.number.includes(searchTerm))
            )
        }

        if (showOnlyNonEmpty) {
            filtered = filtered.filter(onom => hasNonZeroValue(onom.id))
        }

        if (showOnlyChecked) {
            filtered = filtered.filter(onom => checkedRows.has(onom.id))
        }

        return filtered
    }

    const toggleNonEmptyFilter = () => {
        if (showOnlyNonEmpty) {
            setShowOnlyNonEmpty(false)
        } else {
            setShowOnlyNonEmpty(true)
            if (showOnlyChecked) {
                setShowOnlyChecked(false)
            }
        }
    }

    const toggleCheckedFilter = () => {
        if (showOnlyChecked) {
            setShowOnlyChecked(false)
        } else {
            if (checkedRows.size === 0) {
                alert('Please select at least one row to filter.')
                return
            }
            setShowOnlyChecked(true)
            if (showOnlyNonEmpty) {
                setShowOnlyNonEmpty(false)
            }
        }
    }

    const visibleEntries = getVisibleEntries()
    const nonEmptyCount = allChapterOnomastika.filter(onom => hasNonZeroValue(onom.id)).length

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col`}>
                    {/* Header */}
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-10 flex-shrink-0`}>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    ✏️ Edit Record
                                </h2>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    AA: {editAa || editingRecord.aa} • {editMonth || editingRecord.month} {editDay || editingRecord.day}
                                </p>
                            </div>
                            <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-2xl`}>✕</button>
                        </div>
                        <div className="flex justify-end gap-3">
                            {isYearLocked && (
                                <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-1">
                                    🔒 Κλειδωμένο
                                </span>
                            )}
                            <button onClick={onClose} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}>
                                Cancel
                            </button>
                            <button onClick={() => setShowPreview(true)} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
                                Preview
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isYearLocked}
                                className={`px-4 py-2 rounded-lg text-white ${isYearLocked ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isYearLocked ? '🔒 Κλειδωμένο' : '💾 Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 overflow-y-auto">
                        {/* Record Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>AA</label>
                                <input
                                    ref={aaRef}
                                    type="text"
                                    inputMode="numeric"
                                    disabled={isYearLocked}
                                    defaultValue={editAa}
                                    className={`w-full border rounded-md px-3 py-2 ${isYearLocked
                                        ? 'opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-600'
                                        : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        // ✅ Only allow numbers (and empty)
                                        if (val === '' || /^\d+$/.test(val)) {
                                            return
                                        }
                                        // If not valid, revert to previous value
                                        e.target.value = e.target.value.replace(/\D/g, '')
                                    }}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Month *</label>
                                <select
                                    ref={monthRef}
                                    className={`w-full border rounded-md px-3 py-2 ${isYearLocked
                                        ? 'opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-600'
                                        : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                    defaultValue={editMonth}
                                    disabled={isYearLocked}
                                >
                                    <option value="">Select...</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Day *</label>
                                <input
                                    ref={dayRef}
                                    type="text"
                                    inputMode="numeric"
                                    disabled={isYearLocked}
                                    defaultValue={editDay}
                                    className={`w-full border rounded-md px-3 py-2 ${isYearLocked
                                        ? 'opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-600'
                                        : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        // ✅ Only allow numbers (and empty)
                                        if (val === '' || /^\d+$/.test(val)) {
                                            return
                                        }
                                        // If not valid, revert to previous value
                                        e.target.value = e.target.value.replace(/\D/g, '')
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                            <textarea
                                ref={descriptionRef}
                                rows={2}
                                disabled={isYearLocked}
                                defaultValue={editDescription}
                                className={`w-full border rounded-md px-3 py-2 ${isYearLocked
                                    ? 'opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-600'
                                    : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                    }`}
                            />
                        </div>

                        {/* Onomastika List */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    📋 Onomastika ({allChapterOnomastika.length} total)
                                    {showOnlyNonEmpty && (
                                        <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                            (Non-empty: {nonEmptyCount})
                                        </span>
                                    )}
                                    {showOnlyChecked && (
                                        <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                            (Filtered: {checkedRows.size} checked)
                                        </span>
                                    )}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="🔍 Αναζήτηση..."
                                        className={`text-sm border rounded-lg px-3 py-1 w-40 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button
                                        onClick={toggleNonEmptyFilter}
                                        className={`px-3 py-1 text-sm rounded-lg border ${showOnlyNonEmpty
                                            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                            : darkMode
                                                ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                                                : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        📊 Non Empty ({nonEmptyCount})
                                    </button>
                                    <button
                                        onClick={toggleAllRows}
                                        className={`px-3 py-1 text-sm rounded-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        {checkedRows.size === visibleEntries.length && visibleEntries.length > 0 ? '☑️ Uncheck All' : '⬜ Check All'}
                                    </button>
                                    <button
                                        onClick={toggleCheckedFilter}
                                        className={`px-3 py-1 text-sm rounded-lg border ${showOnlyChecked
                                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                            : darkMode
                                                ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                                                : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        {showOnlyChecked ? '📋 Show All' : '✅ Show Checked'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                                {visibleEntries && visibleEntries.length > 0 ? (
                                    visibleEntries.map((onom) => {
                                        const hasValue = hasNonZeroValue(onom.id)
                                        const isChecked = checkedRows.has(onom.id)
                                        const debitValue = entryValuesRef.current[`${onom.id}_debit`] || ''
                                        const creditValue = entryValuesRef.current[`${onom.id}_credit`] || ''

                                        return (
                                            <div
                                                key={onom.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-150 ${focusedRowId === onom.id
                                                        ? darkMode ? 'border-blue-500 bg-blue-900/30' : 'border-blue-400 bg-blue-50'
                                                        : hasValue
                                                            ? darkMode ? 'border-green-700 bg-green-900/20' : 'border-green-300 bg-green-50'
                                                            : darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
                                                    } ${isYearLocked ? 'opacity-70' : ''}`}
                                            >
                                                <div className="flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleRowCheck(onom.id)}
                                                        disabled={isYearLocked}
                                                        className="w-4 h-4 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>

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
                                                        {hasValue && (
                                                            <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                                ●
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {/* Debit Input */}
                                                    <div className="w-28">
                                                        <div className="flex items-center gap-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isYearLocked) return
                                                                    const key = `${onom.id}_debit`
                                                                    const current = parseFloat(entryValuesRef.current[key] || '0') || 0
                                                                    const newVal = Math.max(0, current - 1)
                                                                    entryValuesRef.current[key] = newVal.toString()
                                                                    setForceUpdate(prev => prev + 1)
                                                                }}
                                                                disabled={isYearLocked}
                                                                className={`w-6 h-6 flex items-center justify-center rounded-l border ${isYearLocked ? 'opacity-50 cursor-not-allowed' : darkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white' : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                                </svg>
                                                            </button>
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                disabled={isYearLocked}
                                                                value={debitValue}  // ✅ Controlled - value comes from state
                                                                className={`w-full text-right border-y px-1 py-1 text-sm ${isYearLocked
                                                                    ? 'opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-600'
                                                                    : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                                                    } ${parseFloat(debitValue) !== 0 ? (darkMode ? 'bg-green-900/40 border-green-600' : 'bg-green-50 border-green-400') : ''}`}
                                                                onChange={(e) => {
                                                                    if (isYearLocked) return
                                                                    const val = e.target.value
                                                                    if (val === '' || val === '-' || val === '.' || /^-?\d*\.?\d*$/.test(val)) {
                                                                        entryValuesRef.current[`${onom.id}_debit`] = val
                                                                        setForceUpdate(prev => prev + 1)
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    const val = e.target.value
                                                                    if (val !== '' && val !== '-' && val !== '.') {
                                                                        const formatted = formatNumber(val)
                                                                        entryValuesRef.current[`${onom.id}_debit`] = formatted
                                                                        setForceUpdate(prev => prev + 1)
                                                                    }
                                                                }}
                                                                onFocus={() => setFocusedRowId(onom.id)}
                                                                style={{ minWidth: '50px' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isYearLocked) return
                                                                    const key = `${onom.id}_debit`
                                                                    const current = parseFloat(entryValuesRef.current[key] || '0') || 0
                                                                    const newVal = current + 1
                                                                    entryValuesRef.current[key] = newVal.toString()
                                                                    setForceUpdate(prev => prev + 1)
                                                                }}
                                                                disabled={isYearLocked}
                                                                className={`w-6 h-6 flex items-center justify-center rounded-r border ${isYearLocked ? 'opacity-50 cursor-not-allowed' : darkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white' : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Credit Input - Controlled */}
                                                    <div className="w-28">
                                                        <div className="flex items-center gap-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isYearLocked) return
                                                                    const key = `${onom.id}_credit`
                                                                    const current = parseFloat(entryValuesRef.current[key] || '0') || 0
                                                                    const newVal = Math.max(0, current - 1)
                                                                    entryValuesRef.current[key] = newVal.toString()
                                                                    setForceUpdate(prev => prev + 1)
                                                                }}
                                                                disabled={isYearLocked}
                                                                className={`w-6 h-6 flex items-center justify-center rounded-l border ${isYearLocked ? 'opacity-50 cursor-not-allowed' : darkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white' : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                                </svg>
                                                            </button>
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                disabled={isYearLocked}
                                                                value={creditValue}  // ✅ Controlled - value comes from state
                                                                className={`w-full text-right border-y px-1 py-1 text-sm ${isYearLocked
                                                                    ? 'opacity-60 cursor-not-allowed bg-gray-300 dark:bg-gray-600'
                                                                    : darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                                                    } ${parseFloat(creditValue) !== 0 ? (darkMode ? 'bg-red-900/40 border-red-600' : 'bg-red-50 border-red-400') : ''}`}
                                                                onChange={(e) => {
                                                                    if (isYearLocked) return
                                                                    const val = e.target.value
                                                                    if (val === '' || val === '-' || val === '.' || /^-?\d*\.?\d*$/.test(val)) {
                                                                        entryValuesRef.current[`${onom.id}_credit`] = val
                                                                        setForceUpdate(prev => prev + 1)
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    const val = e.target.value
                                                                    if (val !== '' && val !== '-' && val !== '.') {
                                                                        const formatted = formatNumber(val)
                                                                        entryValuesRef.current[`${onom.id}_credit`] = formatted
                                                                        setForceUpdate(prev => prev + 1)
                                                                    }
                                                                }}
                                                                onFocus={() => setFocusedRowId(onom.id)}
                                                                style={{ minWidth: '50px' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isYearLocked) return
                                                                    const key = `${onom.id}_credit`
                                                                    const current = parseFloat(entryValuesRef.current[key] || '0') || 0
                                                                    const newVal = current + 1
                                                                    entryValuesRef.current[key] = newVal.toString()
                                                                    setForceUpdate(prev => prev + 1)
                                                                }}
                                                                disabled={isYearLocked}
                                                                className={`w-6 h-6 flex items-center justify-center rounded-r border ${isYearLocked ? 'opacity-50 cursor-not-allowed' : darkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white' : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {showOnlyNonEmpty && nonEmptyCount === 0
                                            ? 'No non-empty rows to display'
                                            : showOnlyChecked
                                                ? 'No checked rows to display'
                                                : searchTerm
                                                    ? 'No results found for your search'
                                                    : 'Loading onomastika...'}
                                    </div>
                                )}
                            </div>

                            <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <span>Showing {visibleEntries.length} of {allChapterOnomastika.length} entries</span>
                                {nonEmptyCount > 0 && (
                                    <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                        {nonEmptyCount} entries have values
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}>
                        {isYearLocked ? '🔒 Το έτος είναι κλειδωμένο - Δεν επιτρέπονται αλλαγές' : 'Fill in the values above and click Save Changes to update the record'}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col`}>
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                📊 Preview Changes
                            </h3>
                            <button onClick={() => setShowPreview(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-2xl`}>✕</button>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div className="text-2xl font-bold">{preview.entriesWithValues}</div>
                                    <div className="text-sm">Onomastika with values</div>
                                </div>
                                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                    <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                        {preview.totalDebit.toFixed(0)}
                                    </div>
                                    <div className="text-sm">Total Debit</div>
                                </div>
                                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                    <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                        {preview.totalCredit.toFixed(0)}
                                    </div>
                                    <div className="text-sm">Total Credit</div>
                                </div>
                                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                    <div className={`text-2xl font-bold ${preview.balance >= 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                                        {preview.balance.toFixed(0)}
                                    </div>
                                    <div className="text-sm">Balance</div>
                                </div>
                            </div>

                            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Record Information</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div><span className="text-gray-500">AA:</span> {editAa || editingRecord.aa}</div>
                                    <div><span className="text-gray-500">Month:</span> {editMonth || editingRecord.month}</div>
                                    <div><span className="text-gray-500">Day:</span> {editDay || editingRecord.day}</div>
                                    <div><span className="text-gray-500">Description:</span> {editDescription || editingRecord.description?.substring(0, 50)}</div>
                                </div>
                            </div>

                            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Entries with Values</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {preview.entries.length > 0 ? (
                                    preview.entries.map((entry) => {
                                        const debit = parseFloat(entry.debit) || 0
                                        const credit = parseFloat(entry.credit) || 0
                                        const net = debit - credit
                                        return (
                                            <div key={entry.onom.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{entry.onom.name}</span>
                                                    {entry.onom.number && (
                                                        <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                                            #{entry.onom.number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    {debit > 0 && <span className="text-green-600 dark:text-green-400">+{debit.toFixed(0)}</span>}
                                                    {credit > 0 && <span className="text-red-600 dark:text-red-400">-{credit.toFixed(0)}</span>}
                                                    <span className={`font-medium ${net > 0 ? 'text-green-600' : net < 0 ? 'text-red-600' : ''}`}>
                                                        {net !== 0 ? net.toFixed(0) : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No entries with values</div>
                                )}
                            </div>

                            <div className={`mt-4 p-3 rounded-lg flex justify-between font-bold ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <span>Totals:</span>
                                <div className="flex gap-6">
                                    <span className="text-green-600 dark:text-green-400">Debit: {preview.totalDebit.toFixed(0)}</span>
                                    <span className="text-red-600 dark:text-red-400">Credit: {preview.totalCredit.toFixed(0)}</span>
                                    <span className={preview.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                        Balance: {preview.balance.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3 flex-shrink-0`}>
                            <button onClick={() => setShowPreview(false)} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}>
                                Back to Edit
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isYearLocked}
                                className={`px-4 py-2 rounded-lg text-white ${isYearLocked ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isYearLocked ? '🔒 Κλειδωμένο' : '✅ Confirm & Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EditRecordModal