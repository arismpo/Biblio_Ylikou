'use client'

import React from 'react'

interface Onomastiko {
    id: string | number
    name: string
    number: string
    isPlaceholder: boolean
    isEmpty: boolean
    highlighted: boolean
    page?: number
}

interface TableHeaderProps {
    chapterName: string
    chapterDescription: string
    displayOnomastika: Onomastiko[]
    openOnomastikoModal: (onomastiko: Onomastiko) => void
    darkMode: boolean
    stickyHeaderBg: string
}

const TableHeader: React.FC<TableHeaderProps> = ({
    chapterName,
    chapterDescription,
    displayOnomastika,
    openOnomastikoModal,
    darkMode,
    stickyHeaderBg
}) => {
    return (
        <>
            <tr className={`${darkMode ? 'bg-gray-700' : 'bg-slate-100'} sticky top-0 z-30 shadow-sm`}>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-10 ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`} rowSpan={3}></th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-32 ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`} rowSpan={3}>ΑΡΧΕΙΑ</th>
                <th colSpan={4} className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 ${darkMode ? 'bg-gray-600' : 'bg-slate-200'} sticky left-0 z-40 max-w-[696px]`} style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)' }}>
                    <div className="w-full text-center font-black text-4xl text-slate-950 dark:text-white truncate">{chapterName || 'Α.Α.Α.'}</div>
                </th>
                {displayOnomastika.map((o, idx) => (
                    <th
                        key={o.id}
                        colSpan={2}
                        rowSpan={2}
                        className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 bg-inherit ${idx === 6 ? 'border-l-4 border-l-gray-500' : ''} ${!o.isPlaceholder && !o.isEmpty ? 'cursor-pointer hover:bg-opacity-80 transition-colors' : ''} ${o.highlighted ? (darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100') : ''}`}
                        onClick={() => !o.isPlaceholder && !o.isEmpty && openOnomastikoModal(o)}
                    >
                        <div className="flex flex-col gap-1">
                            <div className={`p-1 font-bold text-center text-sm leading-tight whitespace-normal break-words ${darkMode ? 'text-blue-300' : 'text-blue-950'}`}>{o.name || ''}</div>
                            <div className={`p-1 text-xs font-mono text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{o.number || ''}</div>
                        </div>
                    </th>
                ))}
            </tr>
            <tr className={`${darkMode ? 'bg-gray-700' : 'bg-slate-200'} sticky top-[74px] z-30 shadow-sm`}>
                <th colSpan={4} className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 ${darkMode ? 'bg-gray-600' : 'bg-slate-200'} sticky left-0 z-40 max-w-[696px]`} style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)' }}>
                    <div className="text-center font-bold text-lg truncate">{chapterDescription || 'ΥΓΕΙΟΝΟΜΙΚΟ ΥΛΙΚΟ'}</div>
                </th>
            </tr>
            <tr className={`${darkMode ? 'bg-gray-700' : 'bg-slate-200'} sticky top-[118px] z-30 shadow-md ${darkMode ? 'text-white' : 'text-slate-950'}`}>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-16 sticky left-0 z-40 ${stickyHeaderBg}`}>Α.Α.</th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-40 sticky left-[64px] z-40 ${stickyHeaderBg}`}>ΜΗΝΑΣ</th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-20 sticky left-[224px] z-40 ${stickyHeaderBg}`}>ΗΜΕΡΑ</th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-96 sticky left-[304px] z-40 ${stickyHeaderBg}`} style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)' }}>ΑΙΤΙΟΛΟΓΙΑ</th>
                {displayOnomastika.map(o => (
                    <React.Fragment key={`h-${o.id}`}>
                        <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-1 text-[10px] font-bold w-24 bg-inherit ${o.highlighted ? (darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50') : ''}`}>
                            <span className="text-green-600 dark:text-green-400">ΧΡΕΩΣΗ</span>
                        </th>
                        <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-1 text-[10px] font-bold w-24 bg-inherit ${o.highlighted ? (darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50') : ''}`}>
                            <span className="text-red-600 dark:text-red-400">ΠΙΣΤΩΣΗ</span>
                        </th>
                    </React.Fragment>
                ))}
            </tr>
        </>
    )
}

export default TableHeader