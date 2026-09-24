'use client'

import React, { useEffect } from 'react'

interface SettingsTabAppearanceProps {
    darkMode: boolean
    setDarkMode: (value: boolean) => void
    frozenHeader: boolean
    setFrozenHeader: (value: boolean) => void
    frozenFooter: boolean
    setFrozenFooter: (value: boolean) => void
    frozenColumns: boolean
    setFrozenColumns: (value: boolean) => void
    sidebarOpen: boolean
    setSidebarOpen: (value: boolean) => void
}

const SettingsTabAppearance: React.FC<SettingsTabAppearanceProps> = ({
    darkMode,
    setDarkMode,
    frozenHeader,
    setFrozenHeader,
    frozenFooter,
    setFrozenFooter,
    frozenColumns,
    setFrozenColumns,
    sidebarOpen,
    setSidebarOpen
}) => {
    // Save setting to localStorage
    const saveSetting = (key: string, value: any) => {
        localStorage.setItem(`app_settings_${key}`, String(value))
    }

    // Apply dark mode to document
    const applyDarkMode = (isDark: boolean) => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    // Handle dark mode toggle with persistence
    const handleDarkModeToggle = () => {
        const newValue = !darkMode
        setDarkMode(newValue)
        saveSetting('darkMode', newValue)
        applyDarkMode(newValue)
    }

    const handleFrozenHeaderToggle = () => {
        const newValue = !frozenHeader
        setFrozenHeader(newValue)
        saveSetting('frozenHeader', newValue)
    }

    const handleFrozenFooterToggle = () => {
        const newValue = !frozenFooter
        setFrozenFooter(newValue)
        saveSetting('frozenFooter', newValue)
    }

    const handleFrozenColumnsToggle = () => {
        const newValue = !frozenColumns
        setFrozenColumns(newValue)
        saveSetting('frozenColumns', newValue)
    }

    const handleSidebarToggle = () => {
        const newValue = !sidebarOpen
        setSidebarOpen(newValue)
        saveSetting('sidebarOpen', newValue)
    }

    return (
        <div className="space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        🌙 Σκοτεινή Λειτουργία (Dark Mode)
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Εναλλαγή μεταξύ φωτεινής και σκοτεινής εμφάνισης
                    </div>
                </div>
                <button
                    onClick={handleDarkModeToggle}
                    className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none ${darkMode ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                    <span
                        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${darkMode ? 'translate-x-8' : 'translate-x-1'}`}
                    />
                    <span className={`absolute text-xs font-medium ${darkMode ? 'left-1 text-white' : 'right-1 text-gray-700'}`}>
                        {darkMode ? '🌙' : '☀️'}
                    </span>
                </button>
            </div>

            {/* Sidebar on load */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        📖 Εμφάνιση Sidebar κατά την εκκίνηση
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Το μενού θα είναι ανοιχτό όταν φορτώνει η σελίδα
                    </div>
                </div>
                <button
                    onClick={handleSidebarToggle}
                    className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none ${sidebarOpen ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                    <span
                        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${sidebarOpen ? 'translate-x-8' : 'translate-x-1'}`}
                    />
                    <span className={`absolute text-xs font-medium ${sidebarOpen ? 'left-1 text-white' : 'right-1 text-gray-700'}`}>
                        {sidebarOpen ? '📖' : '📕'}
                    </span>
                </button>
            </div>

            {/* Frozen Header */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        📌 Frozen Header
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Η κεφαλίδα του πίνακα παραμένει σταθερή κατά το scroll
                    </div>
                </div>
                <button
                    onClick={handleFrozenHeaderToggle}
                    className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none ${frozenHeader ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                    <span
                        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${frozenHeader ? 'translate-x-8' : 'translate-x-1'}`}
                    />
                    <span className={`absolute text-xs font-medium ${frozenHeader ? 'left-1 text-white' : 'right-1 text-gray-700'}`}>
                        {frozenHeader ? '📌' : '🔓'}
                    </span>
                </button>
            </div>

            {/* Frozen Footer */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        📌 Frozen Footer
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Τα σύνολα του πίνακα παραμένουν σταθερά κατά το scroll
                    </div>
                </div>
                <button
                    onClick={handleFrozenFooterToggle}
                    className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none ${frozenFooter ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                    <span
                        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${frozenFooter ? 'translate-x-8' : 'translate-x-1'}`}
                    />
                    <span className={`absolute text-xs font-medium ${frozenFooter ? 'left-1 text-white' : 'right-1 text-gray-700'}`}>
                        {frozenFooter ? '📌' : '🔓'}
                    </span>
                </button>
            </div>

            {/* Frozen Columns */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        📌 Frozen Columns (Α.Α., ΜΗΝΑΣ, ΗΜΕΡΑ, ΑΙΤΙΟΛΟΓΙΑ)
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Οι στήλες Α.Α., ΜΗΝΑΣ, ΗΜΕΡΑ, ΑΙΤΙΟΛΟΓΙΑ παραμένουν σταθερές κατά το horizontal scroll
                    </div>
                </div>
                <button
                    onClick={handleFrozenColumnsToggle}
                    className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none ${frozenColumns ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                    <span
                        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${frozenColumns ? 'translate-x-8' : 'translate-x-1'}`}
                    />
                    <span className={`absolute text-xs font-medium ${frozenColumns ? 'left-1 text-white' : 'right-1 text-gray-700'}`}>
                        {frozenColumns ? '📌' : '🔓'}
                    </span>
                </button>
            </div>
        </div>
    )
}

export default SettingsTabAppearance