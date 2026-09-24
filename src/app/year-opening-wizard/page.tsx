// C:\Biblio_Ylikou_NEW\src\app\year-opening-wizard\page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Chapter {
    id: number
    name: string
    description: string | null
    page: string | null
    year: number
    position: number
    onomastikaCount?: number
}

interface Onomastiko {
    id: number
    name: string
    number: string | null
    position: number
    page: number | null
    previousBalance: number
    previousDebit: number
    previousCredit: number
}

// Sortable Onomastiko Row Component
function SortableOnomastikoRow({
    onom,
    index,
    darkMode
}: {
    onom: Onomastiko
    index: number
    darkMode: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: onom.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex justify-between items-center p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} cursor-grab`}
        >
            <div className="flex items-center gap-3 flex-wrap">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-400'}>⋮⋮</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {index + 1}.
                </span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {onom.name}
                </span>
                {onom.page && (
                    <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        Σελ. {onom.page}
                    </span>
                )}
                {onom.number && (
                    <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        #{onom.number}
                    </span>
                )}
            </div>
            <div className={`font-medium ${onom.previousBalance > 0
                ? 'text-green-600 dark:text-green-400'
                : onom.previousBalance < 0
                    ? 'text-red-600 dark:text-red-400'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                {onom.previousBalance !== 0 ? `${onom.previousBalance.toFixed(2)} €` : '—'}
            </div>
        </div>
    )
}

export default function YearOpeningWizard() {
    const router = useRouter()
    const [sourceYear, setSourceYear] = useState<number>(2025)
    const [targetYear, setTargetYear] = useState<number>(2026)
    const [availableYears, setAvailableYears] = useState<number[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
    const [onomastika, setOnomastika] = useState<Onomastiko[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpening, setIsOpening] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // ✅ Dark mode από localStorage
    const [darkMode, setDarkMode] = useState(false)

    // ✅ Φόρτωση dark mode από localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('app_settings_darkMode')
        if (savedDarkMode !== null) {
            const isDark = savedDarkMode === 'true'
            setDarkMode(isDark)
            // Apply dark mode to document
            if (isDark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }, [])

    // ✅ Εφαρμογή dark mode όταν αλλάζει
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Fetch available years
    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await fetch('/api/years')
                const data = await res.json()
                setAvailableYears(data)
                if (data.length > 0) {
                    const maxYear = Math.max(...data)
                    setSourceYear(maxYear)
                    setTargetYear(maxYear + 1)
                }
            } catch (error) {
                console.error('Error fetching years:', error)
            }
        }
        fetchYears()
    }, [])

    // Fetch chapters for source year
    useEffect(() => {
        const fetchChapters = async () => {
            if (!sourceYear) return
            setLoading(true)
            try {
                const res = await fetch(`/api/chapters?year=${sourceYear}`)
                const data = await res.json()

                const chaptersWithCount = await Promise.all(
                    data.map(async (ch: Chapter) => {
                        const onomRes = await fetch(`/api/onomastika?chapterId=${ch.id}&year=${sourceYear}`)
                        const onomData = await onomRes.json()
                        return {
                            ...ch,
                            onomastikaCount: onomData.length || 0
                        }
                    })
                )

                setChapters(chaptersWithCount)

                if (chaptersWithCount.length > 0 && !selectedChapterId) {
                    setSelectedChapterId(chaptersWithCount[0].id)
                }
            } catch (error) {
                console.error('Error fetching chapters:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchChapters()
    }, [sourceYear])

    // Fetch onomastika when selectedChapterId changes
    useEffect(() => {
        const fetchOnomastika = async () => {
            if (!selectedChapterId || !sourceYear) return

            console.log(`🔍 Fetching onomastika for chapter ${selectedChapterId}`)
            setLoading(true)

            try {
                const onomRes = await fetch(`/api/onomastika?chapterId=${selectedChapterId}&year=${sourceYear}`)
                const onomData = await onomRes.json()
                console.log(`📊 Received ${onomData.length} onomastika`)

                let prevData = { totals: [] }
                try {
                    const prevRes = await fetch(`/api/previous-year-totals/${selectedChapterId}?year=${sourceYear}`)
                    if (prevRes.ok) {
                        prevData = await prevRes.json()
                    }
                } catch (e) {
                    console.log('No balance data available')
                }

                const mergedData = onomData.map((onom: any) => {
                    const prev = (prevData.totals || []).find((t: any) => t.onomastikoId === onom.id)
                    return {
                        ...onom,
                        previousBalance: prev?.balance || 0,
                        previousDebit: prev?.previousDebit || 0,
                        previousCredit: prev?.previousCredit || 0
                    }
                })

                setOnomastika(mergedData)
            } catch (error) {
                console.error('Error fetching onomastika:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOnomastika()
    }, [selectedChapterId, sourceYear])

    // Handle drag end for reordering onomastika
    const handleOnomastikaDragEnd = (event: any) => {
        const { active, over } = event
        if (active.id !== over.id) {
            const oldIndex = onomastika.findIndex((item) => item.id === active.id)
            const newIndex = onomastika.findIndex((item) => item.id === over.id)
            const newOnomastika = arrayMove(onomastika, oldIndex, newIndex)
            setOnomastika(newOnomastika)
        }
    }

    // Handle chapter click
    const handleChapterClick = (chapterId: number) => {
        console.log('🖱️ Chapter clicked:', chapterId)
        setSelectedChapterId(chapterId)
    }

    // Move chapter up
    const moveUp = (index: number) => {
        if (index === 0) return
        const newChapters = [...chapters]
        const temp = newChapters[index]
        newChapters[index] = newChapters[index - 1]
        newChapters[index - 1] = temp
        setChapters(newChapters)
    }

    // Move chapter down
    const moveDown = (index: number) => {
        if (index === chapters.length - 1) return
        const newChapters = [...chapters]
        const temp = newChapters[index]
        newChapters[index] = newChapters[index + 1]
        newChapters[index + 1] = temp
        setChapters(newChapters)
    }

    // Handle opening the year
    // src/app/year-opening-wizard/page.tsx
    // Find the handleOpenYear function and replace it with this:

    const handleOpenYear = async () => {
        if (!sourceYear || !targetYear) {
            setMessage({ type: 'error', text: 'Παρακαλώ επιλέξτε έτη' })
            return
        }

        // ✅ FIXED: Allow backward copying with a warning
        if (targetYear === sourceYear) {
            setMessage({ type: 'error', text: 'Το έτος-στόχος πρέπει να είναι διαφορετικό από το έτος-πηγή' })
            return
        }

        // ⚠️ Warning for backward copy (allow it with confirmation)
        if (targetYear < sourceYear) {
            if (!confirm(
                `⚠️ ΠΡΟΣΟΧΗ! Θα δημιουργήσετε το έτος ${targetYear} από το ${sourceYear}.\n\n` +
                `Αυτό είναι ΑΝΤΙΣΤΡΟΦΗ ΑΝΤΙΓΡΑΦΗ (backward copy).\n` +
                `Τα δεδομένα θα αντιγραφούν από το ${sourceYear} στο ${targetYear}.\n\n` +
                `Είστε σίγουροι ότι θέλετε να συνεχίσετε;`
            )) {
                return
            }
        }

        if (availableYears.includes(targetYear)) {
            setMessage({ type: 'error', text: `Το έτος ${targetYear} υπάρχει ήδη` })
            return
        }

        if (!confirm(`Είστε σίγουροι ότι θέλετε να ανοίξετε το έτος ${targetYear} από το ${sourceYear};`)) {
            return
        }

        setIsOpening(true)
        setMessage(null)

        try {
            const res = await fetch('/api/year-opening-wizard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceYear,
                    targetYear,
                    chapterOrder: chapters.map((ch, idx) => ({
                        id: ch.id,
                        position: idx + 1
                    }))
                })
            })

            const data = await res.json()

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `✅ Το έτος ${targetYear} ανοίχθηκε επιτυχώς! ${data.chaptersCreated} κεφάλαια, ${data.onomastikaCreated} ονομαστικά, ${data.totalsCopied || 0} υπόλοιπα.`
                })
                // Refresh available years
                const yearsRes = await fetch('/api/years')
                const yearsData = await yearsRes.json()
                setAvailableYears(yearsData)

                setTimeout(() => {
                    router.push('/dashboard')
                }, 3000)
            } else {
                setMessage({ type: 'error', text: data.error || 'Σφάλμα κατά το άνοιγμα' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: (error as Error).message || 'Σφάλμα κατά το άνοιγμα' })
        } finally {
            setIsOpening(false)
        }
    }

    const selectedChapter = chapters.find(ch => ch.id === selectedChapterId)

    return (
        <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        📅 Άνοιγμα Έτους
                    </h1>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                    >
                        ← Επιστροφή
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Year Selection */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-6`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Έτος-Πηγή
                            </label>
                            <select
                                className={`w-full border rounded-md px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                value={sourceYear}
                                onChange={(e) => setSourceYear(parseInt(e.target.value))}
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Έτος-Στόχος
                            </label>
                            <input
                                type="number"
                                className={`w-full border rounded-md px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                value={targetYear}
                                onChange={(e) => setTargetYear(parseInt(e.target.value))}
                                
                            />
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Default: {sourceYear + 1}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT: Chapters with arrow buttons */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            📑 Κεφάλαια
                            <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                (Κάντε κλικ για να δείτε τα ονομαστικά)
                            </span>
                        </h2>
                        {loading ? (
                            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Φόρτωση...</div>
                        ) : chapters.length === 0 ? (
                            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Δεν υπάρχουν κεφάλαια για το έτος {sourceYear}
                            </div>
                        ) : (
                            <div className="overflow-auto max-h-[500px]">
                                {chapters.map((chapter, index) => {
                                    const isSelected = selectedChapterId === chapter.id
                                    return (
                                        <div
                                            key={chapter.id}
                                            onClick={() => handleChapterClick(chapter.id)}
                                            className={`p-3 rounded-lg mb-2 cursor-pointer transition-all border-2 ${isSelected
                                                ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600'
                                                : darkMode
                                                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {chapter.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {chapter.onomastikaCount || 0} ονομαστικά
                                                        </span>
                                                        {chapter.page && (
                                                            <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                                                Σελ. {chapter.page}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                        {index + 1}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            moveUp(index)
                                                        }}
                                                        disabled={index === 0}
                                                        className={`text-xs px-2 py-1 rounded ${darkMode
                                                            ? 'bg-gray-600 hover:bg-gray-500 disabled:opacity-30 text-white'
                                                            : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-30 text-gray-700'
                                                            }`}
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            moveDown(index)
                                                        }}
                                                        disabled={index === chapters.length - 1}
                                                        className={`text-xs px-2 py-1 rounded ${darkMode
                                                            ? 'bg-gray-600 hover:bg-gray-500 disabled:opacity-30 text-white'
                                                            : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-30 text-gray-700'
                                                            }`}
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Onomastika with Drag & Drop */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            📋 Ονομαστικά
                            {selectedChapter && (
                                <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    - {selectedChapter.name} ({onomastika.length} ονομαστικά)
                                </span>
                            )}
                            <span className={`ml-2 text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                (Σύρετε για αλλαγή σειράς)
                            </span>
                        </h2>
                        {loading ? (
                            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Φόρτωση...</div>
                        ) : onomastika.length === 0 ? (
                            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {selectedChapter ? 'Δεν υπάρχουν ονομαστικά για αυτό το κεφάλαιο' : 'Επιλέξτε ένα κεφάλαιο'}
                            </div>
                        ) : (
                            <div className="overflow-auto max-h-[500px]">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleOnomastikaDragEnd}
                                >
                                    <SortableContext
                                        items={onomastika.map(o => o.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {onomastika.map((onom, idx) => (
                                                <SortableOnomastikoRow
                                                    key={onom.id}
                                                    onom={onom}
                                                    index={idx}
                                                    darkMode={darkMode}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleOpenYear}
                        disabled={isOpening || loading || chapters.length === 0}
                        className={`px-8 py-3 rounded-lg text-lg font-bold text-white transition-colors ${isOpening || loading || chapters.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {isOpening ? '⏳ Ανοίγοντας...' : '🚀 Άνοιγμα Έτους'}
                    </button>
                </div>
            </div>
        </div>
    )
}