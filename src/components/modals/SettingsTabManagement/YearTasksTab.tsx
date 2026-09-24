// C:\Biblio_Ylikou_NEW\src\components\modals\SettingsTabManagement\YearTasksTab.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import YearClosingModal from '@/components/modals/YearClosingModal'

interface YearTasksTabProps {
    darkMode: boolean
    selectedYear: number
    onMessage?: (type: 'success' | 'error' | 'warning', text: string) => void
}

const YearTasksTab: React.FC<YearTasksTabProps> = ({
    darkMode,
    selectedYear,
    onMessage
}) => {
    const router = useRouter()
    const [showClosingModal, setShowClosingModal] = useState(false)

    const handleYearOpening = () => {
        router.push('/year-opening-wizard')
    }

    const handleYearDelete = () => {
        router.push(`/config/year-delete?year=${selectedYear}`)
    }

    const handleYearClosing = () => {
        setShowClosingModal(true)
    }

    return (
        <>
            <div className="space-y-4">
                <div className={`rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">📅</span>
                        <div>
                            <h4 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                Εργασίες Έτους
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Διαχείριση έτους: Άνοιγμα, Κλείσιμο, Διαγραφή
                            </p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            📌 Οι εργασίες έτους σας επιτρέπουν να:
                        </p>
                        <ul className={`text-sm list-disc list-inside mt-2 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <li><strong>📅 Άνοιγμα Έτους:</strong> Δημιουργία νέου έτους με αντιγραφή της δομής από προηγούμενο έτος</li>
                            <li><strong>🔒 Κλείσιμο Έτους:</strong> Κλείδωμα έτους, εξαγωγές, έλεγχος συνημμένων</li>
                            <li><strong>🗑️ Διαγραφή Έτους:</strong> Οριστική διαγραφή όλων των δεδομένων ενός έτους (ΜΗ ΑΝΑΣΤΡΕΨΙΜΟ)</li>
                        </ul>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Άνοιγμα Έτους */}
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${darkMode
                                    ? 'bg-green-900/20 border-green-700 hover:bg-green-900/40'
                                    : 'bg-green-50 border-green-300 hover:bg-green-100'
                                }`}
                            onClick={handleYearOpening}
                        >
                            <div className="flex flex-col items-center text-center gap-2">
                                <span className="text-4xl">🚀</span>
                                <h5 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                                    Άνοιγμα Έτους
                                </h5>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Δημιουργία νέου έτους με αντιγραφή δομής
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-200 text-green-700'
                                    }`}>
                                    Οδηγός
                                </span>
                            </div>
                        </div>

                        {/* Κλείσιμο Έτους */}
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${darkMode
                                    ? 'bg-yellow-900/20 border-yellow-700 hover:bg-yellow-900/40'
                                    : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                                }`}
                            onClick={handleYearClosing}
                        >
                            <div className="flex flex-col items-center text-center gap-2">
                                <span className="text-4xl">🔒</span>
                                <h5 className={`font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                                    Κλείσιμο Έτους
                                </h5>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Κλείδωμα, εξαγωγές, έλεγχος συνημμένων
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-200 text-yellow-700'
                                    }`}>
                                    Modal
                                </span>
                            </div>
                        </div>

                        {/* Διαγραφή Έτους */}
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${darkMode
                                    ? 'bg-red-900/20 border-red-700 hover:bg-red-900/40'
                                    : 'bg-red-50 border-red-300 hover:bg-red-100'
                                }`}
                            onClick={handleYearDelete}
                        >
                            <div className="flex flex-col items-center text-center gap-2">
                                <span className="text-4xl">🗑️</span>
                                <h5 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                                    Διαγραφή Έτους
                                </h5>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Οριστική διαγραφή όλων των δεδομένων
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-red-900 text-red-300' : 'bg-red-200 text-red-700'
                                    }`}>
                                    ⚠️ ΜΗ ΑΝΑΣΤΡΕΨΙΜΟ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Current Year Info */}
                    <div className={`mt-4 p-3 rounded-lg text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <p className="font-medium mb-1">ℹ️ Τρέχον Έτος</p>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded font-bold ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-200 text-blue-700'
                                }`}>
                                {selectedYear}
                            </span>
                            <span>Οι εργασίες θα εφαρμοστούν στο παραπάνω έτος</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Year Closing Modal */}
            <YearClosingModal
                isOpen={showClosingModal}
                onClose={() => setShowClosingModal(false)}
                darkMode={darkMode}
                selectedYear={selectedYear}
                onMessage={onMessage}
            />
        </>
    )
}

export default YearTasksTab