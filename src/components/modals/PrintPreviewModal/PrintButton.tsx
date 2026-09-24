// C:\Biblio_Ylikou_NEW\src\components\modals\PrintPreviewModal\PrintButton.tsx
'use client'

import React, { useState } from 'react'

interface PrintButtonProps {
    onPrint: () => void
    isPrinting: boolean
    darkMode?: boolean
}

const PrintButton: React.FC<PrintButtonProps> = ({
    onPrint,
    isPrinting,
    darkMode = false
}) => {
    return (
        <button
            onClick={onPrint}
            disabled={isPrinting}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isPrinting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : darkMode
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
        >
            {isPrinting ? '⏳ Προετοιμασία...' : '🖨️ Εκτύπωση'}
        </button>
    )
}

export default PrintButton