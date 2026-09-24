// C:\Biblio_Ylikou_NEW\src\app\protocol\page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import SignaturesModal from '@/components/modals/SignaturesModal'

export default function ProtocolPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const yearParam = searchParams.get('year')
    const [selectedYear, setSelectedYear] = useState<number>(
        yearParam ? parseInt(yearParam) : new Date().getFullYear()
    )
    const [darkMode, setDarkMode] = useState(false)
    const [protocolData, setProtocolData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)
    const [showSignatureModal, setShowSignatureModal] = useState(false)
    const [availableYears, setAvailableYears] = useState<number[]>([])

    // ✅ Φόρτωση υπογραφών από το localStorage - ΜΟΝΟ ΣΤΟΝ CLIENT
    const [signatures, setSignatures] = useState({
        president: {
            rank: 'Πύραρχος',
            am: '10064',
            fullName: 'Κόλλας Νικόλαος',
            fatherName: 'Γεωργίου'
        },
        manager: {
            rank: 'Υποπυραγός',
            am: '13783',
            fullName: 'Μπόγδος Νεκτάριος',
            fatherName: 'Κωνσταντίνου'
        }
    })

    // ✅ Φόρτωση υπογραφών από localStorage μετά το mount
    useEffect(() => {
        const saved = localStorage.getItem('signatureConfig')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setSignatures({
                    president: parsed.president || parsed.administrator || {
                        rank: 'Πύραρχος',
                        am: '10064',
                        fullName: 'Κόλλας Νικόλαος',
                        fatherName: 'Γεωργίου'
                    },
                    manager: parsed.manager || {
                        rank: 'Υποπυραγός',
                        am: '13783',
                        fullName: 'Μπόγδος Νεκτάριος',
                        fatherName: 'Κωνσταντίνου'
                    }
                })
            } catch (e) {
                console.error('Error parsing signatures:', e)
            }
        }
    }, [])

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('app_settings_darkMode')
        if (savedDarkMode !== null) {
            const isDark = savedDarkMode === 'true'
            setDarkMode(isDark)
            if (isDark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }, [])

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await fetch('/api/years')
                const data = await res.json()
                setAvailableYears(data)
            } catch (error) {
                console.error('Error fetching years:', error)
            }
        }
        fetchYears()
    }, [])

    useEffect(() => {
        const fetchProtocolData = async () => {
            if (!selectedYear) return
            setLoading(true)
            setError(null)
            try {
                const response = await axios.get(`/api/protocol-with-balances?year=${selectedYear}`)
                console.log('📊 Protocol data:', response.data)
                setProtocolData(response.data)
            } catch (error: any) {
                console.error('Error fetching protocol:', error)
                setError(error.response?.data?.error || 'Σφάλμα φόρτωσης δεδομένων')
                setProtocolData({
                    totalChapters: 0,
                    totalOnomastika: 0,
                    chapters: []
                })
            } finally {
                setLoading(false)
            }
        }
        fetchProtocolData()
    }, [selectedYear])

    // ✅ Ενημέρωση υπογραφών όταν αλλάζουν
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('signatureConfig')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    setSignatures({
                        president: parsed.president || parsed.administrator || signatures.president,
                        manager: parsed.manager || signatures.manager
                    })
                } catch (e) {
                    console.error('Error parsing signatures:', e)
                }
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const formatNumber = (num: number) => {
        if (num === undefined || num === null || num === 0) return '0'
        if (Number.isInteger(num)) return num.toString()
        const rounded = Math.round(num * 100) / 100
        if (rounded % 1 === 0) return Math.floor(rounded).toString()
        return rounded.toFixed(2)
    }

    const handleExport = async () => {
        setExporting(true)
        try {
            const response = await fetch('/api/export-protocol', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: selectedYear,
                    signatures: {
                        president: signatures.president,
                        manager: signatures.manager
                    }
                })
            })

            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Πρωτόκολλο_${selectedYear}.xlsx`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            alert('✅ Το Πρωτόκολλο εξήχθη επιτυχώς!')
        } catch (error) {
            console.error('Error exporting:', error)
            alert('❌ Σφάλμα κατά την εξαγωγή')
        } finally {
            setExporting(false)
        }
    }

    // ✅ Δημιουργία ονομάτων για τις υπογραφές
    const getSignatureName = (fullName: string, fatherName: string) => {
        const nameParts = fullName.split(' ')
        const lastName = nameParts[0] || ''
        const firstName = nameParts.slice(1).join(' ') || ''
        const fatherInitial = fatherName ? fatherName.charAt(0).toUpperCase() + '.' : ''
        if (firstName) {
            return `${lastName} ${fatherInitial} ${firstName}`
        }
        return `${lastName} ${fatherInitial}`
    }

    const presidentSignatureName = getSignatureName(signatures.president.fullName, signatures.president.fatherName)
    const managerSignatureName = getSignatureName(signatures.manager.fullName, signatures.manager.fatherName)

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-2">⏳</div>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Φόρτωση...</p>
                </div>
            </div>
        )
    }

    const hasData = protocolData && protocolData.chapters && protocolData.chapters.length > 0
    let globalAA = 0

    // ✅ Δημιουργία του κειμένου με τις υπογραφές
    const presidentText = `${signatures.president.rank} (${signatures.president.am}) ${signatures.president.fullName} του ${signatures.president.fatherName}`
    const managerText = `${signatures.manager.rank} (${signatures.manager.am}) ${signatures.manager.fullName} του ${signatures.manager.fatherName}`

    return (
        <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            📋 Πρωτόκολλο Εισαγωγών - Εξαγωγών
                        </h1>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            {selectedYear}
                        </span>
                        {hasData && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({protocolData.totalChapters} κεφάλαια, {protocolData.totalOnomastika} ονομαστικά)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            className={`border rounded-md px-3 py-1.5 text-sm ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-800'
                                }`}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowSignatureModal(true)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${darkMode
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                                } transition-colors`}
                        >
                            ✍️ Υπογραφές
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting || !hasData}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold ${exporting || !hasData
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : darkMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                                } transition-colors`}
                        >
                            {exporting ? '⏳...' : '📊 Εξαγωγή'}
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className={`px-3 py-1.5 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                        >
                            ← Επιστροφή
                        </button>
                    </div>
                </div>

                {/* Content */}
                {error ? (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                        <div className="text-red-500 text-4xl mb-2">❌</div>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Δοκιμή ξανά
                        </button>
                    </div>
                ) : hasData ? (
                    <div className="space-y-4">
                        {/* Header Text με τίτλο και υπογραφές */}
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                            <div className="text-center">
                                <div className={`text-base font-bold underline ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    ΠΡΩΤΟΚΟΛΛΟ ΕΙΣΕΡΧΟΜΕΝΩΝ - ΕΞΕΡΧΟΜΕΝΩΝ
                                </div>
                                <div className={`text-sm font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    ΟΙΚΟΝΟΜΙΚΟΥ ΕΤΟΥΣ {selectedYear}
                                </div>
                                <div className={`text-xs mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-left leading-relaxed`}>
                                    Κέρκυρα σήμερα, την 31η Δεκεμβρίου {selectedYear}, οι υπογεγραμμένοι
                                    <br />
                                    <strong>α)</strong> {presidentText} Πρόεδρος του Οικονομικού Συμβουλίου
                                    <br />
                                    <strong>β)</strong> {managerText}, υπόλογος Διαχειριστής Υλικού της Διοίκησης Π.Υ. Νομού Κέρκυρας,
                                    <br />
                                    προέβησαν στην καταμέτρηση των υλικών στο βιβλίο υλικού ως κάτωθι:
                                </div>
                            </div>
                        </div>

                        {/* Σύνολο πάνω από τον πίνακα */}
                        <div className={`text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Σύνολο: {protocolData.totalChapters} κεφάλαια, {protocolData.totalOnomastika} ονομαστικά
                        </div>

                        {/* Table Container */}
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                            <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                                <table className="w-full border-collapse text-xs">
                                    {/* Fixed Header */}
                                    <thead className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ position: 'sticky', top: 0 }}>
                                        <tr className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                                            <th className="border p-1 text-center" style={{ width: '40px' }}>ΑΑ</th>
                                            <th className="border p-1 text-center" style={{ width: '60px' }}>Κεφάλαιο</th>
                                            <th className="border p-1 text-center" style={{ width: '35px' }}>Σελ.</th>
                                            <th className="border p-1 text-left" style={{ width: '250px' }}>Ονομαστικό</th>
                                            <th className="border p-1 text-center" style={{ width: '50px' }}>Αριθμός</th>
                                            <th className="border p-1 text-center" style={{ width: '80px' }}>Αρχικό Υπόλ.</th>
                                            <th className="border p-1 text-center" style={{ width: '70px' }}>Χρέωση</th>
                                            <th className="border p-1 text-center" style={{ width: '70px' }}>Σύνολο</th>
                                            <th className="border p-1 text-center" style={{ width: '70px' }}>Πίστωση</th>
                                            <th className="border p-1 text-center" style={{ width: '80px' }}>Υπόλοιπο</th>
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody>
                                        {protocolData.chapters.map((chapter: any, chapterIdx: number) => {
                                            const chapterOnomastika = chapter.onomastika || []

                                            return (
                                                <React.Fragment key={chapterIdx}>
                                                    {/* Chapter Header Row */}
                                                    <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                        <td colSpan={10} className={`border p-1 text-center font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                            {chapter.name} (Σελίδες: {chapter.page || '1'})
                                                        </td>
                                                    </tr>

                                                    {/* Onomastika Rows */}
                                                    {chapterOnomastika.length > 0 ? (
                                                        chapterOnomastika.map((onom: any, idx: number) => {
                                                            const initialBalance = onom.previousBalance || 0
                                                            const totalDebit = onom.totalDebit || 0
                                                            const totalCredit = onom.totalCredit || 0
                                                            const total = initialBalance + totalDebit
                                                            const balance = total - totalCredit
                                                            globalAA++

                                                            const hasMovement = totalDebit !== 0 || totalCredit !== 0
                                                            const allZero = initialBalance === 0 && totalDebit === 0 && totalCredit === 0

                                                            let rowBg = ''
                                                            if (hasMovement) {
                                                                rowBg = darkMode ? 'bg-yellow-900/40' : 'bg-yellow-100'
                                                            } else if (allZero) {
                                                                rowBg = darkMode ? 'bg-red-900/30' : 'bg-red-100'
                                                            }

                                                            return (
                                                                <tr key={idx} className={`${rowBg} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                                                                    <td className={`border p-1 text-center font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {globalAA}
                                                                    </td>
                                                                    <td className={`border p-1 text-center truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={chapter.name} style={{ maxWidth: '60px' }}>
                                                                        {chapter.name}
                                                                    </td>
                                                                    <td className={`border p-1 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {onom.page || '—'}
                                                                    </td>
                                                                    <td className={`border p-1 text-left truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={onom.name} style={{ maxWidth: '250px' }}>
                                                                        {onom.name}
                                                                    </td>
                                                                    <td className={`border p-1 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {onom.number || '—'}
                                                                    </td>
                                                                    <td className={`border p-1 text-center font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {formatNumber(initialBalance)} €
                                                                    </td>
                                                                    <td className={`border p-1 text-center font-medium ${totalDebit !== 0 ? (darkMode ? 'text-green-400' : 'text-green-700') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                                                        {formatNumber(totalDebit)} €
                                                                    </td>
                                                                    <td className={`border p-1 text-center font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {formatNumber(total)} €
                                                                    </td>
                                                                    <td className={`border p-1 text-center font-medium ${totalCredit !== 0 ? (darkMode ? 'text-red-400' : 'text-red-700') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                                                        {formatNumber(totalCredit)} €
                                                                    </td>
                                                                    <td className={`border p-1 text-center font-bold ${balance >= 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                                                                        {formatNumber(balance)} €
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={10} className={`border p-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                Δεν υπάρχουν ονομαστικά
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Signature Box με κενές γραμμές */}
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-xs">
                                {/* Πρόεδρος */}
                                <div className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                                    <div className="font-bold">Ο Πρόεδρος</div>
                                    <div className="text-[10px]">του Οικονομικού Συμβουλίου</div>
                                    <div className="h-8"></div>
                                    <div className="h-8"></div>
                                    <div className="mt-2 font-medium">{presidentSignatureName}</div>
                                    <div>{signatures.president.rank}</div>
                                </div>

                                {/* Θεωρήθηκε */}
                                <div className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                                    <div className="font-bold underline">Θεωρήθηκε</div>
                                    <div className="text-[10px]">Κέρκυρα 31/12/{selectedYear}</div>
                                    <div className="h-8"></div>
                                    <div className="h-8"></div>
                                    <div className="mt-2 font-bold">Ο Διοικητής</div>
                                    <div className="mt-1 font-medium">{presidentSignatureName}</div>
                                    <div>{signatures.president.rank}</div>
                                </div>

                                {/* Διαχειριστής Υλικού */}
                                <div className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                                    <div className="font-bold">Ο Διαχειριστής Υλικού</div>
                                    <div className="h-8"></div>
                                    <div className="h-8"></div>
                                    <div className="mt-2 font-medium">{managerSignatureName}</div>
                                    <div>{signatures.manager.rank}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                        <div className="text-4xl mb-2">📭</div>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            Δεν βρέθηκαν δεδομένα για το έτος {selectedYear}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Βεβαιωθείτε ότι υπάρχουν εγγραφές για το έτος αυτό.
                        </p>
                    </div>
                )}
            </div>

            {/* Signature Modal */}
            <SignaturesModal
                isOpen={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                darkMode={darkMode}
            />
        </div>
    )
}