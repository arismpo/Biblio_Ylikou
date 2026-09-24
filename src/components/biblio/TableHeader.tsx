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
    const textColor = darkMode ? 'text-white' : 'text-gray-900'
    const textColorMuted = darkMode ? 'text-gray-400' : 'text-gray-600'
    const bgColor = darkMode ? 'bg-gray-700' : 'bg-slate-100'
    const bgColor2 = darkMode ? 'bg-gray-600' : 'bg-slate-200'

    return (
        <>
            {/* Σειρά 1: Τίτλος */}
            <tr className={bgColor}>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-10 ${bgColor}`} rowSpan={3}></th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-32 ${bgColor} ${textColor}`} rowSpan={3}>ΑΡΧΕΙΑ</th>
                <th colSpan={4} className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 ${darkMode ? 'bg-gray-600' : 'bg-slate-200'}`}>
                    <div className={`w-full text-center font-black text-4xl ${textColor} truncate`}>{chapterName || 'Α.Α.Α.'}</div>
                </th>
                {displayOnomastika.map((o, idx) => {
                    // Υπολογισμός χρώματος φόντου
                    let bgHighlightColor = ''
                    if (o.highlighted) {
                        bgHighlightColor = darkMode ? 'bg-yellow-900/60' : 'bg-yellow-200'
                    }

                    return (
                        <th
                            key={o.id}
                            colSpan={2}
                            rowSpan={2}
                            className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 ${idx === 6 ? 'border-l-4 border-l-gray-500' : ''} ${!o.isPlaceholder && !o.isEmpty ? 'cursor-pointer hover:bg-opacity-80 transition-colors' : ''} ${bgHighlightColor}`}
                            onClick={() => !o.isPlaceholder && !o.isEmpty && openOnomastikoModal(o)}
                        >
                            <div className="flex flex-col gap-1">
                                <div className={`p-1 font-bold text-center text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>{o.name || ''}</div>
                                <div className={`p-1 text-xs font-mono text-center ${textColorMuted}`}>{o.number || ''}</div>
                            </div>
                        </th>
                    )
                })}
            </tr>

            {/* Σειρά 2: Περιγραφή */}
            <tr className={bgColor2}>
                <th colSpan={4} className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 ${bgColor2}`}>
                    <div className={`text-center font-bold text-lg ${textColor} truncate`}>{chapterDescription || 'ΥΓΕΙΟΝΟΜΙΚΟ ΥΛΙΚΟ'}</div>
                </th>
            </tr>

            {/* Σειρά 3: Στήλες */}
            <tr className={`${bgColor2} shadow-md ${textColor}`}>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-16 ${textColor}`}>Α.Α.</th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-40 ${textColor}`}>ΜΗΝΑΣ</th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-20 ${textColor}`}>ΗΜΕΡΑ</th>
                <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-2 w-96 ${textColor}`}>ΑΙΤΙΟΛΟΓΙΑ</th>
                {displayOnomastika.map((o, idx) => {
                    // Υπολογισμός χρώματος φόντου για τις στήλες ΧΡΕΩΣΗ/ΠΙΣΤΩΣΗ
                    let bgHighlightColor = ''
                    if (o.highlighted) {
                        bgHighlightColor = darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
                    }

                    return (
                        <React.Fragment key={`h-${o.id}`}>
                            <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-1 text-[10px] font-bold w-24 ${textColor} ${bgHighlightColor}`}>
                                <span className={darkMode ? 'text-green-400' : 'text-green-600'}>ΧΡΕΩΣΗ</span>
                            </th>
                            <th className={`border-2 ${darkMode ? 'border-gray-600' : 'border-slate-300'} p-1 text-[10px] font-bold w-24 ${textColor} ${bgHighlightColor}`}>
                                <span className={darkMode ? 'text-red-400' : 'text-red-600'}>ΠΙΣΤΩΣΗ</span>
                            </th>
                        </React.Fragment>
                    )
                })}
            </tr>
        </>
    )
}

export default TableHeader