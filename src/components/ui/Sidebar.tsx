'use client'

import React, { useState, useEffect } from 'react'

interface Chapter {
  id: number
  name: string
  description: string | null
}

interface SidebarProps {
  sidebarOpen: boolean
  sidebarWidth: number
  setSidebarOpen: (open: boolean) => void
  selectedYear: number
  handleYearChange: (year: number) => void
  chapters: Chapter[]
  selectedChapterId: number | null
  setSelectedChapterId: (id: number) => void
  setSelectedPage: (page: number | null) => void
  setCurrentChapterPages: (pages: number[]) => void
  darkMode: boolean
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  sidebarWidth,
  setSidebarOpen,
  selectedYear,
  handleYearChange,
  chapters,
  selectedChapterId,
  setSelectedChapterId,
  setSelectedPage,
  setCurrentChapterPages,
  darkMode
}) => {
  const [showOnlyWithRecords, setShowOnlyWithRecords] = useState(() => {
    const saved = localStorage.getItem('sidebar_showOnlyWithRecords')
    return saved ? saved === 'true' : false
  })

  const [chaptersWithRecords, setChaptersWithRecords] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('sidebar_showOnlyWithRecords', showOnlyWithRecords.toString())
  }, [showOnlyWithRecords])

  const fetchChaptersWithRecords = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chapters/with-records?year=${selectedYear}`)
      if (response.ok) {
        const data = await response.json()
        const ids = data.filter((ch: any) => ch.hasRecords).map((ch: any) => ch.id)
        setChaptersWithRecords(ids)
        return ids
      } else {
        console.error('Failed to fetch chapters with records')
        setChaptersWithRecords([])
        return []
      }
    } catch (error) {
      console.error('Error fetching chapters with records:', error)
      setChaptersWithRecords([])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (showOnlyWithRecords) {
      fetchChaptersWithRecords()
    } else {
      setChaptersWithRecords([])
    }
  }, [showOnlyWithRecords, selectedYear])

  const filteredChapters = showOnlyWithRecords
    ? chapters.filter(ch => chaptersWithRecords.includes(ch.id))
    : chapters

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapterId(chapterId)
    setSelectedPage(null)
    setCurrentChapterPages([])
  }

  if (!sidebarOpen) return null

  return (
    <div
      className={`flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 ease-in-out`}
      style={{ width: sidebarWidth, overflow: 'hidden' }}
    >
      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className={`font-bold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          ΚΕΦΑΛΑΙΑ
        </h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
        >
          ✕
        </button>
      </div>

      {/* ΕΤΟΣ */}
      <div className="p-4 border-b">
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Έτος
        </label>
        <select
          className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          value={selectedYear}
          onChange={e => handleYearChange(parseInt(e.target.value))}
        >
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* ΦΙΛΤΡΟ - ΜΟΝΟ ΚΕΦΑΛΑΙΑ ΜΕ ΕΓΓΡΑΦΕΣ */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Μόνο με εγγραφές
          </label>
          <button
            onClick={() => setShowOnlyWithRecords(!showOnlyWithRecords)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${showOnlyWithRecords ? 'bg-blue-600' : 'bg-gray-400'
              }`}
            disabled={isLoading}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showOnlyWithRecords ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
        {showOnlyWithRecords && (
          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isLoading ? (
              'Φόρτωση...'
            ) : (
              `${filteredChapters.length} από ${chapters.length} κεφάλαια`
            )}
          </div>
        )}
      </div>

      {/* ΛΙΣΤΑ ΚΕΦΑΛΑΙΩΝ */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && showOnlyWithRecords ? (
          <div className={`text-center p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Φόρτωση κεφαλαίων...
          </div>
        ) : filteredChapters.length === 0 && showOnlyWithRecords ? (
          <div className={`text-center p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Δεν υπάρχουν κεφάλαια με εγγραφές για το {selectedYear}
          </div>
        ) : (
          filteredChapters.map(ch => {
            const isSelected = selectedChapterId === ch.id
            return (
              <button
                key={ch.id}
                onClick={() => handleChapterSelect(ch.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${isSelected
                    ? (darkMode ? 'bg-blue-900 text-blue-200 font-semibold' : 'bg-blue-100 text-blue-800 font-semibold')
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                  }`}
              >
                <div className="text-sm font-medium">{ch.name}</div>
                {ch.description && (
                  <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {ch.description}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Sidebar