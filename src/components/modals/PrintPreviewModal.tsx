// C:\Biblio_Ylikou_NEW\src\components\modals\PrintPreviewModal.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'

interface PrintPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
    selectedYear: number
    selectedChapterId: number
    chapterName: string
    chapterDescription: string
    onomastika: any[]
    rows: any[]
    currentChapterPages: number[]
    selectedPage: number | null
    previousYearBalances: Record<string | number, { debit: number; credit: number }>
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatNumber = (value: any) => {
    if (value === undefined || value === null || value === '') return ''
    const num = parseFloat(value)
    if (isNaN(num) || num === 0) return ''
    if (Number.isInteger(num)) return num.toString()
    return num.toString()
}

const formatPreviousYearValue = (value: any) => {
    if (value === undefined || value === null || value === '') return '0'
    const num = parseFloat(value)
    if (isNaN(num)) return '0'
    if (num === 0) return '0'
    if (Number.isInteger(num)) return num.toString()
    return num.toString()
}

const getOnomastikaFontSize = (text: string) => {
    if (!text) return '7.5px'
    const length = text.length
    if (length <= 10) return '7.5px'
    if (length <= 15) return '7px'
    if (length <= 20) return '6.5px'
    if (length <= 30) return '6px'
    return '4px'
}

const getMonthFontSize = (text: string) => {
    if (!text) return '6px'
    const length = text.length
    if (length <= 3) return '6px'
    if (length <= 5) return '6px'
    if (length <= 7) return '5.5px'
    if (length <= 9) return '5px'
    return '3.5px'
}

const getDescriptionFontSize = (text: string) => {
    if (!text) return '7.5px'
    const length = text.length
    if (length <= 20) return '7.5px'
    if (length <= 30) return '7px'
    if (length <= 40) return '6.5px'
    if (length <= 60) return '6px'
    return '4px'
}