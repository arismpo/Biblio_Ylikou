// C:\Biblio_Ylikou_NEW\src\components\modals\PrintPreviewModal\types.ts

export interface Onomastiko {
    id: number | string
    name: string
    number: string
    page: number | null
    isPlaceholder?: boolean
    isEmpty?: boolean
    highlighted?: boolean
}

export interface Row {
    id: number | null
    aa: string | number
    month: string
    day: string | number
    description: string
    page?: number
    cells?: any[]
    isEmpty?: boolean
}

export interface PrintPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
    selectedYear: number
    selectedChapterId: number
    chapterName: string
    chapterDescription: string
    onomastika: Onomastiko[]
    rows: Row[]
    currentChapterPages: number[]
    selectedPage: number | null
    previousYearBalances: Record<string | number, { debit: number; credit: number }>
}

export interface TableRendererProps {
    onomastikaGroup: Onomastiko[]
    startIndex: number
    label: string
    isRight: boolean
    pageRows: Row[]
    isFirstPage: boolean
    chapterName: string
    chapterDescription: string
    selectedYear: number
    currentPageNumber: number
    previousYearBalances: Record<string | number, { debit: number; credit: number }>
    printMode?: boolean
}