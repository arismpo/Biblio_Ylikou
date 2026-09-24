'use client'

import React from 'react'

interface OnomastikoModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    onDelete?: () => void
    editingOnomastiko: any
    name: string
    setName: (value: string) => void
    number: string
    setNumber: (value: string) => void
    page: string
    setPage: (value: string) => void
    infos: string
    setInfos: (value: string) => void
    highlighted: boolean
    setHighlighted: (value: boolean) => void
    darkMode: boolean
    onomastika?: any[]
    chapterPages?: number[]
    onAutoArrange?: () => void
}

const OnomastikoModal: React.FC<OnomastikoModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    editingOnomastiko,
    name,
    setName,
    number,
    setNumber,
    page,
    setPage,
    infos,
    setInfos,
    highlighted,
    setHighlighted,
    darkMode,
    onomastika = [],
    chapterPages = [],
    onAutoArrange
}) => {
    if (!isOpen) return null

    const isNew = !editingOnomastiko
    const totalOnomastika = onomastika.length
    const pagesWithOnomastika = new Set(onomastika.map(o => o.page).filter(p => p))
    const totalPages = Math.max(1, Math.ceil(totalOnomastika / 16) || 1)

    const getPageColor = (pageNum: number) => {
        const colors = [
            'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
            'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
            'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
            'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
            'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
            'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700',
            'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700',
            'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700'
        ]
        return colors[(pageNum - 1) % colors.length]
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* 🔥 ΙΔΙΟ ΜΕΓΕΘΟΣ με το SettingsModal - max-w-3xl */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>

                {/* Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-10`}>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {isNew ? '➕ Προσθήκη Ονομαστικού' : '✏️ Επεξεργασία Ονομαστικού'}
                        </h3>
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                        >
                            ✕
                        </button>
                    </div>
                    {!isNew && (
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: #{editingOnomastiko?.id}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Stats Bar */}
                    {!isNew && (
                        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    📊 Σύνολο: <strong>{totalOnomastika}</strong>
                                </span>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    📄 Σελίδες: <strong>{pagesWithOnomastika.size}</strong> / {totalPages}
                                </span>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    📌 Ανά σελίδα: <strong>16</strong>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Form - 2 στήλες */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Όνομα *
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Αριθμός (προαιρετικό)
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Σελίδα
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    className={`flex-1 border rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    value={page}
                                    onChange={(e) => setPage(e.target.value)}
                                    placeholder="π.χ. 32"
                                />
                                {chapterPages.length > 0 && (
                                    <select
                                        className={`border rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        value={page}
                                        onChange={(e) => setPage(e.target.value)}
                                    >
                                        <option value="">Επιλογή</option>
                                        {chapterPages.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Ο αριθμός σελίδας όπου εμφανίζεται αυτό το ονομαστικό
                            </p>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Επισήμανση
                            </label>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    checked={highlighted}
                                    onChange={(e) => setHighlighted(e.target.checked)}
                                    className="w-4 h-4 text-yellow-500 rounded"
                                />
                                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    ✨ Κίτρινο φόντο
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Πληροφορίες */}
                    <div className="mb-4">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Πληροφορίες / Σημειώσεις
                        </label>
                        <textarea
                            className={`w-full border rounded-md px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            rows="3"
                            value={infos}
                            onChange={(e) => setInfos(e.target.value)}
                            placeholder="Προσθέστε πληροφορίες για αυτό το ονομαστικό..."
                        />
                    </div>

                    {/* Preview */}
                    {!isNew && onomastika.length > 0 && (
                        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    📊 Προεπισκόπηση ({onomastika.slice(0, 32).length} από {onomastika.length})
                                </h4>
                                <button
                                    onClick={onAutoArrange}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                                >
                                    🔄 Auto-Arrange
                                </button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-24 overflow-y-auto">
                                {onomastika.slice(0, 32).map((o, idx) => {
                                    const pageNum = o.page || '?'
                                    const colorClass = typeof pageNum === 'number'
                                        ? getPageColor(pageNum)
                                        : 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                                    return (
                                        <div
                                            key={o.id}
                                            className={`text-xs p-1 rounded border ${colorClass} truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'} text-center`}
                                            title={`${o.name} (Σελ. ${pageNum})`}
                                        >
                                            {o.name}
                                        </div>
                                    )
                                })}
                                {onomastika.length > 32 && (
                                    <div className={`text-xs p-1 rounded border ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-500'} flex items-center justify-center`}>
                                        +{onomastika.length - 32}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-wrap justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        {!isNew && onDelete && (
                            <button
                                onClick={onDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                🗑️ Διαγραφή
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded transition-colors ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                        >
                            Ακύρωση
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            {isNew ? 'Δημιουργία' : 'Αποθήκευση'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-3 border-t text-center text-xs ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                    📌 Κάθε σελίδα μπορεί να έχει έως 16 ονομαστικά • 🔄 Auto-Arrange ταξινομεί αυτόματα
                </div>
            </div>
        </div>
    )
}

export default OnomastikoModal