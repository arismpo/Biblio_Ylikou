// C:\Biblio_Ylikou_NEW\src\components\modals\PrintPreviewModal\index.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'
import { PrintPreviewModalProps } from './types'
import TableRenderer from './TableRenderer'
import { printStyles } from './styles'

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
    isOpen,
    onClose,
    darkMode,
    selectedYear,
    selectedChapterId,
    chapterName,
    chapterDescription,
    onomastika,
    rows,
    currentChapterPages,
    selectedPage,
    previousYearBalances
}) => {
    const [currentPrintPage, setCurrentPrintPage] = useState(1)
    const [isPrinting, setIsPrinting] = useState(false)
    const printContainerRef = useRef<HTMLDivElement>(null)

    const pageNumbers = currentChapterPages && currentChapterPages.length > 0 ? currentChapterPages : [1]
    const totalPages = pageNumbers.length

    useEffect(() => {
        if (selectedPage) {
            const index = pageNumbers.indexOf(selectedPage)
            if (index !== -1) {
                setCurrentPrintPage(index + 1)
            } else {
                setCurrentPrintPage(1)
            }
        }
    }, [selectedPage, pageNumbers])

    const currentPageNumber = pageNumbers[currentPrintPage - 1] || pageNumbers[0] || 1

    const currentOnomastika = onomastika.filter((o: any) => o.page === currentPageNumber)
    const leftGroup = currentOnomastika.slice(0, 6)
    const rightGroup = currentOnomastika.slice(6, 16)
    const currentPageRows = rows.filter((row: any) => row.page === currentPageNumber)
    const isFirstPage = currentPrintPage === 1

    const handlePrint = async () => {
        if (isPrinting) return
        setIsPrinting(true)

        try {
            let allPagesHTML = ''
            let pageCounter = 0

            for (let index = 0; index < pageNumbers.length; index++) {
                const pageNum = pageNumbers[index]
                const pageOnomastika = onomastika.filter((o: any) => o.page === pageNum)
                const leftGroupPrint = pageOnomastika.slice(0, 6)
                const rightGroupPrint = pageOnomastika.slice(6, 16)
                const pageRowsPrint = rows.filter((row: any) => row.page === pageNum)
                const isFirstPagePrint = index === 0

                const leftElement = (
                    <TableRenderer
                        onomastikaGroup={leftGroupPrint}
                        startIndex={0}
                        label=""
                        isRight={false}
                        pageRows={pageRowsPrint}
                        isFirstPage={isFirstPagePrint}
                        chapterName={chapterName}
                        chapterDescription={chapterDescription}
                        selectedYear={selectedYear}
                        currentPageNumber={pageNum}
                        previousYearBalances={previousYearBalances}
                        printMode={true}
                        showHeader={false}
                    />
                )
                let leftHTML = ''
                try {
                    leftHTML = ReactDOMServer.renderToString(leftElement)
                } catch (e) {
                    leftHTML = '<div>Error rendering table</div>'
                }

                allPagesHTML += `
                    <div class="${pageCounter === 0 ? '' : 'page-break'}" style="page-break-after: always; break-after: page; width: 100%; padding: 15px 10px; box-sizing: border-box;">
                        <div style="text-align:center;font-size:14px;font-weight:bold;margin-bottom:8px;color:#000000;">ΒΙΒΛΙΟ ΥΛΙΚΟΥ</div>
                        <div style="text-align:center;font-size:11px;margin-bottom:6px;color:#000000;">${chapterName} • Σελίδα ${pageNum}</div>
                        <div style="width:100%;">${leftHTML}</div>
                    </div>
                `
                pageCounter++

                if (rightGroupPrint.length > 0) {
                    const rightElement = (
                        <TableRenderer
                            onomastikaGroup={rightGroupPrint}
                            startIndex={6}
                            label=""
                            isRight={true}
                            pageRows={pageRowsPrint}
                            isFirstPage={isFirstPagePrint}
                            chapterName={chapterName}
                            chapterDescription={chapterDescription}
                            selectedYear={selectedYear}
                            currentPageNumber={pageNum}
                            previousYearBalances={previousYearBalances}
                            printMode={true}
                            showHeader={false}
                        />
                    )
                    let rightHTML = ''
                    try {
                        rightHTML = ReactDOMServer.renderToString(rightElement)
                    } catch (e) {
                        rightHTML = '<div>Error rendering table</div>'
                    }

                    allPagesHTML += `
                        <div class="page-break" style="page-break-after: always; break-after: page; width: 100%; padding: 15px 10px; box-sizing: border-box;">
                            <div style="text-align:center;font-size:14px;font-weight:bold;margin-bottom:8px;color:#000000;">ΔΙ.Π.Υ.Ν. Κέρκυρας</div>
                            <div style="text-align:center;font-size:11px;margin-bottom:6px;color:#000000;">${chapterName} • Σελίδα ${pageNum}</div>
                            <div style="width:100%;">${rightHTML}</div>
                        </div>
                    `
                    pageCounter++
                }
            }

            const fullHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Εκτύπωση</title>
                    <style>
                        ${printStyles}
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { padding: 5px; font-family: Arial, sans-serif; background: #ffffff; }
                        .page-break { page-break-after: always; break-after: page; }
                        table { width: 100%; border-collapse: collapse; font-size: 6px; table-layout: fixed; }
                        td, th { border: 1px solid #000000; padding: 1px; text-align: center; font-size: 6px; }
                        th { font-weight: bold; background-color: #e8e8e8; }
                        @page { size: portrait; margin: 0.2cm; }
                        @media print {
                            body { padding: 2px; margin: 0; }
                            @page { size: portrait; margin: 0.2cm; }
                            .page-break { page-break-after: always; break-after: page; }
                            table { page-break-inside: avoid; }
                            tr { page-break-inside: avoid; }
                            thead { display: table-header-group; }
                        }
                    </style>
                </head>
                <body>
                    ${allPagesHTML}
                </body>
                </html>
            `

            const printWindow = window.open('', '_blank', 'width=1100,height=900')
            if (!printWindow) {
                alert('Παρακαλώ επιτρέψτε τα pop-ups για εκτύπωση')
                setIsPrinting(false)
                return
            }

            const doc = printWindow.document
            doc.write(fullHTML)
            doc.close()

            setTimeout(() => {
                printWindow.focus()
                printWindow.print()
                setTimeout(() => {
                    setIsPrinting(false)
                }, 2000)
            }, 800)

        } catch (error) {
            console.error('Error printing:', error)
            alert('Σφάλμα κατά την εκτύπωση: ' + (error as Error).message)
            setIsPrinting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-white  border-b border-gray-200  p-3 shadow-lg flex-shrink-0">
                <div className="flex justify-between items-center max-w-7xl mx-auto flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold text-gray-900 ">Προεπισκόπηση Εκτύπωσης</h2>
                        <span className="text-xs text-gray-500 ">
                            {currentOnomastika.length} ονομαστικά • {totalPages} σελίδες
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setCurrentPrintPage(Math.max(1, currentPrintPage - 1))}
                            disabled={currentPrintPage === 1}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 text-sm"
                        >
                            ◀
                        </button>
                        {pageNumbers.map((pageNum, idx) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPrintPage(idx + 1)}
                                className={`px-3 py-1 rounded text-sm ${currentPrintPage === idx + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200  text-gray-700  hover:bg-gray-300 '
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPrintPage(Math.min(totalPages, currentPrintPage + 1))}
                            disabled={currentPrintPage === totalPages}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 text-sm"
                        >
                            ▶
                        </button>
                        <span className="text-xs text-gray-500  ml-2">
                            Σελίδα {currentPrintPage} / {totalPages}
                        </span>
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm ml-4 disabled:opacity-50"
                        >
                            {isPrinting ? '⏳...' : '🖨️ Εκτύπωση'}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                            Κλείσιμο
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white  shadow-lg p-4 rounded-lg">

                        {/* ✅ ΤΙΤΛΟΣ ΕΞΩ ΑΠΟ ΤΟΝ ΠΙΝΑΚΑ */}
                        <div className="text-center mb-4">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                ΒΙΒΛΙΟ ΥΛΙΚΟΥ
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {chapterName} • Σελίδα {currentPageNumber}
                            </p>
                        </div>

                        {/* ✅ ΠΙΝΑΚΑΣ - ΧΩΡΙΣ ΤΟΝ ΤΙΤΛΟ ΜΕΣΑ */}
                        <div className="flex gap-4">
                            {/* Left Table */}
                            <div className="flex-1 overflow-x-auto">
                                <TableRenderer
                                    onomastikaGroup={leftGroup}
                                    startIndex={0}
                                    label=""
                                    isRight={false}
                                    pageRows={currentPageRows}
                                    isFirstPage={isFirstPage}
                                    chapterName={chapterName}
                                    chapterDescription={chapterDescription}
                                    selectedYear={selectedYear}
                                    currentPageNumber={currentPageNumber}
                                    previousYearBalances={previousYearBalances}
                                    printMode={false}
                                    showHeader={false}
                                />
                            </div>
                            {/* Right Table */}
                            <div className="flex-1 overflow-x-auto">
                                <TableRenderer
                                    onomastikaGroup={rightGroup}
                                    startIndex={6}
                                    label=""
                                    isRight={true}
                                    pageRows={currentPageRows}
                                    isFirstPage={isFirstPage}
                                    chapterName={chapterName}
                                    chapterDescription={chapterDescription}
                                    selectedYear={selectedYear}
                                    currentPageNumber={currentPageNumber}
                                    previousYearBalances={previousYearBalances}
                                    printMode={false}
                                    showHeader={false}
                                /> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrintPreviewModal