// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabUserSettings.tsx
'use client'

import React, { useState } from 'react'
import SignaturesModal from './SignaturesModal'
import ChangePasswordModal from './ChangePasswordModal'

interface SettingsTabUserSettingsProps {
    darkMode: boolean
    onMessage?: (type: 'success' | 'error', text: string) => void
}

const SettingsTabUserSettings: React.FC<SettingsTabUserSettingsProps> = ({
    darkMode,
    onMessage
}) => {
    const [showSignaturesModal, setShowSignaturesModal] = useState(false)
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

    return (
        <div className="space-y-6">
            {/* Υπογραφές Section */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📝</span>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Υπογραφές
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                }`}>
                                Administrator, President, Manager
                            </span>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Διαχείριση των υπογραφών για τις εξαγωγές σε Excel (Βιβλίο Υλικού, Πρωτόκολλο, Πλήρης Εξαγωγή).
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSignaturesModal(true)}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex-shrink-0 ${darkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        ✏️ Επεξεργασία
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Αλλαγή Κωδικού Section */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🔑</span>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Αλλαγή Κωδικού
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                Ασφάλεια
                            </span>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Αλλάξτε τον κωδικό πρόσβασής σας για μεγαλύτερη ασφάλεια.
                            Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowChangePasswordModal(true)}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex-shrink-0 ${darkMode
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            }`}
                    >
                        🔑 Αλλαγή
                    </button>
                </div>
            </div>

            {/* Signatures Modal */}
            <SignaturesModal
                isOpen={showSignaturesModal}
                onClose={() => setShowSignaturesModal(false)}
                darkMode={darkMode}
                onMessage={onMessage}
            />

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                darkMode={darkMode}
                onMessage={onMessage}
            />
        </div>
    )
}

export default SettingsTabUserSettings