// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabManagement\OnomastikaTab.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import SettingsOnomastikoModal from './SettingsOnomastikoModal'

interface OnomastikaTabProps {
    darkMode: boolean
    selectedYear: number
    onMessage: (type: 'success' | 'error', text: string) => void
}

const OnomastikaTab: React.FC<OnomastikaTabProps> = ({
    darkMode,
    selectedYear,
    onMessage
}) => {
    const [chapters, setChapters] = useState<any[]>([])
    const [onomastika, setOnomastika] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [editingOnomastiko, setEditingOnomastiko] = useState<any>(null)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [autoArrangeLoading, setAutoArrangeLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Form state
    const [onomastikoName, setOnomastikoName] = useState('')
    const [onomastikoNumber, setOnomastikoNumber] = useState('')
    const [onomastikoPage, setOnomastikoPage] = useState('')
    const [onomastikoInfos, setOnomastikoInfos] = useState('')
    const [onomastikoHighlighted, setOnomastikoHighlighted] = useState(false)

    // 🔥 Χρώματα για κάθε ομάδα των 16
    const getGroupColors = (index: number, darkMode: boolean) => {
        const groupIndex = Math.floor(index / 16)
        const colors = [
            // Light mode colors
            ['bg-blue-50', 'hover:bg-blue-100'],
            ['bg-green-50', 'hover:bg-green-100'],
            ['bg-purple-50', 'hover:bg-purple-100'],
            ['bg-orange-50', 'hover:bg-orange-100'],
            ['bg-pink-50', 'hover:bg-pink-100'],
            ['bg-teal-50', 'hover:bg-teal-100'],
            ['bg-indigo-50', 'hover:bg-indigo-100'],
            ['bg-rose-50', 'hover:bg-rose-100'],
            ['bg-amber-50', 'hover:bg-amber-100'],
            ['bg-cyan-50', 'hover:bg-cyan-100']
        ]

        const darkColors = [
            ['bg-blue-900/20', 'hover:bg-blue-900/40'],
            ['bg-green-900/20', 'hover:bg-green-900/40'],
            ['bg-purple-900/20', 'hover:bg-purple-900/40'],
            ['bg-orange-900/20', 'hover:bg-orange-900/40'],
            ['bg-pink-900/20', 'hover:bg-pink-900/40'],
            ['bg-teal-900/20', 'hover:bg-teal-900/40'],
            ['bg-indigo-900/20', 'hover:bg-indigo-900/40'],
            ['bg-rose-900/20', 'hover:bg-rose-900/40'],
            ['bg-amber-900/20', 'hover:bg-amber-900/40'],
            ['bg-cyan-900/20', 'hover:bg-cyan-900/40']
        ]

        const colorSet = darkMode ? darkColors : colors
        return colorSet[groupIndex % colorSet.length]
    }

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        fetchChapters()
    }, [selectedYear])

    useEffect(() => {
        if (selectedChapterId) {
            fetchOnomastika()
        }
    }, [selectedChapterId, selectedYear])

    const fetchChapters = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/chapters?year=${selectedYear}`)
            const sortedChapters = res.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            setChapters(sortedChapters)
            if (sortedChapters.length > 0 && !selectedChapterId) {
                setSelectedChapterId(sortedChapters[0].id)
            }
        } catch (error) {
            console.error('Error fetching chapters:', error)
            onMessage('error', 'Σφάλμα φόρτωσης κεφαλαίων')
        } finally {
            setLoading(false)
        }
    }

    const fetchOnomastika = async () => {
        if (!selectedChapterId) return
        setLoading(true)
        try {
            const res = await axios.get(`/api/onomastika?chapterId=${selectedChapterId}&year=${selectedYear}`)
            const sorted = res.data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
            setOnomastika(sorted)
        } catch (error) {
            console.error('Error fetching onomastika:', error)
            onMessage('error', 'Σφάλμα φόρτωσης ονομαστικών')
        } finally {
            setLoading(false)
        }
    }

    const openModal = (onomastiko?: any) => {
        if (onomastiko) {
            setEditingOnomastiko(onomastiko)
            setOnomastikoName(onomastiko.name || '')
            setOnomastikoNumber(onomastiko.number || '')
            setOnomastikoPage(onomastiko.page || '')
            setOnomastikoInfos(onomastiko.infos || '')
            setOnomastikoHighlighted(onomastiko.highlighted || false)
        } else {
            setEditingOnomastiko(null)
            setOnomastikoName('')
            setOnomastikoNumber('')
            setOnomastikoPage('')
            setOnomastikoInfos('')
            setOnomastikoHighlighted(false)
        }
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingOnomastiko(null)
    }

    const handleSave = async () => {
        if (!selectedChapterId) {
            onMessage('error', 'Παρακαλώ επιλέξτε ένα κεφάλαιο πρώτα')
            return
        }

        try {
            const dataToSave = {
                name: onomastikoName,
                number: onomastikoNumber || null,
                page: onomastikoPage ? parseInt(onomastikoPage) : null,
                infos: onomastikoInfos || null,
                highlighted: onomastikoHighlighted,
                chapterId: selectedChapterId,
                position: onomastika.length
            }

            if (editingOnomastiko) {
                await axios.put(`/api/onomastika/${editingOnomastiko.id}?year=${selectedYear}`, dataToSave)
                onMessage('success', 'Το ονομαστικό ενημερώθηκε επιτυχώς!')
            } else {
                await axios.post(`/api/onomastika?year=${selectedYear}`, dataToSave)
                onMessage('success', 'Το ονομαστικό δημιουργήθηκε επιτυχώς!')
            }

            closeModal()
            fetchOnomastika()
        } catch (error) {
            console.error('Error saving onomastiko:', error)
            onMessage('error', 'Σφάλμα αποθήκευσης: ' + (error.response?.data?.error || error.message))
        }
    }

    const handleDelete = async () => {
        if (!editingOnomastiko) return
        if (!window.confirm('Θέλετε να διαγράψετε αυτό το ονομαστικό;')) return

        try {
            await axios.delete(`/api/onomastika/${editingOnomastiko.id}?year=${selectedYear}`)
            onMessage('success', 'Το ονομαστικό διαγράφηκε επιτυχώς!')
            closeModal()
            fetchOnomastika()
        } catch (error) {
            console.error('Error deleting onomastiko:', error)
            onMessage('error', 'Σφάλμα διαγραφής')
        }
    }

    const handleAutoArrange = async () => {
        if (!selectedChapterId) return

        setAutoArrangeLoading(true)
        try {
            const res = await axios.get(`/api/onomastika?chapterId=${selectedChapterId}&year=${selectedYear}`)
            const allOnomastika = res.data

            const chapter = chapters.find(c => c.id === selectedChapterId)
            if (!chapter || !chapter.page) {
                onMessage('error', 'Το κεφάλαιο δεν έχει σελίδες')
                setAutoArrangeLoading(false)
                return
            }

            const chapterPages = chapter.page
                .split(',')
                .map((p: string) => parseInt(p.trim()))
                .filter((p: number) => !isNaN(p))

            console.log('📊 Chapter pages:', chapterPages)

            if (chapterPages.length === 0) {
                onMessage('error', 'Δεν βρέθηκαν έγκυρες σελίδες στο κεφάλαιο')
                setAutoArrangeLoading(false)
                return
            }

            const sorted = [...allOnomastika].sort((a, b) => {
                if (a.page && b.page) return a.page - b.page
                if (a.page) return -1
                if (b.page) return 1
                return (a.position || 0) - (b.position || 0)
            })

            const itemsPerPage = 16
            const updates = sorted.map((o: any, index: number) => {
                const pageIndex = Math.floor(index / itemsPerPage)
                const pageNum = pageIndex < chapterPages.length
                    ? chapterPages[pageIndex]
                    : chapterPages[chapterPages.length - 1]

                console.log(`📊 ${o.name} -> Σελίδα ${pageNum} (index: ${index}, pageIndex: ${pageIndex})`)

                return axios.put(`/api/onomastika/${o.id}?year=${selectedYear}`, {
                    ...o,
                    page: pageNum,
                    position: index
                })
            })

            await Promise.all(updates)

            onMessage('success', `✅ Τα ονομαστικά ταξινομήθηκαν στις σελίδες: ${chapterPages.join(', ')} (${itemsPerPage} ανά σελίδα)`)
            fetchOnomastika()
        } catch (error) {
            console.error('Error auto-arranging onomastika:', error)
            onMessage('error', 'Σφάλμα κατά την αυτόματη ταξινόμηση')
        } finally {
            setAutoArrangeLoading(false)
        }
    }

    // ===== DRAG AND DROP FUNCTIONS =====
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        const target = e.target as HTMLElement
        target.style.opacity = '0.5'
        target.style.transform = 'scale(0.95)'
    }

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement
        target.style.opacity = '1'
        target.style.transform = 'scale(1)'
        setDraggedIndex(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        const target = e.target as HTMLElement
        const dropTarget = target.closest('.onomastiko-item')
        if (dropTarget) {
            dropTarget.style.borderColor = '#3b82f6'
            dropTarget.style.borderStyle = 'dashed'
            dropTarget.style.borderWidth = '2px'
        }
    }

    const handleDragLeave = (e: React.DragEvent) => {
        const target = e.target as HTMLElement
        const dropTarget = target.closest('.onomastiko-item')
        if (dropTarget) {
            dropTarget.style.borderColor = 'transparent'
            dropTarget.style.borderStyle = 'solid'
            dropTarget.style.borderWidth = '1px'
        }
    }

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()

        const target = e.target as HTMLElement
        const dropTarget = target.closest('.onomastiko-item')
        if (dropTarget) {
            dropTarget.style.borderColor = 'transparent'
            dropTarget.style.borderStyle = 'solid'
            dropTarget.style.borderWidth = '1px'
        }

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            return
        }

        const newOnomastika = [...onomastika]
        const [draggedItem] = newOnomastika.splice(draggedIndex, 1)
        newOnomastika.splice(dropIndex, 0, draggedItem)

        setOnomastika(newOnomastika)
        setDraggedIndex(null)

        try {
            const updates = newOnomastika.map((o, index) => ({
                id: o.id,
                position: index
            }))

            await axios.post(`/api/onomastika/reorder?year=${selectedYear}`, {
                items: updates,
                chapterId: selectedChapterId
            })

            onMessage('success', 'Η σειρά των ονομαστικών ενημερώθηκε!')
        } catch (error) {
            console.error('Error reordering onomastika:', error)
            onMessage('error', 'Σφάλμα κατά την αναδιάταξη')
            fetchOnomastika()
        }
    }

    const getChapterPages = () => {
        const chapter = chapters.find(c => c.id === selectedChapterId)
        if (!chapter || !chapter.page) return []
        return chapter.page.split(',').map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p))
    }

    return (
        <div className="space-y-4">
            {/* Chapter Selector */}
            <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Επιλέξτε Κεφάλαιο
                </label>
                <select
                    value={selectedChapterId || ''}
                    onChange={(e) => setSelectedChapterId(parseInt(e.target.value))}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                >
                    <option value="">Επιλέξτε κεφάλαιο...</option>
                    {chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                </select>
            </div>

            {selectedChapterId ? (
                <>
                    {/* Header with actions */}
                    <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            📝 Ονομαστικά ({onomastika.length})
                        </h4>
                        <div className="flex gap-2">
                            {onomastika.length > 0 && (
                                <button
                                    onClick={handleAutoArrange}
                                    disabled={autoArrangeLoading}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${autoArrangeLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        }`}
                                >
                                    {autoArrangeLoading ? '⏳...' : '🔄 Auto-Arrange'}
                                </button>
                            )}
                            <button
                                onClick={() => openModal()}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                            >
                                ➕ Προσθήκη
                            </button>
                        </div>
                    </div>

                    {/* 🔥 List with Drag and Drop - Χρώματα ανά 16 ονομαστικά */}
                    {loading ? (
                        <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Φόρτωση...</p>
                    ) : onomastika.length === 0 ? (
                        <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Δεν υπάρχουν ονομαστικά για αυτό το κεφάλαιο
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 thin-scrollbar">
                            {onomastika.map((onom, index) => {
                                const isDragging = draggedIndex === index
                                const [bgColor, hoverColor] = getGroupColors(index, darkMode)

                                // Αν το ονομαστικό είναι highlighted, χρησιμοποιούμε κίτρινο
                                const isHighlighted = onom.highlighted
                                const highlightBg = darkMode ? 'bg-yellow-900/60 hover:bg-yellow-900/80' : 'bg-yellow-100 hover:bg-yellow-200'

                                return (
                                    <div
                                        key={onom.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className={`onomastiko-item flex items-center justify-between p-2.5 rounded-lg border-2 border-transparent transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'
                                            } ${isHighlighted ? highlightBg : `${bgColor} ${hoverColor}`}`}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Drag Handle */}
                                            <div
                                                className={`flex flex-col items-center justify-center w-7 h-7 rounded cursor-grab hover:bg-gray-400/20 transition-colors select-none ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}
                                                title="Σύρετε για αναδιάταξη"
                                            >
                                                <span className="text-base leading-none">⠿</span>
                                            </div>

                                            {/* 🔥 Δείκτης ομάδας (16) */}
                                            <div className={`text-xs font-mono font-bold w-6 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                {Math.floor(index / 16) + 1}
                                            </div>

                                            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                                                <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {onom.name}
                                                </span>
                                                {onom.number && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                                        #{onom.number}
                                                    </span>
                                                )}
                                                {onom.page && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                                        Σελ. {onom.page}
                                                    </span>
                                                )}
                                                {onom.highlighted && <span className="text-xs">⭐</span>}
                                                {onom.infos && (
                                                    <span className={`text-xs truncate max-w-[150px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        📝 {onom.infos}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Δείκτης σειράς */}
                                            <div className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                #{index + 1}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => openModal(onom)}
                                                className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                                                title="Επεξεργασία"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingOnomastiko(onom)
                                                    handleDelete()
                                                }}
                                                className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                                title="Διαγραφή"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Παρακαλώ επιλέξτε ένα κεφάλαιο για να διαχειριστείτε τα ονομαστικά
                </div>
            )}

            {/* SettingsOnomastiko Modal με React Portal */}
            {mounted && typeof document !== 'undefined' && createPortal(
                <SettingsOnomastikoModal
                    isOpen={showModal}
                    onClose={closeModal}
                    onSave={handleSave}
                    onDelete={handleDelete}
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
                />,
                document.body
            )}
        </div>
    )
}

export default OnomastikaTab