// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabManagement\index.tsx
'use client'

import React, { useState } from 'react'
import ChaptersTab from './ChaptersTab'
import OnomastikaTab from './OnomastikaTab'
import MaterialTab from './MaterialTab'
import YearTasksTab from './YearTasksTab'

interface SettingsTabManagementProps {
    darkMode: boolean
    selectedYear: number
    onYearChange?: (year: number) => void
}

const SettingsTabManagement: React.FC<SettingsTabManagementProps> = ({
    darkMode,
    selectedYear,
    onYearChange
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'chapters' | 'onomastika' | 'material' | 'yearTasks'>('chapters')
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)

    const showMessage = (type: 'success' | 'error' | 'warning', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    📋 Διαχείριση
                </h3>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📅 Έτος: <span className="font-bold text-blue-500">{selectedYear}</span>
                </div>
            </div>

            {/* Status messages */}
            {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : message.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Sub-tabs */}
            <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
                <button
                    onClick={() => setActiveSubTab('chapters')}
                    className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'chapters'
                        ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                        : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                        }`}
                >
                    📚 Κεφάλαια
                </button>
                <button
                    onClick={() => setActiveSubTab('onomastika')}
                    className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'onomastika'
                        ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                        : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                        }`}
                >
                    📝 Ονομαστικά
                </button>
                <button
                    onClick={() => setActiveSubTab('material')}
                    className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'material'
                        ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                        : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                        }`}
                >
                    🏷️ Λίστα Υλικών
                </button>
                <button
                    onClick={() => setActiveSubTab('yearTasks')}
                    className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'yearTasks'
                        ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                        : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                        }`}
                >
                    📅 Εργασίες Έτους
                </button>
            </div>

            {/* Content */}
            <div className="pt-2">
                {activeSubTab === 'chapters' && (
                    <ChaptersTab
                        darkMode={darkMode}
                        selectedYear={selectedYear}
                        onMessage={showMessage}
                        onYearChange={onYearChange}
                    />
                )}
                {activeSubTab === 'onomastika' && (
                    <OnomastikaTab
                        darkMode={darkMode}
                        selectedYear={selectedYear}
                        onMessage={showMessage}
                    />
                )}
                {activeSubTab === 'material' && (
                    <MaterialTab
                        darkMode={darkMode}
                        selectedYear={selectedYear}
                    />
                )}
                {activeSubTab === 'yearTasks' && (
                    <YearTasksTab
                        darkMode={darkMode}
                        selectedYear={selectedYear}
                        onMessage={showMessage}
                    />
                )}
            </div>
        </div>
    )
}

export default SettingsTabManagement