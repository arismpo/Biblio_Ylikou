// C:\Biblio_Ylikou_NEW\src\components\modals\PrintPreviewModal\helpers.ts

export const formatNumber = (value: any): string => {
    if (value === undefined || value === null || value === '') return ''
    const num = parseFloat(value)
    if (isNaN(num) || num === 0) return ''
    if (Number.isInteger(num)) return num.toString()
    return num.toString()
}

export const formatPreviousYearValue = (value: any): string => {
    if (value === undefined || value === null || value === '') return '0'
    const num = parseFloat(value)
    if (isNaN(num)) return '0'
    if (num === 0) return '0'
    if (Number.isInteger(num)) return num.toString()
    return num.toString()
}

export const getOnomastikaFontSize = (text: string): string => {
    if (!text) return '7.5px'
    const length = text.length
    if (length <= 10) return '7.5px'
    if (length <= 15) return '7px'
    if (length <= 20) return '6.5px'
    if (length <= 30) return '6px'
    return '4px'
}

export const getMonthFontSize = (text: string): string => {
    if (!text) return '6px'
    const length = text.length
    if (length <= 3) return '6px'
    if (length <= 5) return '6px'
    if (length <= 7) return '5.5px'
    if (length <= 9) return '5px'
    return '3.5px'
}

export const getDescriptionFontSize = (text: string): string => {
    if (!text) return '7.5px'
    const length = text.length
    if (length <= 20) return '7.5px'
    if (length <= 30) return '7px'
    if (length <= 40) return '6.5px'
    if (length <= 60) return '6px'
    return '4px'
}

export const getVisibleOnomastika = (onomastikaGroup: any[]): any[] => {
    let visibleOnomastika = onomastikaGroup || []
    if (visibleOnomastika.length === 0) {
        const placeholders = []
        for (let i = 0; i < 16; i++) {
            placeholders.push({
                id: `empty-${i}`,
                name: '',
                number: '',
                isPlaceholder: true,
                isEmpty: true
            })
        }
        visibleOnomastika = placeholders
    }
    return visibleOnomastika
}

export const calculateTotals = (
    realOnomastika: any[],
    startIndex: number,
    pageRows: any[]
): { totalDebit: number[]; totalCredit: number[]; balance: number[] } => {
    const totalDebit = new Array(realOnomastika.length).fill(0)
    const totalCredit = new Array(realOnomastika.length).fill(0)

    pageRows.forEach((row: any) => {
        if (!row || !row.cells) return
        const cells = row.cells || []
        for (let i = 0; i < realOnomastika.length; i++) {
            const idx = startIndex + i
            if (idx < cells.length) {
                totalDebit[i] += parseFloat(cells[idx]?.debit) || 0
                totalCredit[i] += parseFloat(cells[idx]?.credit) || 0
            }
        }
    })

    const balance = totalDebit.map((d, i) => d - totalCredit[i])
    return { totalDebit, totalCredit, balance }
}