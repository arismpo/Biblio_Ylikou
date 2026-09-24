// C:\Biblio_Ylikou_NEW\src\app\dashboard\page.tsx
'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import TableHeader from '@/components/biblio/TableHeader'
import TableRow from '@/components/biblio/TableRow'
import TableTotalsRow from '@/components/biblio/TableTotalsRow'
import EditRecordModal from '@/components/modals/EditRecordModal'
import OnomastikoModal from '@/components/modals/OnomastikoModal'
import FilePreview from '@/components/FilePreview'
import SettingsModal from '@/components/modals/SettingsModal'

const months = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος']

export default function DashboardPage() {
    const tableRef = useRef<HTMLTableElement>(null)

    // State with default values (no localStorage during SSR)
    const [selectedYear, setSelectedYear] = useState(2025)
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
    const [selectedPage, setSelectedPage] = useState<number | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(280)

    // Settings State - Default values
    const [darkMode, setDarkMode] = useState(false)
    const [frozenHeader, setFrozenHeader] = useState(true)
    const [frozenFooter, setFrozenFooter] = useState(true)
    const [frozenColumns, setFrozenColumns] = useState(true)
    const [backupPath, setBackupPath] = useState('C:\\Backup_Biblio')

    // ✅ Lock State
    const [isYearLocked, setIsYearLocked] = useState(false)
    const [isCheckingLock, setIsCheckingLock] = useState(true)

    // 1. State για το Batch Entry modal (γύρω στη γραμμή 60)
    const [showBatchEntry, setShowBatchEntry] = useState(false)

    useEffect(() => {
        // Φόρτωση backup path από το API
        const loadBackupPath = async () => {
            try {
                const res = await fetch('/api/backup/get-path')
                const data = await res.json()
                console.log('📁 Page - Loaded backup path from API:', data.backupPath)
                if (data.backupPath) {
                    setBackupPath(data.backupPath)
                    localStorage.setItem('app_settings_backupPath', data.backupPath)
                } else {
                    const saved = localStorage.getItem('app_settings_backupPath')
                    if (saved) {
                        setBackupPath(saved)
                    }
                }
            } catch (error) {
                console.error('Error loading backup path:', error)
                const saved = localStorage.getItem('app_settings_backupPath')
                if (saved) {
                    setBackupPath(saved)
                }
            }
        }
        loadBackupPath()
    }, [])

    // Φόρτωση από localStorage μετά το mount
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('app_settings_darkMode')
        const savedFrozenHeader = localStorage.getItem('app_settings_frozenHeader')
        const savedFrozenFooter = localStorage.getItem('app_settings_frozenFooter')
        const savedFrozenColumns = localStorage.getItem('app_settings_frozenColumns')
        const savedSidebarOpen = localStorage.getItem('app_settings_sidebarOpen')
        const savedSidebarWidth = localStorage.getItem('mainForm2_sidebarWidth')

        if (savedDarkMode !== null) {
            const isDark = savedDarkMode === 'true'
            setDarkMode(isDark)
            if (isDark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
        if (savedFrozenHeader !== null) setFrozenHeader(savedFrozenHeader === 'true')
        if (savedFrozenFooter !== null) setFrozenFooter(savedFrozenFooter === 'true')
        if (savedFrozenColumns !== null) setFrozenColumns(savedFrozenColumns === 'true')
        if (savedSidebarOpen !== null) setSidebarOpen(savedSidebarOpen === 'true')
        if (savedSidebarWidth !== null) setSidebarWidth(parseInt(savedSidebarWidth))
    }, [])

    // ✅ Check lock status when year changes
    useEffect(() => {
        const checkLockStatus = async () => {
            setIsCheckingLock(true)
            try {
                const res = await fetch(`/api/year-lock-status/${selectedYear}`)
                const data = await res.json()
                setIsYearLocked(data.locked || false)
            } catch (error) {
                console.error('Error checking lock status:', error)
                setIsYearLocked(false)
            } finally {
                setIsCheckingLock(false)
            }
        }
        checkLockStatus()
    }, [selectedYear])

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [chapters, setChapters] = useState<any[]>([])
    const [currentChapterPages, setCurrentChapterPages] = useState<number[]>([])
    const [onomastika, setOnomastika] = useState<any[]>([])
    const [allChapterOnomastika, setAllChapterOnomastika] = useState<any[]>([])
    const [chapterName, setChapterName] = useState('')
    const [chapterDescription, setChapterDescription] = useState('')
    const [rows, setRows] = useState<any[]>([])
    const [numberValues, setNumberValues] = useState<Record<string, string>>({})
    const [attachments, setAttachments] = useState<Record<number, any[]>>({})
    const [previousYearBalances, setPreviousYearBalances] = useState<Record<string | number, { debit: number; credit: number }>>({})
    const [previewFile, setPreviewFile] = useState<any>(null)

    // UI State
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
    const [isResizing, setIsResizing] = useState(false)

    // Modal States
    const [showEditRecordModal, setShowEditRecordModal] = useState(false)
    const [editingRecord, setEditingRecord] = useState<any>(null)
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
    const [editMonth, setEditMonth] = useState('')
    const [editDay, setEditDay] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editAa, setEditAa] = useState('')
    const [editEntries, setEditEntries] = useState<any[]>([])

    const [showOnomastikoModal, setShowOnomastikoModal] = useState(false)
    const [editingOnomastiko, setEditingOnomastiko] = useState<any>(null)
    const [onomastikoName, setOnomastikoName] = useState('')
    const [onomastikoNumber, setOnomastikoNumber] = useState('')
    const [onomastikoPage, setOnomastikoPage] = useState('')
    const [onomastikoInfos, setOnomastikoInfos] = useState('')
    const [onomastikoHighlighted, setOnomastikoHighlighted] = useState(false)

    const [showBatchScanner, setShowBatchScanner] = useState(false)
    const [batchScannerRecordId, setBatchScannerRecordId] = useState<number | null>(null)
    const [scannerSettings, setScannerSettings] = useState<any>(null)

    // Settings Modal State
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    // Computed - ΠΑΝΤΑ 16 στήλες
    const displayOnomastika = useMemo(() => {
        const TARGET_COLUMNS = 16

        console.log('📊 displayOnomastika - Input:', {
            onomastikaCount: onomastika.length,
            selectedPage,
            currentChapterPages
        })

        if (!onomastika || onomastika.length === 0) {
            console.log('📊 No onomastika, creating placeholders')
            const placeholders = []
            for (let i = 0; i < TARGET_COLUMNS; i++) {
                placeholders.push({
                    id: `placeholder_${i}`,
                    name: '',
                    number: '',
                    isPlaceholder: true,
                    isEmpty: true,
                    highlighted: false,
                    page: null
                })
            }
            return placeholders
        }

        let realOnomastika: any[] = []

        if (!selectedPage) {
            realOnomastika = onomastika.filter((o: any) => !o.isPlaceholder && !o.isEmpty)
            console.log('📊 No page selected, realOnomastika:', realOnomastika.length)
        } else {
            realOnomastika = onomastika.filter((o: any) => {
                if (o.isPlaceholder || o.isEmpty) return false
                if (o.page !== undefined && o.page !== null) {
                    return o.page === selectedPage
                }
                const pageIndex = currentChapterPages.indexOf(selectedPage)
                if (pageIndex === -1) return false
                const itemsPerPage = 16
                const startPosition = pageIndex * itemsPerPage
                const endPosition = startPosition + itemsPerPage
                const idx = onomastika.indexOf(o)
                return idx >= startPosition && idx < endPosition
            })
            console.log(`📊 Page ${selectedPage} selected, realOnomastika:`, realOnomastika.length)
        }

        if (realOnomastika.length > TARGET_COLUMNS) {
            realOnomastika = realOnomastika.slice(0, TARGET_COLUMNS)
        }

        const result = [...realOnomastika]
        const currentCount = result.length

        for (let i = currentCount; i < TARGET_COLUMNS; i++) {
            result.push({
                id: `placeholder_${selectedPage || 'default'}_${i}`,
                name: '',
                number: '',
                isPlaceholder: true,
                isEmpty: true,
                highlighted: false,
                page: selectedPage || null
            })
        }

        console.log('📊 displayOnomastika - Output:', {
            realCount: realOnomastika.length,
            totalCount: result.length,
            hasReal: realOnomastika.length > 0
        })

        return result
    }, [onomastika, selectedPage, currentChapterPages])

    // Helper Functions
    const getValue = (recordId: number, field: string) => {
        if (!recordId) return ''
        return numberValues[`${recordId}_${field}`] || ''
    }

    const getRowFiles = (rowId: number) => {
        const recordId = rows[rowId]?.id
        return recordId ? (attachments[recordId] || []) : []
    }

    const isColumnSelected = (id: string) => selectedColumnId === id

    const stickyBg = darkMode ? 'bg-gray-800' : 'bg-white'
    const stickyHeaderBg = darkMode ? 'bg-gray-700' : 'bg-slate-200'

    // ===== CALCULATE TOTALS =====
    const calculateTotals = () => {
        const debitTotals: Record<string | number, number> = {}
        const creditTotals: Record<string | number, number> = {}
        const realOnomastika = displayOnomastika.filter((o: any) => !o.isPlaceholder && !o.isEmpty)

        realOnomastika.forEach((onom: any) => {
            let debitSum = 0
            let creditSum = 0
            rows.forEach((row: any) => {
                if (row.id && row.id > 0) {
                    const debitValue = parseFloat(getValue(row.id, `${onom.id}_debit`))
                    const creditValue = parseFloat(getValue(row.id, `${onom.id}_credit`))
                    if (!isNaN(debitValue)) debitSum += debitValue
                    if (!isNaN(creditValue)) creditSum += creditValue
                }
            })
            debitTotals[onom.id] = debitSum
            creditTotals[onom.id] = creditSum
        })
        return { debitTotals, creditTotals }
    }

    const { debitTotals, creditTotals } = calculateTotals()

    const getFinalBalance = (onomId: string | number) => {
        const prevBalance = previousYearBalances[onomId] || { debit: 0, credit: 0 }
        const currentDebit = debitTotals[onomId] || 0
        const currentCredit = creditTotals[onomId] || 0
        return (prevBalance.debit + currentDebit) - (prevBalance.credit + currentCredit)
    }

    // Fetch Functions
    const fetchChapters = async () => {
        try {
            const res = await fetch(`/api/chapters?year=${selectedYear}`)
            const data = await res.json()
            setChapters(data)
            const savedChapterId = localStorage.getItem('mainForm2_selectedChapterId')
            if (savedChapterId && data.some((ch: any) => ch.id === parseInt(savedChapterId))) {
                setSelectedChapterId(parseInt(savedChapterId))
            } else if (data.length && !selectedChapterId) {
                setSelectedChapterId(data[0].id)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const fetchChapterPages = async () => {
        if (!selectedChapterId) return
        try {
            const res = await fetch(`/api/chapters/${selectedChapterId}?year=${selectedYear}`)
            const data = await res.json()
            if (data.page && data.page !== '') {
                const pages = data.page.split(',').map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p))
                setCurrentChapterPages(pages)
                const savedPage = localStorage.getItem('mainForm2_selectedPage')
                if (savedPage && pages.includes(parseInt(savedPage))) {
                    setSelectedPage(parseInt(savedPage))
                } else if (pages.length > 0) {
                    setSelectedPage(pages[0])
                }
            } else {
                setCurrentChapterPages([])
                setSelectedPage(null)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const fetchAllChapterOnomastika = async () => {
        if (!selectedChapterId) return
        try {
            const response = await fetch(`/api/chapters/${selectedChapterId}?year=${selectedYear}`)
            const data = await response.json()
            if (data.onomastika) {
                const realOnomastika = data.onomastika.filter((o: any) => o.id > 0)
                setAllChapterOnomastika(realOnomastika)
            }
        } catch (error) {
            console.error('Error fetching all onomastika:', error)
        }
    }

    const fetchChapterData = async () => {
        if (!selectedChapterId) return
        setLoading(true)
        try {
            const url = `/api/chapters/${selectedChapterId}?year=${selectedYear}`

            const res = await fetch(url)
            const data = await res.json()

            setChapterName(data.name || '')
            setChapterDescription(data.description || '')
            setOnomastika(data.onomastika || [])

            // Fetch previous year balances
            const balancesUrl = `/api/form2/chapter/${selectedChapterId}/previous-year-balance?year=${selectedYear}`
            const balancesRes = await fetch(balancesUrl)
            if (balancesRes.ok) {
                const balancesData = await balancesRes.json()
                const balanceMap: Record<string | number, { debit: number; credit: number }> = {}
                const realOnomastika = data.onomastika?.filter((o: any) => !o.isPlaceholder && !o.isEmpty) || []
                if (balancesData.previousDebits && balancesData.previousCredits && realOnomastika.length > 0) {
                    realOnomastika.forEach((onom: any, idx: number) => {
                        const debit = balancesData.previousDebits[idx] || 0
                        const credit = balancesData.previousCredits[idx] || 0
                        balanceMap[onom.id] = { debit, credit }
                    })
                    setPreviousYearBalances(balanceMap)
                }
            }

            const allRecords = (data.records || []).map((r: any) => ({
                id: r.id,
                aa: r.aa,
                month: r.month,
                day: r.day,
                description: r.description
            }))
            allRecords.sort((a: any, b: any) => (a.aa || 0) - (b.aa || 0))
            setRows(allRecords)

            const vals: Record<string, string> = {}
                ; (data.records || []).forEach((r: any) => {
                    if (r.aa) vals[`${r.id}_aa`] = r.aa.toString()
                    if (r.day) vals[`${r.id}_day`] = r.day.toString()
                    if (r.month) vals[`${r.id}_month`] = r.month
                    if (r.description) vals[`${r.id}_description`] = r.description
                    if (r.entries) {
                        r.entries.forEach((e: any) => {
                            if (e.debit) vals[`${r.id}_${e.onomastikoId}_debit`] = e.debit.toString()
                            if (e.credit) vals[`${r.id}_${e.onomastikoId}_credit`] = e.credit.toString()
                        })
                    }
                })
            setNumberValues(vals)

            const attachmentsMap: Record<number, any[]> = {}
            for (const record of data.records || []) {
                if (record.id) {
                    try {
                        const attachRes = await fetch(`/api/records/${record.id}/attachments?year=${selectedYear}`)
                        if (attachRes.ok) {
                            const attachData = await attachRes.json()
                            if (attachData && attachData.length > 0) {
                                attachmentsMap[record.id] = attachData
                            }
                        }
                    } catch (err) {
                        console.error(`Error loading attachments for record ${record.id}:`, err)
                    }
                }
            }
            setAttachments(attachmentsMap)

        } catch (err) {
            console.error('Error fetching chapter data:', err)
        } finally {
            setLoading(false)
        }
    }

    // ===== MODAL FUNCTIONS =====

    const openOnomastikoModal = (onomastiko: any) => {
        if (onomastiko.isPlaceholder || onomastiko.isEmpty) return
        setEditingOnomastiko(onomastiko)
        setOnomastikoName(onomastiko.name || '')
        setOnomastikoNumber(onomastiko.number || '')
        setOnomastikoPage(onomastiko.page || '')
        setOnomastikoInfos(onomastiko.infos || '')
        setOnomastikoHighlighted(onomastiko.highlighted || false)
        setShowOnomastikoModal(true)
    }

    const closeOnomastikoModal = () => {
        setShowOnomastikoModal(false)
        setEditingOnomastiko(null)
        setOnomastikoName('')
        setOnomastikoNumber('')
        setOnomastikoPage('')
        setOnomastikoInfos('')
        setOnomastikoHighlighted(false)
    }

    const saveOnomastikoEdit = async () => {
        if (!editingOnomastiko) return
        try {
            const updatedData = {
                name: onomastikoName,
                number: onomastikoNumber,
                page: onomastikoPage || null,
                infos: onomastikoInfos || null,
                highlighted: onomastikoHighlighted
            }
            const response = await fetch(`/api/onomastika/${editingOnomastiko.id}?year=${selectedYear}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            })
            if (response.ok) {
                alert('Το ονομαστικό ενημερώθηκε επιτυχώς')
                closeOnomastikoModal()
                fetchChapterData()
            } else {
                alert('Σφάλμα κατά την ενημέρωση')
            }
        } catch (error) {
            console.error(error)
            alert('Σφάλμα κατά την ενημέρωση')
        }
    }

    const deleteOnomastiko = async () => {
        if (!editingOnomastiko) return
        if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το ονομαστικό "${editingOnomastiko.name}";`)) return
        try {
            const response = await fetch(`/api/onomastika/${editingOnomastiko.id}?year=${selectedYear}`, { method: 'DELETE' })
            if (response.ok) {
                alert('Το ονομαστικό διαγράφηκε επιτυχώς')
                closeOnomastikoModal()
                fetchChapterData()
            } else {
                alert('Σφάλμα κατά τη διαγραφή')
            }
        } catch (error) {
            console.error(error)
            alert('Σφάλμα κατά τη διαγραφή')
        }
    }

    const openEditRecordModal = async (row: any, idx: number) => {
        if (!row.id) return
        const recordId = row.id
        setEditingRecord(row)
        setEditingRowIndex(idx)
        setEditMonth(row.month || numberValues[`${recordId}_month`] || '')
        setEditDay(row.day?.toString() || numberValues[`${recordId}_day`] || '')
        setEditDescription(row.description || numberValues[`${recordId}_description`] || '')
        setEditAa(row.aa?.toString() || numberValues[`${recordId}_aa`] || '')

        const entriesArray = allChapterOnomastika.map((o: any) => ({
            onomastikoId: o.id,
            name: o.name,
            number: o.number,
            debit: getValue(row.id, `${o.id}_debit`) || '',
            credit: getValue(row.id, `${o.id}_credit`) || ''
        }))
        setEditEntries(entriesArray)
        setShowEditRecordModal(true)
    }





    // Στο dashboard/page.tsx, άλλαξε το saveEditedRecord

    const saveEditedRecord = async (data: { aa: string; month: string; day: string; description: string; entries: any[] }) => {
        if (!editingRecord || editingRowIndex === null) return

        // ✅ Χρησιμοποίησε τα δεδομένα από το modal αντί για τα state
        const { aa, month, day, description, entries: updatedEntries } = data

        try {
            const recordId = editingRecord.id
            const updatedValues = { ...numberValues }
            const newRows = [...rows]
            const rowIndex = newRows.findIndex(r => r.id === recordId)

            updatedValues[`${recordId}_aa`] = aa
            updatedValues[`${recordId}_day`] = day
            updatedValues[`${recordId}_month`] = month
            updatedValues[`${recordId}_description`] = description

            updatedEntries.forEach(entry => {
                const debitKey = `${recordId}_${entry.onomastikoId}_debit`
                const creditKey = `${recordId}_${entry.onomastikoId}_credit`

                updatedValues[debitKey] = entry.debit || ''
                updatedValues[creditKey] = entry.credit || ''
            })

            setNumberValues(updatedValues)

            if (rowIndex !== -1) {
                newRows[rowIndex] = {
                    ...newRows[rowIndex],
                    aa: aa,
                    month: month,
                    day: parseInt(day) || 1,
                    description: description
                }
                setRows(newRows)
            }

            setShowEditRecordModal(false)
            setEditingRecord(null)
            setEditingRowIndex(null)
            alert('Οι αλλαγές αποθηκεύτηκαν!')
        } catch (error) {
            console.error('Error updating record:', error)
            alert('Σφάλμα κατά την ενημέρωση')
        }
    }




    const enableRow = (rowIndex: number) => {
        const nextAA = rows.reduce((max, row) => {
            const aa = parseInt(row.aa as string) || 0
            return aa > max ? aa : max
        }, 0) + 1

        const currentMonth = months[new Date().getMonth()]
        const tempId = -Date.now()
        const newRows = [...rows]
        newRows.push({
            id: tempId,
            aa: nextAA,
            month: currentMonth,
            day: 1,
            description: ''
        })
        setRows(newRows)
        const newVals = { ...numberValues }
        newVals[`${tempId}_aa`] = nextAA.toString()
        newVals[`${tempId}_day`] = '1'
        setNumberValues(newVals)
        setSelectedRowIndex(rows.length)
    }

    const handleDeleteRow = async (rowId: number) => {
        if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη γραμμή;')) return
        const row = rows[rowId]
        const recordId = row?.id
        if (recordId && recordId > 0) {
            try {
                setSaving(true)
                const response = await fetch(`/api/records/${recordId}?year=${selectedYear}`, { method: 'DELETE' })
                if (!response.ok) throw new Error('Delete failed')
                setAttachments(prev => {
                    const newAttachments = { ...prev }
                    delete newAttachments[recordId]
                    return newAttachments
                })
            } catch (error) {
                console.error('Error deleting record:', error)
                alert('Σφάλμα κατά τη διαγραφή')
                setSaving(false)
                return
            }
        }

        const newRows = rows.filter((_, i) => i !== rowId)
        setRows(newRows)
        if (selectedRowIndex === rowId) setSelectedRowIndex(null)
        else if (selectedRowIndex !== null && selectedRowIndex > rowId) setSelectedRowIndex(selectedRowIndex - 1)

        setSaving(false)
        alert('Η εγγραφή διαγράφηκε επιτυχώς!')
        await fetchChapterData()
    }

    const handleEdit = (rowId: number) => {
        const row = rows[rowId]
        if (row && row.id) openEditRecordModal(row, rowId)
    }

    // ===== ATTACHMENT FUNCTIONS =====

    const loadAttachments = async (recordId: number) => {
        try {
            const response = await fetch(`/api/records/${recordId}/attachments?year=${selectedYear}`)
            if (response.ok) {
                const attachmentsData = await response.json()
                setAttachments(prev => ({
                    ...prev,
                    [recordId]: attachmentsData
                }))
            }
        } catch (error) {
            console.error('Error loading attachments:', error)
        }
    }

    const handleBrowseFile = async (rowId: number) => {
        if (isYearLocked) {
            alert('Το έτος είναι κλειδωμένο. Δεν επιτρέπονται αλλαγές.')
            return
        }

        const row = rows[rowId]
        const recordId = row?.id

        if (!recordId) {
            alert('Πρέπει πρώτα να αποθηκεύσετε την εγγραφή για να προσθέσετε αρχεία')
            return
        }

        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx'

        input.onchange = async (e: any) => {
            const file = e.target.files?.[0]
            if (!file) return

            const MAX_FILE_SIZE = 50 * 1024 * 1024
            if (file.size > MAX_FILE_SIZE) {
                alert(`Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
                return
            }

            const formData = new FormData()
            formData.append('file', file)

            try {
                const response = await fetch(`/api/records/${recordId}/attachments?year=${selectedYear}`, {
                    method: 'POST',
                    body: formData
                })

                if (response.ok) {
                    alert('Το αρχείο μεταφορτώθηκε επιτυχώς!')
                    await loadAttachments(recordId)
                } else {
                    const error = await response.json()
                    alert('Σφάλμα μεταφόρτωσης: ' + (error.error || ''))
                }
            } catch (error) {
                console.error('Upload error:', error)
                alert('Σφάλμα κατά τη μεταφόρτωση')
            }
        }

        input.click()
    }

    const handleViewFile = (attachment: any) => {
        if (!attachment || !attachment.id) {
            alert('Δεν είναι δυνατή η προβολή του αρχείου')
            return
        }

        setPreviewFile({
            id: attachment.id,
            filename: attachment.filename || 'Αρχείο',
            url: `/api/attachments/${attachment.id}?year=${selectedYear}`,
            mimeType: attachment.mimeType || 'application/octet-stream'
        })
    }

    const handleDeleteFile = async (recordId: number, attachmentId: number, e: React.MouseEvent) => {
        e.stopPropagation()

        if (isYearLocked) {
            alert('Το έτος είναι κλειδωμένο. Δεν επιτρέπονται αλλαγές.')
            return
        }

        if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το αρχείο;')) {
            return
        }

        try {
            const response = await fetch(`/api/attachments/${attachmentId}?year=${selectedYear}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                alert('Το αρχείο διαγράφηκε επιτυχώς')
                await loadAttachments(recordId)
            } else {
                const error = await response.json()
                alert('Σφάλμα διαγραφής: ' + (error.error || ''))
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Σφάλμα κατά τη διαγραφή')
        }
    }

    const handleScan = async (rowId: number) => {
        if (isYearLocked) {
            alert('Το έτος είναι κλειδωμένο. Δεν επιτρέπονται αλλαγές.')
            return
        }

        const row = rows[rowId]
        const recordId = row?.id

        if (!recordId) {
            alert('Πρέπει πρώτα να αποθηκεύσετε την εγγραφή')
            return
        }

        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pdf,.jpg,.jpeg,.png,.gif'
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0]
            if (!file) return

            const MAX_FILE_SIZE = 50 * 1024 * 1024
            if (file.size > MAX_FILE_SIZE) {
                alert(`Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
                return
            }

            const formData = new FormData()
            formData.append('file', file)

            try {
                const response = await fetch(`/api/records/${recordId}/attachments?year=${selectedYear}`, {
                    method: 'POST',
                    body: formData
                })

                if (response.ok) {
                    alert('Το αρχείο σαρώθηκε και μεταφορτώθηκε επιτυχώς!')
                    await loadAttachments(recordId)
                } else {
                    alert('Σφάλμα κατά τη σάρωση')
                }
            } catch (error) {
                console.error('Scan error:', error)
                alert('Σφάλμα κατά τη σάρωση')
            }
        }
        input.click()
    }

    // ===== SAVE FUNCTION =====
    const handleSave = async () => {
        if (isYearLocked) {
            alert('Το έτος είναι κλειδωμένο. Δεν επιτρέπονται αλλαγές.')
            return
        }

        setSaving(true)
        try {
            const realOnomastika = allChapterOnomastika.filter((o: any) => !o.isPlaceholder && !o.isEmpty)
            const recordsToSave: any[] = []

            for (let idx = 0; idx < rows.length; idx++) {
                const row = rows[idx]
                if (!row.id) continue

                let hasData = false

                if ((row.aa && row.aa.toString().trim() !== '') ||
                    (row.month && row.month.trim() !== '') ||
                    (row.day && row.day.toString().trim() !== '') ||
                    (row.description && row.description.trim() !== '')) {
                    hasData = true
                }

                if (!hasData) {
                    for (const o of realOnomastika) {
                        const debit = numberValues[`${row.id}_${o.id}_debit`]
                        const credit = numberValues[`${row.id}_${o.id}_credit`]
                        if ((debit && debit.toString().trim() !== '') || (credit && credit.toString().trim() !== '')) {
                            hasData = true
                            break
                        }
                    }
                }

                if (!hasData) continue

                let aaValue = numberValues[`${row.id}_aa`] || row.aa
                let dayValue = numberValues[`${row.id}_day`] || row.day
                let parsedDay = parseInt(dayValue)
                if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) parsedDay = 1
                let descriptionValue = numberValues[`${row.id}_description`] || row.description || ' '
                let monthValue = numberValues[`${row.id}_month`] || row.month || months[0]

                const cells = realOnomastika.map((o: any) => ({
                    onomastikoId: o.id,
                    debit: numberValues[`${row.id}_${o.id}_debit`] || '',
                    credit: numberValues[`${row.id}_${o.id}_credit`] || ''
                }))

                if (row.id > 0) {
                    recordsToSave.push({
                        id: row.id,
                        aa: parseInt(aaValue) || idx + 1,
                        month: monthValue,
                        day: parsedDay,
                        description: descriptionValue,
                        cells: cells
                    })
                } else {
                    recordsToSave.push({
                        aa: parseInt(aaValue) || idx + 1,
                        month: monthValue,
                        day: parsedDay,
                        description: descriptionValue,
                        cells: cells
                    })
                }
            }

            if (recordsToSave.length === 0) {
                alert('Δεν υπάρχουν δεδομένα προς αποθήκευση')
                setSaving(false)
                return
            }

            const url = `/api/form2/chapter/${selectedChapterId}/records?year=${selectedYear}`
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ records: recordsToSave })
            })

            if (res.ok) {
                alert(`Αποθηκεύτηκαν ${recordsToSave.length} εγγραφές!`)
                await fetchChapterData()
                await fetchAllChapterOnomastika()
            } else {
                const errorData = await res.json()
                alert('Σφάλμα αποθήκευσης: ' + (errorData.error || ''))
            }
        } catch (err) {
            console.error('Save error:', err)
            alert('Σφάλμα κατά την αποθήκευση')
        } finally {
            setSaving(false)
        }
    }

    // ===== PRINT PREVIEW =====
    const openPrintPreview = () => {
        alert('Η λειτουργία εκτύπωσης θα προστεθεί σύντομα')
    }

    // Event Handlers
    const handleYearChange = (newYear: number) => {
        if (newYear === selectedYear) return
        setSelectedChapterId(null)
        setSelectedPage(null)
        setCurrentChapterPages([])
        setRows([])
        setNumberValues({})
        setAttachments({})
        setOnomastika([])
        setAllChapterOnomastika([])
        setPreviousYearBalances({})
        setChapterName('')
        setChapterDescription('')
        setSelectedYear(newYear)
        localStorage.setItem('mainForm2_selectedYear', newYear.toString())
    }

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }

    // Effects
    useEffect(() => {
        fetchChapters()
    }, [selectedYear])

    useEffect(() => {
        if (selectedChapterId) {
            fetchChapterPages()
            fetchChapterData()
            fetchAllChapterOnomastika()
        }
    }, [selectedChapterId, selectedYear])

    useEffect(() => {
        localStorage.setItem('mainForm2_selectedYear', selectedYear.toString())
    }, [selectedYear])

    useEffect(() => {
        if (selectedChapterId) {
            localStorage.setItem('mainForm2_selectedChapterId', selectedChapterId.toString())
        }
    }, [selectedChapterId])

    useEffect(() => {
        if (selectedPage) {
            localStorage.setItem('mainForm2_selectedPage', selectedPage.toString())
        }
    }, [selectedPage])

    useEffect(() => {
        localStorage.setItem('mainForm2_sidebarOpen', sidebarOpen.toString())
    }, [sidebarOpen])

    useEffect(() => {
        localStorage.setItem('mainForm2_sidebarWidth', sidebarWidth.toString())
    }, [sidebarWidth])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
                setSelectedRowIndex(null)
                setSelectedColumnId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (loading) {
        return <div className="h-full flex items-center justify-center">Loading...</div>
    }

    const hasOnomastika = displayOnomastika.some((o: any) => !o.isPlaceholder && !o.isEmpty)

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar
                sidebarOpen={sidebarOpen}
                sidebarWidth={sidebarWidth}
                setSidebarOpen={setSidebarOpen}
                selectedYear={selectedYear}
                handleYearChange={handleYearChange}
                chapters={chapters}
                selectedChapterId={selectedChapterId}
                setSelectedChapterId={setSelectedChapterId}
                setSelectedPage={setSelectedPage}
                setCurrentChapterPages={setCurrentChapterPages}
                darkMode={darkMode}
            />

            {sidebarOpen && (
                <div className="relative w-1 cursor-ew-resize" onMouseDown={startResizing}>
                    <div className={`absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-12 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors`} />
                </div>
            )}

            {/* ===== MAIN CONTENT ===== */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

                {/* ✅ LOCK BANNER */}
                {isYearLocked && (
                    <div className="flex-shrink-0 bg-red-600 text-white px-4 py-2.5 text-center font-medium flex items-center justify-center gap-3 shadow-lg">
                        <span className="text-xl">🔒</span>
                        <span>Το έτος {selectedYear} είναι <strong>ΚΛΕΙΔΩΜΕΝΟ</strong>. Για να κάνετε αλλαγές, ξεκλειδώστε το από τις <strong>Ρυθμίσεις → Εργασίες Έτους → Κλείσιμο Έτους</strong>.</span>
                    </div>
                )}

                {/* ===== HEADER - fixed ===== */}
                <div style={{ flexShrink: 0 }}>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b py-2 px-4 flex flex-col gap-1.5`}>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                {!sidebarOpen && (
                                    <button onClick={() => setSidebarOpen(true)} className={`p-1.5 rounded-md border ${darkMode ? 'hover:bg-gray-700 border-gray-600' : 'hover:bg-gray-100 border-gray-200'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                )}
                                {currentChapterPages.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pages:</span>
                                        {currentChapterPages.map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setSelectedPage(page)}
                                                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${selectedPage === page ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={openPrintPreview}
                                    className={`px-3.5 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                >
                                    <span>🖨️</span> Εκτύπωση
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || isYearLocked}
                                    className={`px-3.5 py-1 rounded-md text-sm font-medium text-white transition-colors ${saving || isYearLocked
                                            ? 'opacity-50 cursor-not-allowed bg-gray-500'
                                            : darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    title={isYearLocked ? 'Το έτος είναι κλειδωμένο' : ''}
                                >
                                    {saving ? 'Αποθήκευση...' : isYearLocked ? '🔒 Κλειδωμένο' : 'Αποθήκευση'}
                                </button>
                                <button
                                    onClick={() => setShowSettingsModal(true)}
                                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100'}`}
                                    title="Ρυθμίσεις"
                                >
                                    ⚙️
                                </button>
                            </div>
                        </div>
                        {chapterName && (
                            <div className="flex items-center">
                                <h2 className={`text-sm font-bold tracking-wide border-l-2 border-blue-500 pl-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                    {chapterName}{selectedPage && <span className={`ml-2 text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>• Page {selectedPage}</span>}
                                </h2>
                                {isYearLocked && (
                                    <span className="ml-3 text-xs font-bold text-red-500 dark:text-red-400">🔒</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== TABLE CONTAINER - ONLY THIS SCROLLS ===== */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '16px',
                    backgroundColor: darkMode ? '#111827' : '#f1f5f9',
                    position: 'relative'
                }}
                    className={darkMode ? 'dark-scrollbar' : 'light-scrollbar'}
                >
                    <table ref={tableRef} className={`border-collapse ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl min-w-max mx-auto text-center`}>

                        {/* ===== STICKY HEADER ===== */}
                        <thead style={{
                            position: frozenHeader ? 'sticky' : 'static',
                            top: frozenHeader ? 0 : 'auto',
                            zIndex: frozenHeader ? 50 : 'auto',
                            backgroundColor: darkMode ? '#1f2937' : '#f1f5f9'
                        }}>
                            <TableHeader
                                chapterName={chapterName}
                                chapterDescription={chapterDescription}
                                displayOnomastika={displayOnomastika}
                                openOnomastikoModal={openOnomastikoModal}
                                darkMode={darkMode}
                                stickyHeaderBg={stickyHeaderBg}
                            />

                            {/* ===== Υπόλοιπο από προηγούμενο έτος ===== */}
                            <tr className={`${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'} border-t-2 border-blue-400`}>
                                <td className="border-2 p-2 text-center align-middle" colSpan={2}></td>
                                <td colSpan={4} className={`border-2 p-2 sticky left-0 z-40 ${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'} text-right font-bold`} style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)' }}>
                                    Υπόλοιπο από προηγούμενο έτος ({selectedYear - 1}):
                                </td>
                                {displayOnomastika.map((o, idx) => {
                                    const isReal = !o.isPlaceholder && !o.isEmpty
                                    const prev = previousYearBalances[o.id] || { debit: 0, credit: 0 }
                                    const debitVal = prev.debit || 0
                                    const creditVal = prev.credit || 0
                                    return (
                                        <React.Fragment key={`prev-${o.id}`}>
                                            <td className={`border-2 p-2 text-center font-semibold ${idx === 6 ? 'border-l-4 border-l-gray-500' : ''}`}>
                                                {isReal ? (
                                                    <span className={debitVal > 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-gray-500' : 'text-gray-400')}>
                                                        {debitVal > 0 ? Math.floor(debitVal).toString() : '0'}
                                                    </span>
                                                ) : (
                                                    <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>0</span>
                                                )}
                                            </td>
                                            <td className="border-2 p-2 text-center font-semibold">
                                                {isReal ? (
                                                    <span className={creditVal > 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-gray-500' : 'text-gray-400')}>
                                                        {creditVal > 0 ? Math.floor(creditVal).toString() : '0'}
                                                    </span>
                                                ) : (
                                                    <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>0</span>
                                                )}
                                            </td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        </thead>

                        {/* ===== SCROLLABLE BODY ===== */}
                        <tbody>
                            {(() => {
                                if (!hasOnomastika) {
                                    return Array.from({ length: 40 }, (_, idx) => {
                                        const emptyRow = {
                                            id: null,
                                            aa: '',
                                            month: '',
                                            day: '',
                                            description: '',
                                            tempId: `empty_no_onomastika_${idx}`
                                        }
                                        return (
                                            <TableRow
                                                key={emptyRow.tempId}
                                                row={emptyRow}
                                                idx={idx}
                                                isSelected={false}
                                                rowHasData={false}
                                                isFirstEmptyRow={false}
                                                isColumnSelected={isColumnSelected}
                                                getValue={getValue}
                                                setNumberValues={setNumberValues}
                                                setRows={setRows}
                                                setSelectedRowIndex={setSelectedRowIndex}
                                                setSelectedColumnId={setSelectedColumnId}
                                                enableRow={enableRow}
                                                handleDeleteRow={handleDeleteRow}
                                                handleEdit={handleEdit}
                                                handleBrowseFile={handleBrowseFile}
                                                handleScan={handleScan}
                                                handleViewFile={handleViewFile}
                                                handleDeleteFile={handleDeleteFile}
                                                getRowFiles={getRowFiles}
                                                displayOnomastika={displayOnomastika}
                                                darkMode={darkMode}
                                                stickyDataBg={stickyBg}
                                                stickyBg={stickyBg}
                                                numberValues={numberValues}
                                                rows={rows}
                                                isNoOnomastikaPage={true}
                                                frozenColumns={frozenColumns}
                                                isYearLocked={isYearLocked}
                                                onOpenBatchEntry={() => setShowBatchEntry(true)}
                                            />
                                        )
                                    })
                                }

                                const recordsWithData = rows.filter((row: any) => row.id)
                                const emptyRowsNeeded = Math.max(0, 40 - recordsWithData.length)
                                const emptyRows = Array(emptyRowsNeeded).fill(null).map((_, idx) => ({
                                    id: null,
                                    aa: '',
                                    month: '',
                                    day: '',
                                    description: '',
                                    tempId: `empty_${idx}`
                                }))
                                const allDisplayRows = [...recordsWithData, ...emptyRows]

                                return allDisplayRows.map((row: any, displayIdx: number) => {
                                    const originalIdx = rows.findIndex((r: any) => r.id === row.id)
                                    const idx = originalIdx !== -1 ? originalIdx : displayIdx
                                    const rowHasData = row.id && (() => {
                                        if (!row.id) return false
                                        const hasDirectData = (row.aa && row.aa.toString().trim() !== '') ||
                                            (row.month && row.month.trim() !== '') ||
                                            (row.day && row.day.toString().trim() !== '') ||
                                            (row.description && row.description.trim() !== '')
                                        if (hasDirectData) return true
                                        const realOnomastika = displayOnomastika.filter((o: any) => !o.isPlaceholder && !o.isEmpty)
                                        return realOnomastika.some((o: any) => {
                                            const debit = numberValues[`${row.id}_${o.id}_debit`]
                                            const credit = numberValues[`${row.id}_${o.id}_credit`]
                                            return (debit && debit.toString().trim() !== '') || (credit && credit.toString().trim() !== '')
                                        })
                                    })()
                                    const isFirstEmptyRow = !row.id && displayIdx >= recordsWithData.length

                                    return (
                                        <TableRow
                                            key={row.id || row.tempId || displayIdx}
                                            row={row}
                                            idx={idx}
                                            isSelected={selectedRowIndex === idx}
                                            rowHasData={rowHasData}
                                            isFirstEmptyRow={isFirstEmptyRow}
                                            isColumnSelected={isColumnSelected}
                                            getValue={getValue}
                                            setNumberValues={setNumberValues}
                                            setRows={setRows}
                                            setSelectedRowIndex={setSelectedRowIndex}
                                            setSelectedColumnId={setSelectedColumnId}
                                            enableRow={enableRow}
                                            handleDeleteRow={handleDeleteRow}
                                            handleEdit={handleEdit}
                                            handleBrowseFile={handleBrowseFile}
                                            handleScan={handleScan}
                                            handleViewFile={handleViewFile}
                                            handleDeleteFile={handleDeleteFile}
                                            getRowFiles={getRowFiles}
                                            displayOnomastika={displayOnomastika}
                                            darkMode={darkMode}
                                            stickyDataBg={selectedRowIndex === idx ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : stickyBg}
                                            stickyBg={stickyBg}
                                            numberValues={numberValues}
                                            rows={rows}
                                            frozenColumns={frozenColumns}
                                            isNoOnomastikaPage={false}
                                            isYearLocked={isYearLocked}
                                        />
                                    )
                                })
                            })()}
                        </tbody>

                        {/* ===== STICKY FOOTER - Σύνολα ===== */}
                        <tfoot style={{
                            position: frozenFooter ? 'sticky' : 'static',
                            bottom: frozenFooter ? 0 : 'auto',
                            zIndex: frozenFooter ? 40 : 'auto',
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff'
                        }}>
                            {/* Σύνολα Κίνησης */}
                            <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} font-bold`}>
                                <td className="border-2 p-2" colSpan={2}></td>
                                <td colSpan={4} className={`border-2 p-2 sticky left-0 z-40 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} text-right`} style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)' }}>
                                    Σύνολα Κίνησης ({selectedYear}):
                                </td>
                                {displayOnomastika.map((o, idx) => {
                                    const isReal = !o.isPlaceholder && !o.isEmpty
                                    const debit = debitTotals?.[o.id] || 0
                                    const credit = creditTotals?.[o.id] || 0
                                    return (
                                        <React.Fragment key={`totals-${o.id}`}>
                                            <td className={`border-2 p-2 text-center ${idx === 6 ? 'border-l-4 border-l-gray-500' : ''}`}>
                                                {isReal ? (debit > 0 ? Math.floor(debit).toString() : '0') : '-'}
                                            </td>
                                            <td className="border-2 p-2 text-center">
                                                {isReal ? (credit > 0 ? Math.floor(credit).toString() : '0') : '-'}
                                            </td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>

                            {/* Υπόλοιπο για μεταφορά */}
                            <tr className={`${darkMode ? 'bg-blue-900/60' : 'bg-blue-200'} font-bold border-t-2 border-blue-500`}>
                                <td className="border-2 p-2" colSpan={2}></td>
                                <td colSpan={4} className={`border-2 p-2 sticky left-0 z-40 ${darkMode ? 'bg-blue-900/60' : 'bg-blue-200'} text-right`} style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)' }}>
                                    <div className="flex flex-col">
                                        <span>Υπόλοιπο για μεταφορά</span>
                                        <span className={`text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            (Αρχικό + Χρέωση - Πίστωση)
                                        </span>
                                    </div>
                                </td>
                                {displayOnomastika.map((o, idx) => {
                                    const isReal = !o.isPlaceholder && !o.isEmpty
                                    const prevBalance = previousYearBalances[o.id] || { debit: 0, credit: 0 }
                                    const currentDebit = debitTotals?.[o.id] || 0
                                    const currentCredit = creditTotals?.[o.id] || 0
                                    const balance = (prevBalance.debit + currentDebit) - (prevBalance.credit + currentCredit)
                                    return (
                                        <React.Fragment key={`transfer-${o.id}`}>
                                            <td className={`border-2 p-2 text-center font-bold ${idx === 6 ? 'border-l-4 border-l-gray-500' : ''}`} colSpan={2}>
                                                {isReal ? (
                                                    <span className={balance >= 0 ? (darkMode ? 'text-green-400' : 'text-green-700') : (darkMode ? 'text-red-400' : 'text-red-700')}>
                                                        {Math.floor(balance).toString()}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </React.Fragment>
                                    )
                                })}
                            </tr>
                        </tfoot>
                    </table>

                    {/* ✅ LOCK OVERLAY */}
                    {isYearLocked && (
                        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 flex items-center justify-center pointer-events-none">
                            <div className="bg-red-600/95 text-white px-8 py-4 rounded-lg shadow-2xl text-xl font-bold flex items-center gap-4">
                                <span className="text-3xl">🔒</span>
                                <span>Το έτος {selectedYear} είναι κλειδωμένο</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== FOOTER - fixed ===== */}
                <div style={{ flexShrink: 0 }}>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-3 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Βιβλίο Υλικού ΔΙ.Π.Υ.Ν. Κέρκυρας | {chapterName || 'Select chapter'} {selectedPage && `| Page ${selectedPage}`}
                        {isYearLocked && <span className="ml-3 text-red-500 dark:text-red-400">🔒 Κλειδωμένο</span>}
                    </div>
                </div>

            </div>

            {/* ===== MODALS ===== */}

            <EditRecordModal
                isOpen={showEditRecordModal}
                editingRecord={editingRecord}
                editAa={editAa}
                editMonth={editMonth}
                editDay={editDay}
                editDescription={editDescription}
                editEntries={editEntries}
                allChapterOnomastika={allChapterOnomastika}
                onClose={() => {
                    setShowEditRecordModal(false)
                    setEditingRecord(null)
                    setEditingRowIndex(null)
                }}
                onSave={saveEditedRecord}  // ✅ Τώρα δέχεται data parameter
                setEditAa={setEditAa}
                setEditMonth={setEditMonth}
                setEditDay={setEditDay}
                setEditDescription={setEditDescription}
                setEditEntries={setEditEntries}
                darkMode={darkMode}
                isYearLocked={isYearLocked}
            />


            <OnomastikoModal
                isOpen={showOnomastikoModal}
                onClose={closeOnomastikoModal}
                onSave={saveOnomastikoEdit}
                onDelete={deleteOnomastiko}
                editingOnomastiko={editingOnomastiko}
                name={onomastikoName}
                setName={setOnomastikoName}
                number={onomastikoNumber}
                setNumber={setOnomastikoNumber}
                page={onomastikoPage}
                setPage={setOnomastikoPage}
                infos={onomastikoInfos}
                setInfos={setOnomastikoInfos}
                highlighted={onomastikoHighlighted}
                setHighlighted={setOnomastikoHighlighted}
                darkMode={darkMode}
                isYearLocked={isYearLocked}
            />

            {/* ===== SETTINGS MODAL ===== */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                frozenHeader={frozenHeader}
                setFrozenHeader={setFrozenHeader}
                frozenFooter={frozenFooter}
                setFrozenFooter={setFrozenFooter}
                frozenColumns={frozenColumns}
                setFrozenColumns={setFrozenColumns}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                backupPath={backupPath}
                setBackupPath={setBackupPath}
                selectedYear={selectedYear}
            />

            {/* ===== FILE PREVIEW ===== */}
            {previewFile && (
                <FilePreview
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                    darkMode={darkMode}
                />
            )}

        </div>
    )
}