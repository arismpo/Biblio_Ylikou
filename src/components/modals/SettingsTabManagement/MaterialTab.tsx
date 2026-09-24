'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

interface MaterialTabProps {
    darkMode: boolean
    selectedYear: number
}

const MaterialTab: React.FC<MaterialTabProps> = ({ darkMode, selectedYear }) => {
    const [filePath, setFilePath] = useState(() => {
        return localStorage.getItem('materialCodeFilePath') || ''
    })
    const [chapters, setChapters] = useState<any[]>([])
    const [selectedChapter, setSelectedChapter] = useState('')
    const [selectedChapterName, setSelectedChapterName] = useState('')
    const [materials, setMaterials] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [searchInAll, setSearchInAll] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
    const [totalResults, setTotalResults] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
    const [availableChapters, setAvailableChapters] = useState<any[]>([])
    const [selectedChapterId, setSelectedChapterId] = useState('')
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState<any>(null)
    const [editName, setEditName] = useState('')
    const [editNumber, setEditNumber] = useState('')
    const [editInfos, setEditInfos] = useState('')

    const currentYear = selectedYear || new Date().getFullYear()
    const itemsPerPage = 50
    const searchTimeoutRef = useRef<any>(null)

    // Check existing materials
    const checkExistingMaterials = async (materialsList: any[], chapterName: string) => {
        console.log('🔍🔍🔍 checkExistingMaterials CALLED 🔍🔍🔍')
        console.log('📊 chapterName:', chapterName)
        console.log('📊 materialsList length:', materialsList.length)

        if (!materialsList.length || !chapterName) {
            console.log('⚠️ No materials or chapterName, returning')
            return materialsList
        }

        try {
            const requestData = {
                materials: materialsList,
                chapterName: chapterName,
                year: currentYear
            }
            console.log('📤 Sending to API:', JSON.stringify(requestData, null, 2).substring(0, 500))

            const response = await axios.post('/api/check-existing-materials', {
                materials: materialsList,
                chapterName: chapterName,
                year: currentYear  // ✅ Υπάρχει ήδη
            })

            console.log('📥 API Response status:', response.status)
            console.log('📥 API Response data:', JSON.stringify(response.data, null, 2))

            if (response.data.success && response.data.materials) {
                const existingCount = response.data.materials.filter((m: any) => m.exists).length
                console.log(`📊 Found ${existingCount} existing materials out of ${response.data.materials.length}`)
                return response.data.materials
            } else {
                console.log('❌ API response invalid:', response.data)
                return materialsList
            }
        } catch (error) {
            console.error('❌ Error checking existing materials:', error)
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data)
                console.error('Response status:', error.response?.status)
            }
            return materialsList
        }
    }

    // Load materials for a specific chapter
    const loadChapterMaterials = async (chapterCode: string, page: number = 1) => {
        if (!filePath || !chapterCode) return

        setLoading(page === 1)
        setLoadingMore(page > 1)

        try {
            const response = await axios.post('/api/get-chapter-materials', {
                filePath,
                chapterCode,
                page,
                limit: itemsPerPage,
                year: currentYear  // ✅ Υπάρχει ήδη
            })


            if (response.data.success) {
                let materialsList = response.data.materials || []

                console.log(`📊 Loaded ${materialsList.length} materials for chapter: ${chapterCode}`)

                materialsList = await checkExistingMaterials(materialsList, chapterCode)

                if (page === 1) {
                    setMaterials(materialsList)
                } else {
                    setMaterials(prev => [...prev, ...materialsList])
                }
                setTotalResults(response.data.total || 0)
                setHasMore(response.data.hasMore || false)
                setCurrentPage(page)
            } else {
                setMessage({ type: 'error', text: 'Σφάλμα φόρτωσης υλικών' })
            }
        } catch (error) {
            console.error('Error loading materials:', error)
            setMessage({ type: 'error', text: 'Σφάλμα φόρτωσης υλικών' })
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    // Load chapters
    const loadChapters = useCallback(async () => {
        if (!filePath) return

        setLoading(true)
        try {
            const response = await axios.post('/api/get-material-chapters', {
                filePath,
                year: currentYear
            })

            if (response.data.success && response.data.chapters && response.data.chapters.length > 0) {
                setChapters(response.data.chapters)
                const firstChapter = response.data.chapters[0]
                setSelectedChapter(firstChapter.chapterCode)
                setSelectedChapterName(firstChapter.chapterName)
                await loadChapterMaterials(firstChapter.chapterCode, 1)
            } else {
                setMessage({ type: 'warning', text: 'Δεν βρέθηκαν κεφάλαια στο αρχείο' })
            }
        } catch (error) {
            console.error('Error loading chapters:', error)
            setMessage({ type: 'error', text: 'Σφάλμα φόρτωσης κεφαλαίων' })
        } finally {
            setLoading(false)
        }
    }, [filePath])

    // Search materials
    const searchMaterials = async (searchValue: string, page: number = 1) => {
        if (!filePath) return

        if (!searchValue.trim()) {
            loadChapterMaterials(selectedChapter, 1)
            return
        }

        setLoading(page === 1)
        setLoadingMore(page > 1)

        try {
            const response = await axios.post('/api/search-materials', {
                filePath,
                searchTerm: searchValue,
                chapterCode: searchInAll ? null : selectedChapter,
                page,
                limit: itemsPerPage,
                year: currentYear  // ✅ Υπάρχει ήδη
            })


            if (response.data.success) {
                let materialsList = response.data.materials || []

                if (!searchInAll && selectedChapter) {
                    materialsList = await checkExistingMaterials(materialsList, selectedChapter)
                }

                if (page === 1) {
                    setMaterials(materialsList)
                } else {
                    setMaterials(prev => [...prev, ...materialsList])
                }
                setTotalResults(response.data.total || 0)
                setHasMore(response.data.hasMore || false)
                setCurrentPage(page)
            }
        } catch (error) {
            console.error('Error searching:', error)
            setMessage({ type: 'error', text: 'Σφάλμα αναζήτησης' })
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    // Handle chapter change
    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const chapterCode = e.target.value
        const chapter = chapters.find(c => c.chapterCode === chapterCode)
        setSelectedChapter(chapterCode)
        setSelectedChapterName(chapter?.chapterName || chapterCode)
        setSearchTerm('')
        setSearchInAll(false)
        setMaterials([])
        setTotalResults(0)
        loadChapterMaterials(chapterCode, 1)
    }

    // Handle search with debounce
    const handleSearch = (value: string) => {
        setSearchTerm(value)

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (value.trim()) {
                searchMaterials(value, 1)
            } else {
                loadChapterMaterials(selectedChapter, 1)
            }
        }, 500)
    }

    // Handle file upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('excelFile', file)

        setLoading(true)
        setMessage(null)
        setMaterials([])
        setChapters([])

        try {
            const response = await axios.post('/api/upload-material-code', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            })

            if (response.data.success) {
                const newFilePath = response.data.filePath
                setFilePath(newFilePath)
                localStorage.setItem('materialCodeFilePath', newFilePath)

                if (response.data.chapters && response.data.chapters.length > 0) {
                    setChapters(response.data.chapters)
                    setSelectedChapter(response.data.chapters[0].chapterCode)
                    setSelectedChapterName(response.data.chapters[0].chapterName)
                    setMessage({ type: 'success', text: `Φορτώθηκαν ${response.data.totalMaterials} υλικά σε ${response.data.totalChapters} κεφάλαια` })
                    await loadChapterMaterials(response.data.chapters[0].chapterCode, 1)
                } else {
                    setMessage({ type: 'warning', text: 'Το αρχείο φορτώθηκε αλλά δεν βρέθηκαν κεφάλαια' })
                }
            } else {
                setMessage({ type: 'error', text: response.data.error || 'Σφάλμα μεταφόρτωσης' })
            }
        } catch (error) {
            console.error('Upload error:', error)
            setMessage({ type: 'error', text: 'Σφάλμα μεταφόρτωσης' })
        } finally {
            setLoading(false)
        }
    }

    // Load more
    const loadMore = () => {
        if (searchTerm.trim()) {
            searchMaterials(searchTerm, currentPage + 1)
        } else {
            loadChapterMaterials(selectedChapter, currentPage + 1)
        }
    }

    // Fetch available chapters for modal
    const fetchAvailableChapters = async () => {
        try {
            const response = await axios.get(`/api/chapters?year=${currentYear}`)
            setAvailableChapters(response.data || [])
        } catch (error) {
            console.error('Error fetching chapters:', error)
        }
    }

    // Add to onomastiko
    const addToOnomastiko = async (material: any) => {
        if (!selectedChapterId) {
            setMessage({ type: 'error', text: 'Παρακαλώ επιλέξτε κεφάλαιο' })
            return
        }

        setLoading(true)
        try {
            const response = await axios.get(`/api/onomastika?chapterId=${selectedChapterId}`)
            const maxPosition = response.data.length > 0
                ? Math.max(...response.data.map((o: any) => o.position))
                : 0

            await axios.post('/api/onomastika', {
                name: material.name,
                number: material.code,
                position: maxPosition + 1,
                page: 1,
                chapterId: parseInt(selectedChapterId),
                infos: material.infos || null
            })

            setMessage({ type: 'success', text: `Το "${material.name}" προστέθηκε στο κεφάλαιο` })

            if (searchTerm.trim()) {
                searchMaterials(searchTerm, 1)
            } else {
                loadChapterMaterials(selectedChapter, 1)
            }

            setShowAddModal(false)
            setSelectedMaterial(null)
            setSelectedChapterId('')
        } catch (error) {
            console.error('Error:', error)
            setMessage({ type: 'error', text: 'Σφάλμα προσθήκης' })
        } finally {
            setLoading(false)
        }
    }

    // Edit existing onomastiko
    const editOnomastiko = async () => {
        if (!editingMaterial || !editingMaterial.exists) return

        setLoading(true)
        try {
            const chapter = availableChapters.find((ch: any) => ch.name === selectedChapter)
            if (!chapter) {
                setMessage({ type: 'error', text: 'Κεφάλαιο δεν βρέθηκε' })
                return
            }

            const onomastikaRes = await axios.get(`/api/onomastika?chapterId=${chapter.id}`)
            const onomastiko = onomastikaRes.data.find((o: any) => o.number === editingMaterial.code)

            if (!onomastiko) {
                setMessage({ type: 'error', text: 'Ονομαστικό δεν βρέθηκε' })
                return
            }

            await axios.put(`/api/onomastika/${onomastiko.id}`, {
                name: editName,
                number: editNumber || editingMaterial.code,
                position: onomastiko.position,
                page: onomastiko.page || 1,
                chapterId: chapter.id,
                infos: editInfos || null,
                highlighted: onomastiko.highlighted || false
            })

            setMessage({ type: 'success', text: `Το ονομαστικό ενημερώθηκε` })
            setShowEditModal(false)
            setEditingMaterial(null)

            if (searchTerm.trim()) {
                searchMaterials(searchTerm, 1)
            } else {
                loadChapterMaterials(selectedChapter, 1)
            }
        } catch (error) {
            console.error('Error editing onomastiko:', error)
            setMessage({ type: 'error', text: 'Σφάλμα ενημέρωσης' })
        } finally {
            setLoading(false)
        }
    }

    const openEditModal = async (material: any) => {
        if (!material.exists) return

        setEditingMaterial(material)
        setEditName(material.existingOnomastikoName || material.name)
        setEditNumber(material.code)
        setEditInfos(material.infos || '')
        setShowEditModal(true)
        await fetchAvailableChapters()
    }

    const openAddModal = (material: any) => {
        setSelectedMaterial(material)
        setShowAddModal(true)
        fetchAvailableChapters()
    }

    const getRowColor = (material: any) => {
        if (material.exists) {
            return darkMode
                ? 'bg-green-900/30 hover:bg-green-800/50'
                : 'bg-green-50 hover:bg-green-100'
        }
        return darkMode
            ? 'bg-gray-800/50 hover:bg-gray-700/50'
            : 'hover:bg-gray-50'
    }

    // Load chapters on mount if file exists
    useEffect(() => {
        if (filePath) {
            loadChapters()
        }
    }, [filePath])

    return (
        <div className="h-full flex flex-col">
            {/* Messages */}
            {message && (
                <div className={`mb-2 p-2.5 rounded-lg flex-shrink-0 text-sm ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : message.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* File Selection */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-2.5 mb-2 flex-shrink-0`}>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="material-file-input"
                    />
                    <label
                        htmlFor="material-file-input"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors text-sm flex-shrink-0"
                    >
                        📂 Επιλογή Αρχείου
                    </label>

                    {filePath && (
                        <div className={`flex-1 text-sm truncate min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="font-semibold">📁</span> {filePath.split('\\').pop()}
                        </div>
                    )}
                </div>
            </div>

            {/* Chapter Selection & Search */}
            {chapters.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-2.5 mb-2 flex-shrink-0`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label className={`block text-xs font-medium mb-0.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                📑 Κεφάλαιο
                            </label>
                            <select
                                className={`w-full border rounded-md px-2.5 py-1.5 text-sm ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={selectedChapter}
                                onChange={handleChapterChange}
                                disabled={loading}
                            >
                                {chapters.map((ch, index) => (
                                    <option key={`${ch.chapterCode}_${index}`} value={ch.chapterCode}>
                                        {ch.chapterName} ({ch.materialCount})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-xs font-medium mb-0.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                🔍 Αναζήτηση
                            </label>
                            <input
                                type="text"
                                placeholder="Αναζήτηση..."
                                className={`w-full border rounded-md px-2.5 py-1.5 text-sm ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                            <input
                                type="checkbox"
                                checked={searchInAll}
                                onChange={(e) => {
                                    setSearchInAll(e.target.checked)
                                    if (searchTerm.trim()) {
                                        searchMaterials(searchTerm, 1)
                                    }
                                }}
                                className="w-3.5 h-3.5"
                            />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                Όλα τα κεφάλαια
                            </span>
                        </label>

                        {totalResults > 0 && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {totalResults} αποτελέσματα
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Results Table - HEADER ΕΞΩ ΑΠΟ ΤΟ TABLE */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-t-lg shadow-sm flex-shrink-0 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="grid grid-cols-6 gap-1 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Κωδικός</div>
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Ονομαστικό</div>
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Υπάρχον</div>
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Κατάσταση</div>
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Πληροφορίες</div>
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-center`}>Ενέργεια</div>
                </div>
            </div>

            {/* Results Table - ΜΟΝΟ ΤΟ ΣΩΜΑ */}
            <div className="flex-1 min-h-0">
                {materials.length > 0 ? (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-b-lg shadow h-full flex flex-col overflow-hidden`}>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    {materials.map((material, idx) => (
                                        <tr
                                            key={idx}
                                            className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${getRowColor(material)} transition-colors`}
                                        >
                                            <td className={`p-1.5 font-mono text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {material.code}
                                            </td>
                                            <td className={`p-1.5 text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {material.name}
                                            </td>
                                            <td className="p-1.5 text-xs">
                                                {material.exists ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-green-600 dark:text-green-400 font-medium truncate max-w-[100px]">
                                                            ✓ {material.existingOnomastikoName}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                                                            (#{material.code})
                                                        </span>
                                                        <button
                                                            onClick={() => openEditModal(material)}
                                                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${darkMode
                                                                    ? 'text-blue-400 border-blue-700 hover:bg-blue-900/30'
                                                                    : 'text-blue-600 border-blue-300 hover:bg-blue-50'
                                                                }`}
                                                            title="Επεξεργασία ονομαστικού"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-1.5">
                                                {material.exists ? (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Υπάρχει
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                        Νέο
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`p-1.5 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} max-w-[120px] truncate`}>
                                                {material.infos || '—'}
                                            </td>
                                            <td className="p-1.5 text-center">
                                                <button
                                                    onClick={() => openAddModal(material)}
                                                    disabled={material.exists}
                                                    className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors ${material.exists
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                                        }`}
                                                    title={material.exists ? 'Το υλικό υπάρχει ήδη' : 'Προσθήκη υλικού'}
                                                >
                                                    {material.exists ? '✓' : '+ Προσθήκη'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className={`p-1.5 text-center border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${loadingMore
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {loadingMore ? 'Φόρτωση...' : 'Φόρτωση περισσότερων...'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : loading && materials.length === 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm">Φόρτωση υλικών...</p>
                    </div>
                ) : filePath && chapters.length > 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-sm">Δεν βρέθηκαν υλικά για αυτό το κεφάλαιο</p>
                    </div>
                ) : !filePath ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="text-4xl mb-2">📁</div>
                        <p className="text-sm">Επιλέξτε αρχείο Excel με τον κωδικό υλικού</p>
                    </div>
                ) : null}
            </div>

            {/* Add to Onomastiko Modal */}
            {showAddModal && selectedMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto`}>
                        <h2 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Προσθήκη στο Βιβλίο Υλικού
                        </h2>

                        <div className="mb-3 space-y-1 text-sm">
                            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                <strong>Κωδικός:</strong> {selectedMaterial.code}
                            </p>
                            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                <strong>Ονομαστικό:</strong> {selectedMaterial.name}
                            </p>
                            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                <strong>Πληροφορίες:</strong> {selectedMaterial.infos || '—'}
                            </p>
                        </div>

                        <div className="mb-3">
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Κεφάλαιο Προορισμού
                            </label>
                            <select
                                className={`w-full border rounded-md px-3 py-1.5 text-sm ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={selectedChapterId}
                                onChange={(e) => setSelectedChapterId(e.target.value)}
                            >
                                <option value="">Επιλέξτε...</option>
                                {availableChapters.map((ch: any) => (
                                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowAddModal(false)
                                    setSelectedMaterial(null)
                                    setSelectedChapterId('')
                                }}
                                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                            >
                                Ακύρωση
                            </button>
                            <button
                                onClick={() => addToOnomastiko(selectedMaterial)}
                                disabled={!selectedChapterId || loading}
                                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                {loading ? 'Προσθήκη...' : '✓ Προσθήκη'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Onomastiko Modal */}
            {showEditModal && editingMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto`}>
                        <h2 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Επεξεργασία Ονομαστικού
                        </h2>

                        <div className="mb-3">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <strong>Κωδικός:</strong> {editingMaterial.code}
                            </p>
                        </div>

                        <div className="mb-3">
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Όνομα
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-md px-3 py-1.5 text-sm ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Αριθμός
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-md px-3 py-1.5 text-sm ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={editNumber}
                                onChange={(e) => setEditNumber(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Πληροφορίες
                            </label>
                            <textarea
                                rows="2"
                                className={`w-full border rounded-md px-3 py-1.5 text-sm ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={editInfos}
                                onChange={(e) => setEditInfos(e.target.value)}
                                placeholder="Πρόσθετες πληροφορίες..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowEditModal(false)
                                    setEditingMaterial(null)
                                }}
                                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                            >
                                Ακύρωση
                            </button>
                            <button
                                onClick={editOnomastiko}
                                disabled={!editName || loading}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                {loading ? 'Αποθήκευση...' : '✓ Αποθήκευση'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MaterialTab