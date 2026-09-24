// C:\Biblio_Ylikou_NEW\src\components\modals\PrintPreviewModal\TableRenderer.tsx
'use client'

import React from 'react'
import { TableRendererProps } from './types'
import {
    formatNumber,
    formatPreviousYearValue,
    getOnomastikaFontSize,
    getMonthFontSize,
    getDescriptionFontSize,
    getVisibleOnomastika,
    calculateTotals
} from './helpers'
import { getPrintModeStyles } from './styles'

const TableRenderer: React.FC<TableRendererProps> = ({
    onomastikaGroup,
    startIndex,
    label,
    isRight,
    pageRows,
    isFirstPage,
    chapterName,
    chapterDescription,
    selectedYear,
    currentPageNumber,
    previousYearBalances,
    printMode = false,
    showHeader = true
}) => {
    const visibleOnomastika = getVisibleOnomastika(onomastikaGroup)
    const realOnomastika = visibleOnomastika.filter((o: any) => !o.isPlaceholder && !o.isEmpty)
    const hasRealOnomastika = realOnomastika.length > 0

    const { totalDebit, totalCredit, balance } = calculateTotals(realOnomastika, startIndex, pageRows)
    const styles = getPrintModeStyles(printMode)

    const rowsWithData = pageRows.filter((row: any) => !row.isEmpty && row.id && row.id.toString().indexOf('empty-row') === -1)
    const dataRowsCount = rowsWithData.length

    const previousValues = realOnomastika.map((o: any) => {
        const prev = previousYearBalances[o.id] || { debit: 0, credit: 0 }
        return { previousDebit: prev.debit || 0, previousCredit: prev.credit || 0 }
    })

    const hasPrev = previousValues.some(t => t.previousDebit > 0 || t.previousCredit > 0)
    const TOTAL_ROWS = 41
    const totalUsedRows = dataRowsCount + (hasPrev ? 1 : 0) + 2
    const emptyRowsNeeded = Math.max(0, TOTAL_ROWS - totalUsedRows)

    const rightNameHeight = printMode ? '52px' : '52px'
    const rightNumberHeight = printMode ? '30px' : '25px'

    // ============================================================
    // LEFT TABLE
    // ============================================================
    if (!isRight) {
        return (
            <div style={{ width: '100%' }}>
                {showHeader && label && (
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', color: '#000' }}>
                        {label}
                    </div>
                )}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: styles.fontSize, color: '#000000', tableLayout: 'fixed' }}>
                        <colgroup>
                            <col style={{ width: '15px' }} />
                            <col style={{ width: '25px' }} />
                            <col style={{ width: '15px' }} />
                            <col style={{ width: '120px' }} />
                            {visibleOnomastika.map((_, idx) => (
                                <React.Fragment key={`col-${idx}`}>
                                    <col style={{ width: '22px' }} />
                                    <col style={{ width: '22px' }} />
                                </React.Fragment>
                            ))}
                        </colgroup>

                        {/* ✅ ΟΛΑ ΤΑ HEADER ΩΣ ΓΡΑΜΜΕΣ ΣΤΟ tbody */}
                        <tbody>
                            {/* Header Row 1 - Τίτλοι */}
                            <tr style={{ height: styles.headerRowHeight }}>
                                <td rowSpan="6" style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: styles.fontSize,
                                    height: printMode ? '45px' : '50px',
                                    width: '15px',
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                    color: '#000'
                                }}>
                                    {printMode ? 'Αύξων Αριθμός Δικαιολογητικών' : 'Αύξων Αριθμός Δικαιολογητικών'}
                                </td>
                                <td colSpan="2" style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: styles.fontSize,
                                    height: styles.headerRowHeight,
                                    width: '40px',
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    {selectedYear}
                                </td>
                                <td style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: printMode ? '6px' : '8px',
                                    height: styles.headerRowHeight,
                                    width: '120px',
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    Σελίδα {currentPageNumber}
                                </td>
                                {visibleOnomastika.map((onom) => (
                                    <td colSpan="2" rowSpan="6" key={`header-${onom.id}`} style={{
                                        border: '1px solid #000000',
                                        padding: 0,
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#f0f0f0',
                                        verticalAlign: 'top',
                                        height: styles.onomastikaHeight,
                                        width: '44px',
                                        overflow: 'hidden',
                                        color: '#000'
                                    }}>
                                        <div style={{
                                            padding: printMode ? '1px 1px 0px 1px' : '2px 1px 1px 1px',
                                            borderBottom: '1px solid #000000',
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            height: printMode ? '65%' : '70%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: '1.1',
                                            overflow: 'hidden',
                                            fontSize: onom.isPlaceholder ? (printMode ? '4px' : '6px') : (printMode ? '4.5px' : getOnomastikaFontSize(onom.name)),
                                            backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#f0f0f0',
                                            color: onom.isPlaceholder ? '#ccc' : '#000',
                                            fontWeight: onom.isPlaceholder ? 'normal' : 'bold'
                                        }}>
                                            {onom.isPlaceholder ? '' : (onom.name || '—')}
                                        </div>
                                        <div style={{
                                            padding: printMode ? '0px 1px 1px 1px' : '1px 1px 2px 1px',
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            height: printMode ? '35%' : '30%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: '1.1',
                                            overflow: 'hidden',
                                            fontSize: onom.isPlaceholder ? (printMode ? '3.5px' : '5px') : (printMode ? '4px' : getOnomastikaFontSize(onom.number)),
                                            backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#f0f0f0',
                                            color: onom.isPlaceholder ? '#ccc' : '#000'
                                        }}>
                                            {onom.isPlaceholder ? '' : (onom.number || '')}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Header Row 2 - ΜΗΝΑΣ, ΗΜΕΡΑ, ΛΕΠΤΟΜΕΡΕΙΕΣ */}
                            <tr style={{ height: styles.headerRowHeight }}>
                                <td rowSpan="5" style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: getMonthFontSize('ΜΗΝΑΣ'),
                                    height: styles.headerRowHeight,
                                    width: '15px',
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                    color: '#000'
                                }}>ΜΗΝΑΣ</td>
                                <td rowSpan="5" style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: styles.fontSize,
                                    height: styles.headerRowHeight,
                                    width: '15px',
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                    color: '#000'
                                }}>ΗΜΕΡΑ</td>
                                <td rowSpan="5" style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: styles.fontSize,
                                    height: styles.headerRowHeight,
                                    width: '120px',
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    ΛΕΠΤΟΜΕΡΕΙΕΣ
                                </td>
                            </tr>

                            {/* Header Row 3 - chapterName */}
                            <tr style={{ height: styles.subHeaderHeight }}>

                                <td colSpan="1"  style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontWeight: 'bold',
                                    fontSize: printMode ? '6px' : '10px',
                                    height: styles.subHeaderHeight,
                                    color: '#000'
                                }}>
                                    {chapterName || 'Α.Α.Α'}
                                </td>
                            </tr>

                            {/* Header Row 4 - chapterDescription */}
                            <tr style={{ height: styles.subHeaderHeight }}>
                                <td colSpan="3" style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    textAlign: 'center',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: styles.fontSize,
                                    height: styles.subHeaderHeight,
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    {chapterDescription || 'ΥΓΕΙΟΝΟΜΙΚΟ ΥΛΙΚΟ'}
                                </td>
                            </tr>

                            {/* Header Row 5 - X/Π */}
                            <tr style={{ height: styles.subHeaderHeight }}>
                                {visibleOnomastika.map((onom) => (
                                    <React.Fragment key={`x-p-${onom.id}`}>
                                        <td style={{
                                            border: '1px solid #000000',
                                            padding: styles.cellPadding,
                                            textAlign: 'center',
                                            backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#e8e8e8',
                                            fontSize: styles.fontSize,
                                            fontWeight: 'bold',
                                            width: '22px',
                                            color: '#000'
                                        }}>Χ</td>
                                        <td style={{
                                            border: '1px solid #000000',
                                            padding: styles.cellPadding,
                                            textAlign: 'center',
                                            backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#e8e8e8',
                                            fontSize: styles.fontSize,
                                            fontWeight: 'bold',
                                            width: '22px',
                                            color: '#000'
                                        }}>Π</td>
                                    </React.Fragment>
                                ))}
                            </tr>

                            {/* Header Row 6 - Previous Year */}
                            <tr style={{ borderTop: '1px solid #000000', height: styles.previousYearHeight }}>
                                <td colSpan="4" style={{
                                    border: '1px solid #000000',
                                    padding: styles.cellPadding,
                                    textAlign: 'right',
                                    fontWeight: 'bold',
                                    backgroundColor: '#e8e8e8',
                                    fontSize: printMode ? '4px' : '6px',
                                    color: '#000'
                                }}>
                                    Υπόλοιπο από προηγούμενο έτος:
                                </td>
                                {visibleOnomastika.map((onom, idx) => {
                                    if (!hasRealOnomastika || onom.isPlaceholder || !isFirstPage) {
                                        return (
                                            <React.Fragment key={`prev-empty-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, width: '22px', color: '#ccc' }} />
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, width: '22px', color: '#ccc' }} />
                                            </React.Fragment>
                                        )
                                    }
                                    const realIdx = realOnomastika.findIndex(o => o.id === onom.id)
                                    if (realIdx === -1) {
                                        return (
                                            <React.Fragment key={`prev-empty-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, width: '22px', color: '#ccc' }} />
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, width: '22px', color: '#ccc' }} />
                                            </React.Fragment>
                                        )
                                    }
                                    const total = previousValues[realIdx] || { previousDebit: 0, previousCredit: 0 }
                                    return (
                                        <React.Fragment key={`prev-${idx}`}>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ffffff', fontSize: styles.fontSize, width: '22px', color: '#000' }}>
                                                {formatPreviousYearValue(total.previousDebit)}
                                            </td>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ffffff', fontSize: styles.fontSize, width: '22px', color: '#000' }}>
                                                {formatPreviousYearValue(total.previousCredit)}
                                            </td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>

                            {/* Data Rows */}
                            {hasRealOnomastika && rowsWithData.map((row) => (
                                <tr key={row.id} style={{ height: styles.rowHeight }}>
                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, width: '15px', color: '#000' }}>{row.aa || ''}</td>
                                    <td style={{
                                        border: '1px solid #000000',
                                        padding: styles.cellPadding,
                                        textAlign: 'center',
                                        backgroundColor: '#ffffff',
                                        fontSize: isFirstPage ? (printMode ? '4px' : getMonthFontSize(row.month)) : '4px',
                                        height: styles.rowHeight,
                                        width: '25px',
                                        color: isFirstPage ? '#000' : '#ccc',
                                        lineHeight: '1.1',
                                        overflow: 'hidden',
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word'
                                    }}>
                                        {isFirstPage ? (row.month || '') : ''}
                                    </td>
                                    <td style={{
                                        border: '1px solid #000000',
                                        padding: styles.cellPadding,
                                        textAlign: 'center',
                                        backgroundColor: '#ffffff',
                                        fontSize: styles.fontSize,
                                        height: styles.rowHeight,
                                        width: '15px',
                                        color: isFirstPage ? '#000' : '#ccc'
                                    }}>
                                        {isFirstPage ? (row.day || '') : ''}
                                    </td>
                                    <td style={{
                                        border: '1px solid #000000',
                                        padding: styles.cellPadding,
                                        backgroundColor: '#ffffff',
                                        fontSize: isFirstPage ? (printMode ? '4px' : getDescriptionFontSize(row.description)) : '4px',
                                        width: '120px',
                                        height: styles.descriptionHeight,
                                        overflow: 'hidden',
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.1',
                                        textOverflow: 'ellipsis',
                                        textAlign: 'left',
                                        color: isFirstPage ? '#000' : '#ccc'
                                    }}>
                                        {isFirstPage ? (row.description || '') : ''}
                                    </td>
                                    {visibleOnomastika.map((onom, idx) => {
                                        if (onom.isPlaceholder) {
                                            return (
                                                <React.Fragment key={`cell-${row.id}-${idx}`}>
                                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, width: '22px', color: '#ccc' }} />
                                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, width: '22px', color: '#ccc' }} />
                                                </React.Fragment>
                                            )
                                        }
                                        const cell = row.cells?.[idx]
                                        const debitVal = parseFloat(cell?.debit) || 0
                                        const creditVal = parseFloat(cell?.credit) || 0
                                        return (
                                            <React.Fragment key={`cell-${row.id}-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, width: '22px', color: '#000' }}>
                                                    {debitVal !== 0 ? formatNumber(debitVal) : ''}
                                                </td>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, width: '22px', color: '#000' }}>
                                                    {creditVal !== 0 ? formatNumber(creditVal) : ''}
                                                </td>
                                            </React.Fragment>
                                        )
                                    })}
                                </tr>
                            ))}

                            {/* Empty rows when no onomastika */}
                            {!hasRealOnomastika && Array.from({ length: 40 }).map((_, i) => (
                                <tr key={`empty-row-${i}`} style={{ height: styles.rowHeight }}>
                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.descriptionHeight, backgroundColor: '#ffffff' }} />
                                    {visibleOnomastika.map((_, idx) => (
                                        <React.Fragment key={`empty-cell-${idx}`}>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))}

                            {/* Totals Row */}
                            {hasRealOnomastika && (
                                <tr style={{ height: styles.totalsRowHeight, fontWeight: 'bold', backgroundColor: '#e8e8e8', borderTop: '2px solid #000000' }}>
                                    <td colSpan="4" style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'right', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#000', fontWeight: 'bold' }}>
                                        {isFirstPage ? 'ΣΥΝΟΛΑ:' : 'ΣΥΝ.'}
                                    </td>
                                    {visibleOnomastika.map((onom, idx) => {
                                        if (onom.isPlaceholder) {
                                            return (
                                                <React.Fragment key={`total-empty-${idx}`}>
                                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '22px', color: '#ccc' }} />
                                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '22px', color: '#ccc' }} />
                                                </React.Fragment>
                                            )
                                        }
                                        const realIdx = realOnomastika.findIndex(o => o.id === onom.id)
                                        if (realIdx === -1) {
                                            return (
                                                <React.Fragment key={`total-empty-${idx}`}>
                                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '22px', color: '#ccc' }} />
                                                    <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '22px', color: '#ccc' }} />
                                                </React.Fragment>
                                            )
                                        }
                                        return (
                                            <React.Fragment key={`total-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '22px', color: '#000' }}>
                                                    {formatNumber(totalDebit[realIdx])}
                                                </td>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '22px', color: '#000' }}>
                                                    {formatNumber(totalCredit[realIdx])}
                                                </td>
                                            </React.Fragment>
                                        )
                                    })}
                                </tr>
                            )}

                            {/* Balance Row */}
                            {hasRealOnomastika && (
                                <tr style={{ height: styles.totalsRowHeight, fontWeight: 'bold', backgroundColor: '#e8e8e8' }}>
                                    <td colSpan="4" style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'right', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#000', fontWeight: 'bold' }}>
                                        {isFirstPage ? 'ΥΠΟΛΟΛΟΙΠΟ:' : 'ΥΠΟΛ.'}
                                    </td>
                                    {visibleOnomastika.map((onom, idx) => {
                                        if (onom.isPlaceholder) {
                                            return (
                                                <td colSpan="2" key={`balance-empty-${idx}`} style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '44px', color: '#ccc' }} />
                                            )
                                        }
                                        const realIdx = realOnomastika.findIndex(o => o.id === onom.id)
                                        if (realIdx === -1) {
                                            return (
                                                <td colSpan="2" key={`balance-empty-${idx}`} style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '44px', color: '#ccc' }} />
                                            )
                                        }
                                        const bal = balance[realIdx] || 0
                                        return (
                                            <td colSpan="2" key={`balance-${idx}`} style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, width: '44px', color: '#000' }}>
                                                {bal !== 0 ? formatNumber(bal) + ' €' : ''}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )}

                            {/* Empty rows to fill up to 41 rows */}
                            {hasRealOnomastika && emptyRowsNeeded > 0 && (
                                Array.from({ length: emptyRowsNeeded }).map((_, i) => (
                                    <tr key={`empty-${i}`} style={{ height: styles.rowHeight }}>
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.descriptionHeight, backgroundColor: '#ffffff' }} />
                                        {visibleOnomastika.map((_, idx) => (
                                            <React.Fragment key={`empty-cell-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                ))
                            )}

                            {/* Spacer */}
                            <tr style={{ height: '2px' }}>
                                <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                {visibleOnomastika.map((_, idx) => (
                                    <React.Fragment key={`spacer-${idx}`}>
                                        <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                        <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                    </React.Fragment>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    // ============================================================
    // RIGHT TABLE
    // ============================================================
    return (
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {showHeader && label && (
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', color: '#000' }}>
                    {label}
                </div>
            )}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: styles.fontSize, color: '#000000', tableLayout: 'fixed' }}>
                    <colgroup>
                        {visibleOnomastika.map((_, idx) => (
                            <React.Fragment key={`col-${idx}`}>
                                <col style={{ width: `${100 / (visibleOnomastika.length * 2)}%` }} />
                                <col style={{ width: `${100 / (visibleOnomastika.length * 2)}%` }} />
                            </React.Fragment>
                        ))}
                    </colgroup>

                    {/* ✅ ΟΛΑ ΣΤΟ tbody - ΔΕΞΙΟΣ ΠΙΝΑΚΑΣ (μόνο ονομαστικά) */}
                    <tbody>
                        {/* Header - Onomastika names */}
                        <tr style={{ height: styles.headerRowHeight }}>
                            {visibleOnomastika.map((onom) => (
                                <td colSpan="2" rowSpan="5" key={`header-${onom.id}`} style={{
                                    border: '1px solid #000000',
                                    padding: 0,
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#f0f0f0',
                                    verticalAlign: 'top',
                                    height: styles.onomastikaHeight,
                                    overflow: 'hidden',
                                    color: '#000'
                                }}>
                                    <div style={{
                                        padding: printMode ? '1px 1px 0px 1px' : '2px 1px 1px 1px',
                                        borderBottom: '1px solid #000000',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        height: rightNameHeight,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: '1.1',
                                        overflow: 'hidden',
                                        fontSize: onom.isPlaceholder ? (printMode ? '4px' : '6px') : (printMode ? '4.5px' : getOnomastikaFontSize(onom.name)),
                                        backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#f0f0f0',
                                        color: onom.isPlaceholder ? '#ccc' : '#000',
                                        fontWeight: onom.isPlaceholder ? 'normal' : 'bold'
                                    }}>
                                        {onom.isPlaceholder ? '' : (onom.name || '—')}
                                    </div>
                                    <div style={{
                                        padding: printMode ? '0px 1px 1px 1px' : '1px 1px 2px 1px',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        height: rightNumberHeight,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: '1.1',
                                        overflow: 'hidden',
                                        fontSize: onom.isPlaceholder ? (printMode ? '3.5px' : '5px') : (printMode ? '4px' : getOnomastikaFontSize(onom.number)),
                                        backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#f0f0f0',
                                        color: onom.isPlaceholder ? '#ccc' : '#000'
                                    }}>
                                        {onom.isPlaceholder ? '' : (onom.number || '')}
                                    </div>
                                </td>
                            ))}
                        </tr>

                        {/* Empty spacer rows */}
                        <tr style={{ height: printMode ? '4px' : styles.subHeaderHeight }} />
                        <tr style={{ height: printMode ? '4px' : styles.subHeaderHeight }} />
                        <tr style={{ height: printMode ? '4px' : styles.subHeaderHeight }} />
                        <tr style={{ height: printMode ? '4px' : styles.subHeaderHeight }} />

                        {/* X/Π header */}
                        <tr style={{ height: printMode ? '10px' : styles.subHeaderHeight }}>
                            {visibleOnomastika.map((onom) => (
                                <React.Fragment key={`x-p-right-${onom.id}`}>
                                    <td style={{
                                        border: '1px solid #000000',
                                        padding: styles.cellPadding,
                                        textAlign: 'center',
                                        backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#e8e8e8',
                                        fontSize: styles.fontSize,
                                        fontWeight: 'bold',
                                        color: '#000'
                                    }}>Χ</td>
                                    <td style={{
                                        border: '1px solid #000000',
                                        padding: styles.cellPadding,
                                        textAlign: 'center',
                                        backgroundColor: onom.isPlaceholder ? '#f5f5f5' : '#e8e8e8',
                                        fontSize: styles.fontSize,
                                        fontWeight: 'bold',
                                        color: '#000'
                                    }}>Π</td>
                                </React.Fragment>
                            ))}
                        </tr>

                        {/* Previous Year Row */}
                        <tr style={{ borderTop: '1px solid #000000', height: styles.previousYearHeight }}>
                            {visibleOnomastika.map((onom, idx) => {
                                if (!hasRealOnomastika || onom.isPlaceholder || !isFirstPage) {
                                    return (
                                        <React.Fragment key={`prev-empty-${idx}`}>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, color: '#ccc' }} />
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, color: '#ccc' }} />
                                        </React.Fragment>
                                    )
                                }
                                const realIdx = realOnomastika.findIndex(o => o.id === onom.id)
                                if (realIdx === -1) {
                                    return (
                                        <React.Fragment key={`prev-empty-${idx}`}>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, color: '#ccc' }} />
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, color: '#ccc' }} />
                                        </React.Fragment>
                                    )
                                }
                                const total = previousValues[realIdx] || { previousDebit: 0, previousCredit: 0 }
                                return (
                                    <React.Fragment key={`prev-${idx}`}>
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ffffff', fontSize: styles.fontSize, color: '#000' }}>
                                            {formatPreviousYearValue(total.previousDebit)}
                                        </td>
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ffffff', fontSize: styles.fontSize, color: '#000' }}>
                                            {formatPreviousYearValue(total.previousCredit)}
                                        </td>
                                    </React.Fragment>
                                )
                            })}
                        </tr>

                        {/* Data Rows */}
                        {hasRealOnomastika && rowsWithData.map((row) => (
                            <tr key={row.id} style={{ height: styles.rowHeight }}>
                                {visibleOnomastika.map((onom, idx) => {
                                    if (onom.isPlaceholder) {
                                        return (
                                            <React.Fragment key={`cell-${row.id}-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, color: '#ccc' }} />
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, color: '#ccc' }} />
                                            </React.Fragment>
                                        )
                                    }
                                    const cell = row.cells?.[idx]
                                    const debitVal = parseFloat(cell?.debit) || 0
                                    const creditVal = parseFloat(cell?.credit) || 0
                                    return (
                                        <React.Fragment key={`cell-${row.id}-${idx}`}>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, color: '#000' }}>
                                                {debitVal !== 0 ? formatNumber(debitVal) : ''}
                                            </td>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#ffffff', fontSize: styles.fontSize, height: styles.rowHeight, color: '#000' }}>
                                                {creditVal !== 0 ? formatNumber(creditVal) : ''}
                                            </td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        ))}

                        {!hasRealOnomastika && Array.from({ length: 40 }).map((_, i) => (
                            <tr key={`empty-row-${i}`} style={{ height: styles.rowHeight }}>
                                {visibleOnomastika.map((_, idx) => (
                                    <React.Fragment key={`empty-cell-${idx}`}>
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                        <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}

                        {/* Totals Row */}
                        {hasRealOnomastika && (
                            <tr style={{ height: styles.totalsRowHeight, fontWeight: 'bold', backgroundColor: '#e8e8e8', borderTop: '2px solid #000000' }}>
                                {visibleOnomastika.map((onom, idx) => {
                                    if (onom.isPlaceholder) {
                                        return (
                                            <React.Fragment key={`total-empty-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#ccc' }} />
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#ccc' }} />
                                            </React.Fragment>
                                        )
                                    }
                                    const realIdx = realOnomastika.findIndex(o => o.id === onom.id)
                                    if (realIdx === -1) {
                                        return (
                                            <React.Fragment key={`total-empty-${idx}`}>
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#ccc' }} />
                                                <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#ccc' }} />
                                            </React.Fragment>
                                        )
                                    }
                                    return (
                                        <React.Fragment key={`total-${idx}`}>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#000' }}>
                                                {formatNumber(totalDebit[realIdx])}
                                            </td>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#000' }}>
                                                {formatNumber(totalCredit[realIdx])}
                                            </td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        )}

                        {/* Balance Row */}
                        {hasRealOnomastika && (
                            <tr style={{ height: styles.totalsRowHeight, fontWeight: 'bold', backgroundColor: '#e8e8e8' }}>
                                {visibleOnomastika.map((onom, idx) => {
                                    if (onom.isPlaceholder) {
                                        return (
                                            <td colSpan="2" key={`balance-empty-${idx}`} style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#ccc' }} />
                                        )
                                    }
                                    const realIdx = realOnomastika.findIndex(o => o.id === onom.id)
                                    if (realIdx === -1) {
                                        return (
                                            <td colSpan="2" key={`balance-empty-${idx}`} style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#ccc' }} />
                                        )
                                    }
                                    const bal = balance[realIdx] || 0
                                    return (
                                        <td colSpan="2" key={`balance-${idx}`} style={{ border: '1px solid #000000', padding: styles.cellPadding, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e8e8e8', fontSize: styles.fontSize, height: styles.totalsRowHeight, color: '#000' }}>
                                            {bal !== 0 ? formatNumber(bal) + ' €' : ''}
                                        </td>
                                    )
                                })}
                            </tr>
                        )}

                        {hasRealOnomastika && emptyRowsNeeded > 0 && (
                            Array.from({ length: emptyRowsNeeded }).map((_, i) => (
                                <tr key={`empty-${i}`} style={{ height: styles.rowHeight }}>
                                    {visibleOnomastika.map((_, idx) => (
                                        <React.Fragment key={`empty-cell-${idx}`}>
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                            <td style={{ border: '1px solid #000000', padding: styles.cellPadding, height: styles.rowHeight, backgroundColor: '#ffffff' }} />
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))
                        )}

                        <tr style={{ height: '2px' }}>
                            {visibleOnomastika.map((_, idx) => (
                                <React.Fragment key={`spacer-${idx}`}>
                                    <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                    <td style={{ border: 'none', padding: 0, height: '2px' }} />
                                </React.Fragment>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TableRenderer