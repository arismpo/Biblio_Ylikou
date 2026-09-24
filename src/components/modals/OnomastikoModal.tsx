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
    console.log('🔥🔥🔥 MEGA MODAL RENDERED - isOpen:', isOpen)

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
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                maxHeight: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 0,
                margin: 0,
                overflow: 'hidden'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
                    overflow: 'auto',
                    padding: '24px',
                    borderRadius: 0,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                    margin: 0
                }}
            >

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-gray-700">
                    <div>
                        <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {isNew ? '➕ Προσθήκη Ονομαστικού' : '✏️ Επεξεργασία Ονομαστικού'}
                        </h3>
                        {!isNew && (
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Επεξεργασία ονομαστικού ID: #{editingOnomastiko?.id}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-12 h-12 flex items-center justify-center rounded-full text-3xl transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        ✕
                    </button>
                </div>

                {/* Stats Bar */}
                {!isNew && (
                    <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between text-sm flex-wrap gap-3">
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                📊 Σύνολο: <strong className="text-blue-500 text-base">{totalOnomastika}</strong>
                            </span>
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                📄 Σελίδες: <strong className="text-blue-500 text-base">{pagesWithOnomastika.size}</strong> / {totalPages}
                            </span>
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                📌 Ανά σελίδα: <strong className="text-blue-500 text-base">16</strong>
                            </span>
                        </div>
                    </div>
                )}

                {/* Form - 3 στήλες */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Όνομα *
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-4 py-3 text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            placeholder="Πληκτρολογήστε το όνομα..."
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Αριθμός (προαιρετικό)
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-4 py-3 text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="π.χ. 1"
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
                                className={`flex-1 border rounded-md px-4 py-3 text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                value={page}
                                onChange={(e) => setPage(e.target.value)}
                                placeholder="π.χ. 32"
                            />
                            {chapterPages.length > 0 && (
                                <select
                                    className={`border rounded-md px-4 py-3 text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
                    </div>
                </div>

                {/* Πληροφορίες */}
                <div className="mb-6">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Πληροφορίες / Σημειώσεις
                    </label>
                    <textarea
                        className={`w-full border rounded-md px-4 py-3 text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        rows="4"
                        value={infos}
                        onChange={(e) => setInfos(e.target.value)}
                        placeholder="Προσθέστε πληροφορίες για αυτό το ονομαστικό..."
                    />
                </div>

                {/* Επισήμανση */}
                <div className="mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={highlighted}
                            onChange={(e) => setHighlighted(e.target.checked)}
                            className="w-5 h-5 text-yellow-500 rounded"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ✨ Επισήμανση (κίτρινο φόντο στο βιβλίο υλικού)
                        </span>
                    </label>
                </div>

                {/* Preview */}
                {!isNew && onomastika.length > 0 && (
                    <div className={`mb-6 p-5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h4 className={`font-medium text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                📊 Προεπισκόπηση ({onomastika.slice(0, 64).length} από {onomastika.length})
                            </h4>
                            <button
                                onClick={onAutoArrange}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                            >
                                🔄 Auto-Arrange (16/σελίδα)
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto">
                            {onomastika.slice(0, 64).map((o, idx) => {
                                const pageNum = o.page || '?'
                                const colorClass = typeof pageNum === 'number'
                                    ? getPageColor(pageNum)
                                    : 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                                return (
                                    <div
                                        key={o.id}
                                        className={`text-xs p-2 rounded border ${colorClass} truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'} text-center`}
                                        title={`${o.name} (Σελ. ${pageNum})`}
                                    >
                                        {o.name}
                                    </div>
                                )
                            })}
                            {onomastika.length > 64 && (
                                <div className={`text-xs p-2 rounded border ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-500'} flex items-center justify-center`}>
                                    +{onomastika.length - 64}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>🎨 Χρώματα ανά σελίδα</span>
                            {[...new Set(onomastika.map(o => o.page).filter(p => p))].slice(0, 10).map(pageNum => (
                                <span key={pageNum} className={`text-xs px-2 py-0.5 rounded ${getPageColor(pageNum)} ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Σελ. {pageNum}
                                </span>
                            ))}
                            {[...new Set(onomastika.map(o => o.page).filter(p => p))].length > 10 && (
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    +{[...new Set(onomastika.map(o => o.page).filter(p => p))].length - 10}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t dark:border-gray-700">
                    {!isNew && onDelete && (
                        <button
                            onClick={onDelete}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-base font-medium"
                        >
                            <span>🗑️</span> Διαγραφή
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 text-base font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                    >
                        <span>✕</span> Ακύρωση
                    </button>
                    <button
                        onClick={onSave}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-base font-medium"
                    >
                        <span>💾</span> {isNew ? 'Δημιουργία' : 'Αποθήκευση'}
                    </button>
                </div>

                {/* Info footer */}
                <div className={`mt-4 pt-3 border-t text-xs ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                    <div className="flex flex-wrap justify-between gap-2">
                        <span>📌 Κάθε σελίδα μπορεί να έχει έως 16 ονομαστικά</span>
                        <span>🔄 Auto-Arrange ταξινομεί αυτόματα ανά σελίδα</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OnomastikoModal