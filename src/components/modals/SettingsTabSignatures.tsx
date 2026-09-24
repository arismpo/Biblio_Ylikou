'use client'

import React, { useState, useEffect } from 'react'

interface Signature {
    rank: string
    am: string
    fullName: string
    fatherName: string
    formatted: string
}

interface SignatureConfig {
    administrator: Signature
    president: Signature
    manager: Signature
    sameAsAdministrator: boolean
}

interface SettingsTabSignaturesProps {
    darkMode: boolean
}

const ranks = [
    'Αρχιπυροσβέστης',
    'Πυρονόμος',
    'Ανθυποπυραγός',
    'Υποπυραγός',
    'Πυραγός',
    'Επιπυραγός',
    'Αντιπύραρχος',
    'Πύραρχος',
    'Αρχιπύραρχος'
]

const SettingsTabSignatures: React.FC<SettingsTabSignaturesProps> = ({ darkMode }) => {
    const [signatures, setSignatures] = useState<SignatureConfig>(() => {
        const saved = localStorage.getItem('signatureConfig')
        if (saved) {
            return JSON.parse(saved)
        }
        return {
            administrator: {
                rank: 'Πύραρχος',
                am: '10064',
                fullName: 'Κόλλας Νικόλαος',
                fatherName: 'Γεωργίου',
                formatted: ''
            },
            president: {
                rank: 'Πύραρχος',
                am: '10064',
                fullName: 'Κόλλας Νικόλαος',
                fatherName: 'Γεωργίου',
                formatted: ''
            },
            manager: {
                rank: 'Υποπυραγός',
                am: '13783',
                fullName: 'Μπόγδος Νεκτάριος',
                fatherName: 'Κωνσταντίνου',
                formatted: ''
            },
            sameAsAdministrator: true
        }
    })

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Update formatted text whenever fields change
    useEffect(() => {
        updateFormattedText('administrator')
        if (!signatures.sameAsAdministrator) {
            updateFormattedText('president')
        } else {
            setSignatures(prev => ({
                ...prev,
                president: {
                    ...prev.president,
                    formatted: prev.administrator.formatted
                }
            }))
        }
        updateFormattedText('manager')
    }, [
        signatures.administrator.rank,
        signatures.administrator.am,
        signatures.administrator.fullName,
        signatures.administrator.fatherName,
        signatures.president.rank,
        signatures.president.am,
        signatures.president.fullName,
        signatures.president.fatherName,
        signatures.manager.rank,
        signatures.manager.am,
        signatures.manager.fullName,
        signatures.manager.fatherName,
        signatures.sameAsAdministrator
    ])

    const updateFormattedText = (type: 'administrator' | 'president' | 'manager') => {
        const person = signatures[type]
        const formatted = `${person.rank} (${person.am}) ${person.fullName} του ${person.fatherName}`
        setSignatures(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                formatted: formatted
            }
        }))
    }

    const handleAdministratorChange = (field: keyof Signature, value: string) => {
        setSignatures(prev => ({
            ...prev,
            administrator: {
                ...prev.administrator,
                [field]: value
            }
        }))

        if (signatures.sameAsAdministrator) {
            setSignatures(prev => ({
                ...prev,
                president: {
                    ...prev.president,
                    [field]: value
                }
            }))
        }
    }

    const handlePresidentChange = (field: keyof Signature, value: string) => {
        setSignatures(prev => ({
            ...prev,
            president: {
                ...prev.president,
                [field]: value
            }
        }))
    }

    const handleManagerChange = (field: keyof Signature, value: string) => {
        setSignatures(prev => ({
            ...prev,
            manager: {
                ...prev.manager,
                [field]: value
            }
        }))
    }

    const handleSave = () => {
        localStorage.setItem('signatureConfig', JSON.stringify(signatures))
        setMessage({ type: 'success', text: 'Οι υπογραφές αποθηκεύτηκαν επιτυχώς!' })
        setTimeout(() => setMessage(null), 3000)
    }

    const handleReset = () => {
        if (!confirm('Επαναφορά στις προεπιλεγμένες υπογραφές;')) return

        const defaults = {
            administrator: {
                rank: 'Πύραρχος',
                am: '10064',
                fullName: 'Κόλλας Νικόλαος',
                fatherName: 'Γεωργίου',
                formatted: ''
            },
            president: {
                rank: 'Πύραρχος',
                am: '10064',
                fullName: 'Κόλλας Νικόλαος',
                fatherName: 'Γεωργίου',
                formatted: ''
            },
            manager: {
                rank: 'Υποπυραγός',
                am: '13783',
                fullName: 'Μπόγδος Νεκτάριος',
                fatherName: 'Κωνσταντίνου',
                formatted: ''
            },
            sameAsAdministrator: true
        }
        setSignatures(defaults)
        localStorage.setItem('signatureConfig', JSON.stringify(defaults))
        setMessage({ type: 'success', text: 'Οι υπογραφές επαναφέρθηκαν!' })
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    📝 Ρυθμίσεις Υπογραφών
                </h3>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Αποθηκεύονται αυτόματα στο localStorage
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Administrator Section */}
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                <h4 className={`text-md font-semibold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    1. Ο Διοικητής
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Βαθμός
                        </label>
                        <select
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.administrator.rank}
                            onChange={(e) => handleAdministratorChange('rank', e.target.value)}
                        >
                            {ranks.map(rank => (
                                <option key={rank} value={rank}>{rank}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Αριθμός Μητρώου (ΑΜ)
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.administrator.am}
                            onChange={(e) => handleAdministratorChange('am', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Επίθετο και Όνομα
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.administrator.fullName}
                            onChange={(e) => handleAdministratorChange('fullName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Όνομα Πατρός
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.administrator.fatherName}
                            onChange={(e) => handleAdministratorChange('fatherName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Μορφή Υπογραφής
                        </label>
                        <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md font-mono text-sm`}>
                            {signatures.administrator.formatted || 'Πύραρχος (10064) Κόλλας Νικόλαος του Γεωργίου'}
                        </div>
                    </div>
                </div>
            </div>

            {/* President Section */}
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-md font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        2. Ο Πρόεδρος του Οικονομικού Συμβουλίου
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={signatures.sameAsAdministrator}
                            onChange={(e) => {
                                setSignatures(prev => ({
                                    ...prev,
                                    sameAsAdministrator: e.target.checked,
                                    president: e.target.checked ? { ...prev.administrator } : prev.president
                                }))
                            }}
                            className="w-4 h-4"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Ίδιος με τον Διοικητή
                        </span>
                    </label>
                </div>

                {!signatures.sameAsAdministrator && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Βαθμός
                            </label>
                            <select
                                className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={signatures.president.rank}
                                onChange={(e) => handlePresidentChange('rank', e.target.value)}
                            >
                                {ranks.map(rank => (
                                    <option key={rank} value={rank}>{rank}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Αριθμός Μητρώου (ΑΜ)
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={signatures.president.am}
                                onChange={(e) => handlePresidentChange('am', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Επίθετο και Όνομα
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={signatures.president.fullName}
                                onChange={(e) => handlePresidentChange('fullName', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Όνομα Πατρός
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                value={signatures.president.fatherName}
                                onChange={(e) => handlePresidentChange('fatherName', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Μορφή Υπογραφής
                            </label>
                            <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md font-mono text-sm`}>
                                {signatures.president.formatted}
                            </div>
                        </div>
                    </div>
                )}

                {signatures.sameAsAdministrator && (
                    <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md font-mono text-sm`}>
                        {signatures.administrator.formatted}
                    </div>
                )}
            </div>

            {/* Manager Section */}
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                <h4 className={`text-md font-semibold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    3. Ο Διαχειριστής Υλικού
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Βαθμός
                        </label>
                        <select
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.manager.rank}
                            onChange={(e) => handleManagerChange('rank', e.target.value)}
                        >
                            {ranks.map(rank => (
                                <option key={rank} value={rank}>{rank}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Αριθμός Μητρώου (ΑΜ)
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.manager.am}
                            onChange={(e) => handleManagerChange('am', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Επίθετο και Όνομα
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.manager.fullName}
                            onChange={(e) => handleManagerChange('fullName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Όνομα Πατρός
                        </label>
                        <input
                            type="text"
                            className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            value={signatures.manager.fatherName}
                            onChange={(e) => handleManagerChange('fatherName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Μορφή Υπογραφής
                        </label>
                        <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md font-mono text-sm`}>
                            {signatures.manager.formatted || 'Υποπυραγός (13783) Μπόγδος Νεκτάριος του Κωνσταντίνου'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-3 pt-4 border-t dark:border-gray-700">
                <button
                    onClick={handleReset}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors text-sm`}
                >
                    🔄 Επαναφορά
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                    💾 Αποθήκευση
                </button>
            </div>
        </div>
    )
}

export default SettingsTabSignatures