// C:\Biblio_Ylikou_NEW\src\components\biblio\TableRow.tsx
'use client'

import React from 'react'
import NumberCell from './NumberCell'

const months = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος']

interface Onomastiko {
    id: string | number
    name: string
    number: string
    isPlaceholder: boolean
    isEmpty: boolean
    highlighted: boolean
    page?: number
}

interface Row {
    id: number | null
    aa: string | number
    month: string
    day: string | number
    description: string
    tempId?: string
}

interface Attachment {
    id: number
    filename: string
    mimeType: string
}

interface TableRowProps {
    row: Row
    idx: number
    isSelected: boolean
    rowHasData: boolean
    isFirstEmptyRow: boolean
    isColumnSelected: (id: string) => boolean
    getValue: (recordId: number, field: string) => string
    setNumberValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
    setRows: React.Dispatch<React.SetStateAction<Row[]>>
    setSelectedRowIndex: (index: number | null) => void
    setSelectedColumnId: (id: string | null) => void
    enableRow: (index: number) => void
    handleDeleteRow: (index: number) => void
    handleEdit: (index: number) => void
    handleBrowseFile: (index: number) => void
    handleScan: (index: number) => void
    handleViewFile: (attachment: Attachment) => void
    handleDeleteFile: (recordId: number, attachmentId: number, e: React.MouseEvent) => void
    getRowFiles: (index: number) => Attachment[]
    displayOnomastika: Onomastiko[]
    darkMode: boolean
    stickyDataBg: string
    stickyBg: string
    numberValues: Record<string, string>
    rows: Row[]
    isNoOnomastikaPage: boolean
    frozenColumns: boolean
    // ✅ ΝΕΟ: Function to open batch entry modal
    onOpenBatchEntry?: () => void
}

const TableRow: React.FC<TableRowProps> = ({
    row,
    idx,
    isSelected,
    rowHasData,
    isFirstEmptyRow,
    isColumnSelected,
    getValue,
    setNumberValues,
    setRows,
    setSelectedRowIndex,
    setSelectedColumnId,
    enableRow,
    handleDeleteRow,
    handleEdit,
    handleBrowseFile,
    handleScan,
    handleViewFile,
    handleDeleteFile,
    getRowFiles,
    displayOnomastika,
    darkMode,
    stickyDataBg,
    stickyBg,
    numberValues,
    rows,
    isNoOnomastikaPage = false,
    frozenColumns = true,
    onOpenBatchEntry  // ✅ ΝΕΟ
}) => {
    if (isNoOnomastikaPage) {
        return (
            <tr className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} style={{ height: '80px' }}>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                {displayOnomastika.map((o, oidx) => (
                    <React.Fragment key={`empty-${oidx}`}>
                        <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 ${oidx === 6 ? 'border-l-4 border-l-gray-500' : ''}`}></td>
                        <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2`}></td>
                    </React.Fragment>
                ))}
            </tr>
        )
    }

    const rowBgColor = isSelected ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
    const rowFiles = getRowFiles(idx)
    const recordId = row?.id

    const getStickyClass = (position: string) => {
        return frozenColumns ? `sticky ${position} z-20` : ''
    }

    return (
        <tr className={`${rowBgColor} transition-colors cursor-pointer`} onClick={() => setSelectedRowIndex(idx)}>
            {/* Actions cell */}
            <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 text-center align-middle`}>
                <div className="flex gap-1 justify-center">
                    <button className="text-red-500 hover:text-red-700 transition-colors" onClick={e => { e.stopPropagation(); handleDeleteRow(idx) }} title="Διαγραφή">🗑️</button>
                    <button className="text-blue-500 hover:text-blue-700 transition-colors" onClick={e => { e.stopPropagation(); handleEdit(idx) }} title="Επεξεργασία">✏️</button>
                </div>
            </td>

            {/* Files cell */}
            <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 align-middle`}>
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1 justify-start">
                        <button onClick={(e) => { e.stopPropagation(); handleBrowseFile(idx) }} className={`px-2 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white text-sm`} title="Προσθήκη αρχείου">📁</button>
                        <button onClick={(e) => { e.stopPropagation(); handleScan(idx) }} className={`px-2 py-1 rounded ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white text-sm`} title="Σάρωση">📷</button>
                    </div>
                    {rowFiles.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1">
                            {rowFiles.map((file, fileIdx) => (
                                <div key={file.id || fileIdx} className={`flex items-center justify-between text-xs p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                    <button onClick={(e) => { e.stopPropagation(); handleViewFile(file) }} className={`truncate flex-1 text-left ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`} title={file.filename}>📄 {file.filename}</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(recordId as number, file.id, e) }} className="text-red-500 hover:text-red-700 ml-2" title="Διαγραφή">🗑️</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </td>

            {/* AA Column */}
            <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-0 align-middle ${getStickyClass('left-0')} ${stickyDataBg} ${isColumnSelected('aa') ? (darkMode ? 'bg-blue-800/40' : 'bg-blue-50') : ''}`} onMouseDown={() => setSelectedColumnId('aa')}>
                {row.id ? (
                    <NumberCell
                        value={getValue(row.id, 'aa') || row.aa}
                        onChange={v => setNumberValues(prev => ({ ...prev, [`${row.id}_aa`]: v }))}
                        darkMode={darkMode}
                        onRowSelect={setSelectedRowIndex}
                        rowIndex={idx}
                        onColumnSelect={setSelectedColumnId}
                        columnId="aa"
                        disabled={false}
                    />
                ) : isFirstEmptyRow ? (
                    <div className="flex flex-col gap-1 p-1">
                        {/* ✅ Υπάρχον κουμπί Ενεργοποίηση */}
                        <button
                            onClick={(e) => { e.stopPropagation(); enableRow(idx) }}
                            className={`w-full px-2 py-1 text-center rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white text-sm font-medium transition-colors`}
                            style={{ minHeight: '30px' }}
                            title="Ενεργοποίηση γραμμής"
                        >
                            + Ενεργοποίηση
                        </button>
                        {/* ✅ ΝΕΟ ΚΟΥΜΠΙ - Μαζικές Καταχωρήσεις */}
                        {onOpenBatchEntry && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenBatchEntry() }}
                                className={`w-full px-2 py-1 text-center rounded ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white text-sm font-medium transition-colors`}
                                style={{ minHeight: '30px' }}
                                title="Μαζικές Καταχωρήσεις"
                            >
                                📝 Μαζικές
                            </button>
                        )}
                    </div>
                ) : null}
            </td>

            {/* Month Column */}
            <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 align-middle ${getStickyClass('left-[64px]')} ${stickyDataBg} ${isColumnSelected('month') ? (darkMode ? 'bg-blue-800/40' : 'bg-blue-50') : ''}`} onMouseDown={() => setSelectedColumnId('month')}>
                {row.id ? (
                    <select
                        className={`w-full px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        value={numberValues[`${row.id}_month`] || row.month || ''}
                        onChange={e => {
                            const newRows = [...rows]
                            newRows[idx].month = e.target.value
                            setRows(newRows)
                            setNumberValues(prev => ({ ...prev, [`${row.id}_month`]: e.target.value }))
                        }}
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <option value="">Επιλέξτε...</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                ) : null}
            </td>

            {/* Day Column */}
            <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-0 align-middle ${getStickyClass('left-[224px]')} ${stickyDataBg} ${isColumnSelected('day') ? (darkMode ? 'bg-blue-800/40' : 'bg-blue-50') : ''}`} onMouseDown={() => setSelectedColumnId('day')}>
                {row.id ? (
                    <NumberCell
                        value={getValue(row.id, 'day') || row.day}
                        onChange={v => setNumberValues(prev => ({ ...prev, [`${row.id}_day`]: v }))}
                        darkMode={darkMode}
                        onRowSelect={setSelectedRowIndex}
                        rowIndex={idx}
                        onColumnSelect={setSelectedColumnId}
                        columnId="day"
                        disabled={false}
                    />
                ) : null}
            </td>

            {/* Description Column */}
            <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 align-middle ${getStickyClass('left-[304px]')} ${stickyDataBg} ${isColumnSelected('description') ? (darkMode ? 'bg-blue-800/40' : 'bg-blue-50') : ''}`} style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.15)' }} onMouseDown={() => setSelectedColumnId('description')}>
                {row.id ? (
                    <textarea
                        rows={2}
                        className={`w-full px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-300'} text-sm`}
                        value={numberValues[`${row.id}_description`] || row.description || ''}
                        onChange={e => {
                            setNumberValues(prev => ({ ...prev, [`${row.id}_description`]: e.target.value }))
                            const newRows = [...rows]
                            newRows[idx].description = e.target.value
                            setRows(newRows)
                        }}
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                        placeholder="Αιτιολογία"
                    />
                ) : null}
            </td>

            {/* Onomastika columns */}
            {displayOnomastika.map((o, oidx) => {
                const isRealOnomastiko = !o.isPlaceholder && !o.isEmpty
                const isDebitSelected = isColumnSelected(`${o.id}_debit`)
                const isCreditSelected = isColumnSelected(`${o.id}_credit`)Ενεργοποίηση
                return (
                    <React.Fragment key={`row-${idx}-${o.id}`}>
                        <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-0 ${oidx === 6 ? 'border-l-4 border-l-gray-500' : ''} align-middle transition-colors ${isDebitSelected ? (darkMode ? 'bg-blue-800/50' : 'bg-blue-100/70') : ''}`} onMouseDown={() => setSelectedColumnId(`${o.id}_debit`)}>
                            {row.id && isRealOnomastiko ? (
                                <NumberCell
                                    value={getValue(row.id, `${o.id}_debit`)}
                                    onChange={v => setNumberValues(prev => ({ ...prev, [`${row.id}_${o.id}_debit`]: v }))}
                                    darkMode={darkMode}
                                    onRowSelect={setSelectedRowIndex}
                                    rowIndex={idx}
                                    onColumnSelect={setSelectedColumnId}
                                    columnId={`${o.id}_debit`}
                                    disabled={false}
                                />
                            ) : <div className="w-full h-full px-2 py-1 text-center"></div>}
                        </td>
                        <td className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-0 align-middle transition-colors ${isCreditSelected ? (darkMode ? 'bg-blue-800/50' : 'bg-blue-100/70') : ''}`} onMouseDown={() => setSelectedColumnId(`${o.id}_credit`)}>
                            {row.id && isRealOnomastiko ? (
                                <NumberCell
                                    value={getValue(row.id, `${o.id}_credit`)}
                                    onChange={v => setNumberValues(prev => ({ ...prev, [`${row.id}_${o.id}_credit`]: v }))}
                                    darkMode={darkMode}
                                    onRowSelect={setSelectedRowIndex}
                                    rowIndex={idx}
                                    onColumnSelect={setSelectedColumnId}
                                    columnId={`${o.id}_credit`}
                                    disabled={false}
                                />
                            ) : <div className="w-full h-full px-2 py-1 text-center"></div>}
                        </td>
                    </React.Fragment>
                )
            })}
        </tr>
    )
}

export default TableRow