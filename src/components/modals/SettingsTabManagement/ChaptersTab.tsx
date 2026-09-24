// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabManagement\ChaptersTab.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface ChaptersTabProps {
    darkMode: boolean
    selectedYear: number
    onMessage: (type: 'success' | 'error', text: string) => void
    onYearChange?: (year: number) => void
}

const ChaptersTab: React.FC<ChaptersTabProps> = ({
    darkMode,
    selectedYear,
    onMessage,
    onYearChange
}) => {
    const [chapters, setChapters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        page: '',
        year: selectedYear || new Date().getFullYear(),
        pageProcessingType: 'merge_rows'
    })
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [reordering, setReordering] = useState(false)

    useEffect(() => {
        fetchChapters()
    }, [selectedYear])

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            year: selectedYear || new Date().getFullYear()
        }))
    }, [selectedYear])

    const fetchChapters = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/chapters?year=${selectedYear}`)
            const sortedChapters = res.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            setChapters(sortedChapters)
        } catch (error) {
            console.error('Error fetching chapters:', error)
            onMessage('error', 'Σφάλμα φόρτωσης κεφαλαίων')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const dataToSave = {
                ...formData,
                year: selectedYear || new Date().getFullYear()
            }

            if (editingId) {
                await axios.put(`/api/chapters/${editingId}?year=${selectedYear}`, dataToSave)
                onMessage('success', 'Το κεφάλαιο ενημερώθηκε επιτυχώς!')
            } else {
                await axios.post(`/api/chapters?year=${selectedYear}`, dataToSave)
                onMessage('success', 'Το κεφάλαιο δημιουργήθηκε επιτυχώς!')
            }

            setEditingId(null)
            setFormData({
                name: '',
                description: '',
                page: '',
                year: selectedYear || new Date().getFullYear(),
                pageProcessingType: 'merge_rows'
            })
            fetchChapters()

            if (onYearChange) {
                onYearChange(selectedYear)
            }
        } catch (error) {
            console.error('Error saving chapter:', error)
            onMessage('error', 'Σφάλμα αποθήκευσης: ' + (error.response?.data?.error || error.message))
        }
    }

    const handleEdit = (chapter: any) => {
        setEditingId(chapter.id)
        setFormData({
            name: chapter.name,
            description: chapter.description || '',
            page: chapter.page || '',
            year: chapter.year,
            pageProcessingType: chapter.pageProcessingType || 'merge_rows'
        })
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Θέλετε να διαγράψετε αυτό το κεφάλαιο; Θα διαγραφούν και όλα τα ονομαστικά και οι εγγραφές του.')) return

        try {
            await axios.delete(`/api/chapters/${id}?year=${selectedYear}`)
            onMessage('success', 'Το κεφάλαιο διαγράφηκε επιτυχώς!')
            fetchChapters()
            if (onYearChange) onYearChange(selectedYear)
        } catch (error) {
            console.error('Error deleting chapter:', error)
            onMessage('error', 'Σφάλμα διαγραφής')
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setFormData({
            name: '',
            description: '',
            page: '',
            year: selectedYear || new Date().getFullYear(),
            pageProcessingType: 'merge_rows'
        })
    }

    const autoReorderByPages = async () => {
        if (chapters.length === 0) {
            onMessage('error', 'Δεν υπάρχουν κεφάλαια για αναδιάταξη')
            return
        }

        setReordering(true)
        try {
            const sortedChapters = [...chapters]
            sortedChapters.sort((a, b) => {
                if (a.page && b.page) {
                    const aPages = a.page.split(',').map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p))
                    const bPages = b.page.split(',').map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p))
                    if (aPages.length > 0 && bPages.length > 0) return aPages[0] - bPages[0]
                    if (aPages.length > 0) return -1
                    if (bPages.length > 0) return 1
                }
                return a.name.localeCompare(b.name)
            })

            const orderUpdates = sortedChapters.map((chapter, index) => ({
                id: chapter.id,
                order: index
            }))

            await axios.post('/api/chapters/reorder', {
                chapters: orderUpdates,
                year: selectedYear
            })

            setChapters(sortedChapters)
            onMessage('success', '✅ Τα κεφάλαια ταξινομήθηκαν με βάση τις σελίδες!')
        } catch (error) {
            console.error('Error auto-reordering chapters:', error)
            onMessage('error', 'Σφάλμα κατά την αναδιάταξη')
            fetchChapters()
        } finally {
            setReordering(false)
        }
    }

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        setTimeout(() => (e.target as HTMLElement).style.opacity = '0.5', 0)
    }

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1'
        setDraggedIndex(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            return
        }

        const newChapters = [...chapters]
        const [draggedItem] = newChapters.splice(draggedIndex, 1)
        newChapters.splice(dropIndex, 0, draggedItem)

        setChapters(newChapters)
        setDraggedIndex(null)

        try {
            const orderUpdates = newChapters.map((chapter, index) => ({
                id: chapter.id,
                order: index
            }))

            await axios.post('/api/chapters/reorder', {
                chapters: orderUpdates,
                year: selectedYear
            })

            onMessage('success', 'Η σειρά των κεφαλαίων ενημερώθηκε!')
        } catch (error) {
            console.error('Error reordering chapters:', error)
            onMessage('error', 'Σφάλμα κατά την αναδιάταξη')
            fetchChapters()
        }
    }

    const getProcessingTypeLabel = (type: string) => {
        if (type === 'sequential') {
            return { text: '📄 Διαδοχικές Σελίδες', color: 'purple' }
        }
        return { text: '📑 Συγχώνευση Γραμμών', color: 'blue' }
    }

    const getPageDisplay = (page: string) => {
        if (!page) return '—'
        const pages = page.split(',').map(p => p.trim()).filter(p => p)
        if (pages.length === 0) return '—'
        if (pages.length === 1) return `Σελ. ${pages[0]}`
        return `Σελ. ${pages[0]} - ${pages[pages.length - 1]}`
    }

    return (
        <div className="space-y-4">
            {/* Form */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {editingId ? '✏️ Επεξεργασία Κεφαλαίου' : '➕ Προσθήκη Κεφαλαίου'}
                </h4>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Όνομα Κεφαλαίου *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                    }`}
                                placeholder="π.χ. Α.Α.Α."
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Έτος (δεσμευμένο)
                            </label>
                            <input
                                type="text"
                                disabled
                                value={selectedYear}
                                className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'
                                    } cursor-not-allowed`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Σελίδες (διαχωρισμός με κόμμα)
                        </label>
                        <input
                            type="text"
                            placeholder="1,2,3"
                            value={formData.page}
                            onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Περιγραφή
                        </label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                }`}
                            placeholder="Περιγραφή κεφαλαίου..."
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Τρόπος Επεξεργασίας Σελίδων
                        </label>
                        <select
                            value={formData.pageProcessingType}
                            onChange={(e) => setFormData({ ...formData, pageProcessingType: e.target.value })}
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                }`}
                        >
                            <option value="merge_rows">📑 Συγχώνευση Γραμμών (Default)</option>
                            <option value="sequential">📄 Διαδοχικές Σελίδες</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                            {editingId ? 'Ενημέρωση' : 'Αποθήκευση'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium">
                                Ακύρωση
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        📚 Λίστα Κεφαλαίων ({chapters.length})
                    </h4>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={autoReorderByPages}
                            disabled={reordering || chapters.length === 0}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${reordering || chapters.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : darkMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                                }`}
                            title="Ταξινόμηση με βάση τις σελίδες"
                        >
                            {reordering ? '⏳...' : '🔄 Ταξινόμηση'}
                        </button>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>↕️ Σύρετε</span>
                    </div>
                </div>
                {loading ? (
                    <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Φόρτωση...</p>
                ) : chapters.length === 0 ? (
                    <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Δεν υπάρχουν κεφάλαια για το έτος {selectedYear}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 thin-scrollbar">
                        {chapters.map((chapter, index) => {
                            const processingLabel = getProcessingTypeLabel(chapter.pageProcessingType)
                            const isDragging = draggedIndex === index
                            return (
                                <div
                                    key={chapter.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-move transition-all ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                        } ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.01]'}`}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-gray-400 cursor-grab select-none">⋮⋮</span>
                                        <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {chapter.name}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                            {chapter.year}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                            {getPageDisplay(chapter.page)}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${processingLabel.color === 'purple'
                                            ? darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                                            : darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {processingLabel.text}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(chapter)} className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs">✏️</button>
                                        <button onClick={() => handleDelete(chapter.id)} className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs">🗑️</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChaptersTab