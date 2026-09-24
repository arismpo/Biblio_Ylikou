// C:\Biblio_Ylikou_NEW\src\components\modals\ChangePasswordModal.tsx
'use client'

import React, { useState } from 'react'
import axios from 'axios'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
    darkMode: boolean
    onMessage?: (type: 'success' | 'error', text: string) => void
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    isOpen,
    onClose,
    darkMode,
    onMessage
}) => {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!currentPassword) {
            if (onMessage) onMessage('error', 'Παρακαλώ εισάγετε τον τρέχον κωδικό')
            return
        }

        if (newPassword.length < 6) {
            if (onMessage) onMessage('error', 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
            return
        }

        if (newPassword !== confirmPassword) {
            if (onMessage) onMessage('error', 'Οι κωδικοί δεν ταιριάζουν')
            return
        }

        setLoading(true)

        try {
            const response = await axios.post('/api/change-password', {
                currentPassword,
                newPassword
            })

            if (onMessage) onMessage('success', response.data.message)

            // Clear form
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')

            // Close modal after success
            setTimeout(() => {
                onClose()
            }, 1500)

        } catch (error: any) {
            console.error('Change password error:', error)

            let errorMessage = 'Σφάλμα κατά την αλλαγή κωδικού'

            if (error.response) {
                // The request was made and the server responded with a status code
                if (error.response.status === 401) {
                    errorMessage = 'Ο τρέχων κωδικός δεν είναι σωστός'
                } else if (error.response.status === 404) {
                    errorMessage = 'Ο χρήστης δεν βρέθηκε'
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'Δεν υπάρχει σύνδεση με τον server'
            }

            if (onMessage) onMessage('error', errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
            <div className={`w-full max-w-md rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        🔑 Αλλαγή Κωδικού
                    </h2>
                    <button
                        onClick={onClose}
                        className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Τρέχων Κωδικός *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`w-full border rounded-md px-3 py-2 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Εισάγετε τον τρέχον κωδικό"
                                required
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Νέος Κωδικός *
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className={`w-full border rounded-md px-3 py-2 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Εισάγετε τον νέο κωδικό (τουλάχιστον 6 χαρακτήρες)"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Επιβεβαίωση Νέου Κωδικού *
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className={`w-full border rounded-md px-3 py-2 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Επιβεβαιώστε τον νέο κωδικό"
                            required
                        />
                    </div>

                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        💡 Ο προεπιλεγμένος κωδικός είναι <strong>admin123</strong>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded ${darkMode
                                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                                } transition-colors`}
                        >
                            Ακύρωση
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded text-white font-medium transition-colors ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? '⏳ Αποθήκευση...' : '💾 Αποθήκευση'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ChangePasswordModal